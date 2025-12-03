import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ProductStatusFilter = 'ALL' | 'APROVADO' | 'PENDENTE' | 'REJEITADO';
export type ProductActiveFilter = 'all' | 'true' | 'false';

export interface SupplierOption {
  pessoa_id: number;
  pessoa_nome: string;
}

interface ProductManagementContextValue {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  debouncedQuery: string;
  statusFilter: ProductStatusFilter;
  setStatusFilter: (value: ProductStatusFilter) => void;
  ativoFilter: ProductActiveFilter;
  setAtivoFilter: (value: ProductActiveFilter) => void;
  selectedSupplierId: number | null;
  setSelectedSupplierId: (value: number | null) => void;
  supplierOptions: SupplierOption[];
  setSupplierOptions: React.Dispatch<React.SetStateAction<SupplierOption[]>>;
  performSearch: (() => void) | null;
  setPerformSearch: React.Dispatch<React.SetStateAction<(() => void) | null>>;
  isSearching: boolean;
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
  resetFilters: () => void;
}

const ProductManagementContext = createContext<ProductManagementContextValue | undefined>(undefined);

export const useProductManagement = () => {
  const context = useContext(ProductManagementContext);
  if (!context) {
    throw new Error('useProductManagement must be used within a ProductManagementProvider');
  }
  return context;
};

interface ProductManagementProviderProps {
  children: React.ReactNode;
}

export const ProductManagementProvider: React.FC<ProductManagementProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>('ALL');
  const [ativoFilter, setAtivoFilter] = useState<ProductActiveFilter>('all');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [supplierOptions, setSupplierOptions] = useState<SupplierOption[]>([]);
  const [performSearch, setPerformSearch] = useState<(() => void) | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (typeof performSearch === 'function') {
      performSearch();
    }
  }, [debouncedQuery, statusFilter, ativoFilter, selectedSupplierId, performSearch]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setAtivoFilter('all');
    setSelectedSupplierId(null);
  };

  const value = useMemo<ProductManagementContextValue>(() => ({
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    statusFilter,
    setStatusFilter,
    ativoFilter,
    setAtivoFilter,
    selectedSupplierId,
    setSelectedSupplierId,
    supplierOptions,
    setSupplierOptions,
    performSearch,
    setPerformSearch,
    isSearching,
    setIsSearching,
    resetFilters,
  }), [
    searchQuery,
    debouncedQuery,
    statusFilter,
    ativoFilter,
    selectedSupplierId,
    supplierOptions,
    performSearch,
    isSearching,
  ]);

  return (
    <ProductManagementContext.Provider value={value}>
      {children}
    </ProductManagementContext.Provider>
  );
};
