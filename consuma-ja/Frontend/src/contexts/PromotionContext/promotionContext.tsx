import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CategoriaItem {
  categoria_id: number;
  categoria_nome: string;
}

interface PromotionContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedQuery: string;
  searchType: 'produto' | 'fornecedor' | 'promocao';
  setSearchType: (type: 'produto' | 'fornecedor' | 'promocao') => void;
  performSearch: () => void;
  setPerformSearch: (fn: () => void) => void;
  selectedCategoriaId: number | undefined;
  setSelectedCategoriaId: (id: number | undefined) => void;
  categoriasFiltro: CategoriaItem[];
  setCategoriasFiltro: (categorias: CategoriaItem[]) => void;
  selectedFilters: any[];
  setSelectedFilters: React.Dispatch<React.SetStateAction<any[]>>;
  isSearching: boolean;
}

const PromotionContext = createContext<PromotionContextType | undefined>(undefined);

export const usePromotion = () => {
  const context = useContext(PromotionContext);
  if (!context) {
    throw new Error('usePromotion must be used within a PromotionProvider');
  }
  return context;
};

interface PromotionProviderProps {
  children: ReactNode;
}

export const PromotionProvider: React.FC<PromotionProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchType, setSearchType] = useState<'produto' | 'fornecedor' | 'promocao'>('promocao');
  const [performSearch, setPerformSearch] = useState<() => void>(() => {});
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | undefined>(undefined);
  const [categoriasFiltro, setCategoriasFiltro] = useState<CategoriaItem[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce para searchQuery
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Chama performSearch quando debouncedQuery muda
  useEffect(() => {
    if (performSearch && typeof performSearch === 'function') {
      performSearch();
    }
  }, [debouncedQuery, performSearch]);

  return (
    <PromotionContext.Provider value={{
      searchQuery,
      setSearchQuery,
      debouncedQuery,
      searchType,
      setSearchType,
      performSearch,
      setPerformSearch,
      selectedCategoriaId,
      setSelectedCategoriaId,
      categoriasFiltro,
      setCategoriasFiltro,
      selectedFilters,
      setSelectedFilters,
      isSearching,
    }}>
      {children}
    </PromotionContext.Provider>
  );
};