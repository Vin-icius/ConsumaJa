import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import cartService, { CartItemApi, CartViewApiResponse } from '../../services/cartService';
import { resolveProductImageUrl } from '../../utils/image';
import { useApplication } from '../ApplicationContext/ApplicationContext';

export interface CartItem {
  cartItemId: number;
  produtoId: number;
  produtoNome: string;
  produtoImagemUrl: string | null;
  loteId: number;
  loteCodigo: string;
  promocaoId: number | null;
  fornecedorNome: string | null;
  fornecedorPessoaId: number | null;
  quantidade: number;
  unitPrice: number;
  maxQuantidade: number;
  isOutOfStock: boolean;
}

interface AddCartItemInput {
  produtoId: number;
  loteId: number;
  promocaoId: number;
  quantidade: number;
}

interface CartContextType {
  cartItems: CartItem[];
  totalItems: number;
  totalValue: number;
  loading: boolean;
  addToCart: (payload: AddCartItemInput) => Promise<void>;
  updateQuantity: (cartItemId: number, quantidade: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalValue: () => number;
  isInCart: (produtoId: number, loteId: number) => boolean;
  refreshCart: () => Promise<void>;
}

interface CartProviderProps {
  children: ReactNode;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const EMPTY_CART: CartViewApiResponse = { items: [], total_items: 0, total_value: 0 };

const mapApiItemToCartItem = (item: CartItemApi): CartItem => ({
  cartItemId: item.cart_item_id,
  produtoId: item.produto_id,
  produtoNome: item.produto_nome,
  produtoImagemUrl: resolveProductImageUrl(item.produto_imagem_url),
  loteId: item.lote_id,
  loteCodigo: item.lote_codigo,
  promocaoId: item.promocao_id,
  fornecedorNome: item.fornecedor_nome,
  fornecedorPessoaId: item.fornecedor_pessoa_id,
  quantidade: item.quantidade,
  unitPrice: item.unit_price,
  maxQuantidade: item.max_quantidade,
  isOutOfStock: item.is_out_of_stock,
});

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pessoaId, setPessoaId] = useState<number | null>(null);
  const { user: applicationUser, validateActiveSession } = useApplication();
  const applicationPessoaId = applicationUser?.pessoa_id ?? null;

  const applyCartState = useCallback((cart: CartViewApiResponse) => {
    const items = Array.isArray(cart.items) ? cart.items : [];
    setCartItems(items.map(mapApiItemToCartItem));
    setTotalItems(Number(cart.total_items) || 0);
    setTotalValue(Number(cart.total_value) || 0);
  }, []);

  useEffect(() => {
    setPessoaId(applicationUser?.pessoa_id ?? null);
  }, [applicationUser?.pessoa_id]);

  const syncUserAndCart = useCallback(async () => {
    setLoading(true);
    try {
      let userId = applicationPessoaId;

      if (!userId) {
        const currentUser = await validateActiveSession();
        userId = currentUser?.pessoa_id ?? null;
      }
      setPessoaId(userId);

      if (!userId) {
        applyCartState(EMPTY_CART);
        return;
      }

      const cart = await cartService.getCartByPessoa(userId);
      applyCartState(cart);
    } catch (error) {
      console.error('[CartContext] Erro ao carregar carrinho:', error);
      applyCartState(EMPTY_CART);
    } finally {
      setLoading(false);
    }
  }, [applicationPessoaId, validateActiveSession, applyCartState]);

  useEffect(() => {
    syncUserAndCart();
  }, [syncUserAndCart]);

  const ensureUser = useCallback(async (): Promise<number> => {
    if (pessoaId) {
      return pessoaId;
    }

    if (applicationPessoaId) {
      setPessoaId(applicationPessoaId);
      return applicationPessoaId;
    }

    const validatedUser = await validateActiveSession();
    const userId = validatedUser?.pessoa_id ?? null;

    if (!userId) {
      throw new Error('Usuário não autenticado. Faça login para utilizar o carrinho.');
    }

    setPessoaId(userId);
    return userId;
  }, [pessoaId, applicationPessoaId, validateActiveSession]);

  const addToCart = useCallback(async (payload: AddCartItemInput) => {
    const userId = await ensureUser();
    try {
      const response = await cartService.addItemToCart({
        pessoa_id: userId,
        produto_id: payload.produtoId,
        promocao_id: payload.promocaoId,
        lote_id: payload.loteId,
        quantidade: payload.quantidade,
      });
      applyCartState(response.cart);
    } catch (error) {
      console.error('[CartContext] Erro ao adicionar item ao carrinho:', error);
      throw error;
    }
  }, [applyCartState, ensureUser]);

  const updateQuantity = useCallback(async (cartItemId: number, quantidade: number) => {
    const userId = await ensureUser();
    try {
      const response = await cartService.updateCartItemQuantity(cartItemId, {
        pessoa_id: userId,
        quantidade,
      });
      applyCartState(response.cart);
    } catch (error) {
      console.error('[CartContext] Erro ao atualizar quantidade do carrinho:', error);
      throw error;
    }
  }, [applyCartState, ensureUser]);

  const removeFromCart = useCallback(async (cartItemId: number) => {
    const userId = await ensureUser();
    try {
      const response = await cartService.removeCartItem(cartItemId, userId);
      applyCartState(response.cart);
    } catch (error) {
      console.error('[CartContext] Erro ao remover item do carrinho:', error);
      throw error;
    }
  }, [applyCartState, ensureUser]);

  const clearCart = useCallback(async () => {
    const userId = await ensureUser();
    try {
      const response = await cartService.clearCart(userId);
      applyCartState(response.cart);
    } catch (error) {
      console.error('[CartContext] Erro ao limpar carrinho:', error);
      throw error;
    }
  }, [applyCartState, ensureUser]);

  const refreshCart = useCallback(async () => {
    await syncUserAndCart();
  }, [syncUserAndCart]);

  const getTotalItems = useCallback(() => totalItems, [totalItems]);
  const getTotalValue = useCallback(() => totalValue, [totalValue]);

  const isInCart = useCallback(
    (produtoId: number, loteId: number) => cartItems.some((item) => item.produtoId === produtoId && item.loteId === loteId),
    [cartItems],
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        totalValue,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalValue,
        isInCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};