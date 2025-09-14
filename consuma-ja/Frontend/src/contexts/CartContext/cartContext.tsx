import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  produto_id: number;
  produto_nome: string;
  produto_imagem_url?: string | null;
  lote_id: number;
  lote_codigo: string;
  itemPromocao_valor: number;
  quantidade: number;
  maxQuantidade: number; // estoque disponível para a promoção
  promocao_id?: number; // ID da promoção para referência
  fornecedor_nome?: string; // Nome do fornecedor
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'quantidade'> & { quantidade?: number }) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalValue: () => number;
  isInCart: (produto_id: number, lote_id: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
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

  // Gerar ID único para item do carrinho
  const generateCartItemId = (produto_id: number, lote_id: number): string => {
    return `cart_${produto_id}_${lote_id}`;
  };

  // Adicionar item ao carrinho
  const addToCart = (item: Omit<CartItem, 'id' | 'quantidade'> & { quantidade?: number }) => {
    const itemId = generateCartItemId(item.produto_id, item.lote_id);
    const quantity = item.quantidade || 1;

    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === itemId);

      if (existingItem) {
        // Se o item já existe, aumenta a quantidade
        const newQuantity = Math.min(existingItem.quantidade + quantity, existingItem.maxQuantidade);
        return prevItems.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantidade: newQuantity }
            : cartItem
        );
      } else {
        // Se é um item novo, adiciona ao carrinho
        const newItem: CartItem = {
          ...item,
          id: itemId,
          quantidade: Math.min(quantity, item.maxQuantidade),
        };
        return [...prevItems, newItem];
      }
    });
  };

  // Remover item do carrinho
  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // Atualizar quantidade de um item
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      // Se quantidade for 0 ou menor, remover o item
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantidade: Math.min(quantity, item.maxQuantidade) }
          : item
      )
    );
  };

  // Limpar carrinho
  const clearCart = () => {
    setCartItems([]);
  };

  // Obter total de itens no carrinho
  const getTotalItems = (): number => {
    return cartItems.reduce((total, item) => total + item.quantidade, 0);
  };

  // Obter valor total do carrinho
  const getTotalValue = (): number => {
    return cartItems.reduce((total, item) => total + (item.itemPromocao_valor * item.quantidade), 0);
  };

  // Verificar se um item já está no carrinho
  const isInCart = (produto_id: number, lote_id: number): boolean => {
    const itemId = generateCartItemId(produto_id, lote_id);
    return cartItems.some(item => item.id === itemId);
  };

  // Persistir carrinho no AsyncStorage (opcional - para implementar depois)
  useEffect(() => {
    // TODO: Implementar persistência do carrinho
    // const saveCartToStorage = async () => {
    //   try {
    //     await AsyncStorage.setItem('shoppingCart', JSON.stringify(cartItems));
    //   } catch (error) {
    //     console.error('Erro ao salvar carrinho:', error);
    //   }
    // };
    // saveCartToStorage();
  }, [cartItems]);

  // Carregar carrinho do AsyncStorage (opcional - para implementar depois)
  useEffect(() => {
    // TODO: Implementar carregamento do carrinho
    // const loadCartFromStorage = async () => {
    //   try {
    //     const savedCart = await AsyncStorage.getItem('shoppingCart');
    //     if (savedCart) {
    //       setCartItems(JSON.parse(savedCart));
    //     }
    //   } catch (error) {
    //     console.error('Erro ao carregar carrinho:', error);
    //   }
    // };
    // loadCartFromStorage();
  }, []);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getTotalItems,
      getTotalValue,
      isInCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};