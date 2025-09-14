import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CategoriaItem {
  categoria_id: number;
  categoria_nome: string;
}

interface SearchContextType {
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
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchType, setSearchType] = useState<'produto' | 'fornecedor' | 'promocao'>('promocao');
  const [performSearch, setPerformSearch] = useState<() => void>(() => {});
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | undefined>(undefined);
  const [categoriasFiltro, setCategoriasFiltro] = useState<CategoriaItem[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, debouncedQuery, searchType, setSearchType, performSearch, setPerformSearch, selectedCategoriaId, setSelectedCategoriaId, categoriasFiltro, setCategoriasFiltro, selectedFilters, setSelectedFilters }}>
      {children}
    </SearchContext.Provider>
  );
};
