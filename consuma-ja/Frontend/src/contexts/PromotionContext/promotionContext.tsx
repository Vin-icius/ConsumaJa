import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PromotionContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
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
  const [selectedFilters, setSelectedFilters] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  return (
    <PromotionContext.Provider value={{
      searchQuery,
      setSearchQuery,
      selectedFilters,
      setSelectedFilters,
      isSearching,
    }}>
      {children}
    </PromotionContext.Provider>
  );
};
