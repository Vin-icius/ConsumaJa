import React from 'react';
import { SearchProvider } from '../../contexts/SearchHomeContext/searchHomeContext';
import PromotionComponent from './promotionComponent';

const PromotionScreenWrapper = () => {
  return (
    <SearchProvider>
      <PromotionComponent />
    </SearchProvider>
  );
};

export default PromotionScreenWrapper;
