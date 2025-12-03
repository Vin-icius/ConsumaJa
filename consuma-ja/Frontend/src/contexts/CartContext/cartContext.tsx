import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
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

export interface AddCartItemInput {
  produtoId: number;
  loteId: number;
  promocaoId: number | null;
  quantidade: number;
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (payload: AddCartItemInput) => Promise<void>;
  updateQuantity: (cartItemId: number, quantidade: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalValue: () => number;
  isInCart: (produtoId: number, loteId: number) => boolean;
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

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pessoaId, setPessoaId] = useState<number | null>(null);

  const { user: applicationUser, validateActiveSession } = useApplication();
  const applicationPessoaId = applicationUser?.pessoa_id ?? null;

  const applyCartState = useCallback((payload: CartViewApiResponse | null | undefined) => {
    const sourceItems = (Array.isArray(payload?.items) ? payload?.items : []) as CartItemApi[];
    const normalizedItems = sourceItems.map(mapApiItemToCartItem);
    setCartItems(normalizedItems);

    const computedTotals = normalizedItems.reduce(
      (acc, item) => {
        acc.items += item.quantidade;
        acc.value += item.quantidade * item.unitPrice;
        return acc;
      },
      { items: 0, value: 0 },
    );

    setTotalItems(payload?.total_items ?? computedTotals.items);
    setTotalValue(payload?.total_value ?? computedTotals.value);
  }, []);

  const syncUserAndCart = useCallback(async () => {
    setLoading(true);
    try {
      let targetPessoaId = applicationPessoaId;

      if (!targetPessoaId) {
        const sessionUser = await validateActiveSession();
        targetPessoaId = sessionUser?.pessoa_id ?? null;
      }

      setPessoaId(targetPessoaId);

      if (!targetPessoaId) {
        applyCartState(EMPTY_CART);
        return;
      }

      const cartSnapshot = await cartService.getCartByPessoa(targetPessoaId);
      applyCartState(cartSnapshot);
    } catch (error) {
      console.error('[CartContext] Falha ao carregar carrinho:', error);
      applyCartState(EMPTY_CART);
    } finally {
      setLoading(false);
    }
  }, [applicationPessoaId, applyCartState, validateActiveSession]);

  useEffect(() => {
    setPessoaId(applicationUser?.pessoa_id ?? null);
  }, [applicationUser?.pessoa_id]);

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

    const activeUser = await validateActiveSession();
    const resolvedPessoaId = activeUser?.pessoa_id ?? null;

    if (!resolvedPessoaId) {
      throw new Error('Usuário não autenticado. Faça login para utilizar o carrinho.');
    }

    setPessoaId(resolvedPessoaId);
    return resolvedPessoaId;
  }, [applicationPessoaId, pessoaId, validateActiveSession]);

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
      console.error('[CartContext] Falha ao adicionar item ao carrinho:', error);
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
      console.error('[CartContext] Falha ao atualizar item do carrinho:', error);
      throw error;
    }
  }, [applyCartState, ensureUser]);

  const removeFromCart = useCallback(async (cartItemId: number) => {
    const userId = await ensureUser();
    try {
      const response = await cartService.removeCartItem(cartItemId, userId);
      applyCartState(response.cart);
    } catch (error) {
      console.error('[CartContext] Falha ao remover item do carrinho:', error);
      throw error;
    }
  }, [applyCartState, ensureUser]);

  const clearCart = useCallback(async () => {
    const userId = await ensureUser();
    try {
      const response = await cartService.clearCart(userId);
      applyCartState(response.cart);
    } catch (error) {
      console.error('[CartContext] Falha ao limpar o carrinho:', error);
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

  const contextValue = useMemo<CartContextType>(() => ({
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    getTotalItems,
    getTotalValue,
    isInCart,
  }), [
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    getTotalItems,
    getTotalValue,
    isInCart,
  ]);

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};