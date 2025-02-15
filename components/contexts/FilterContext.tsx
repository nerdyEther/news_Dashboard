
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface FilterValues {
  search: string;
  author: string;
  type: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

interface FilterContextType {
  filters: FilterValues;
  updateFilters: (newFilters: FilterValues) => void;
  resetFilters: () => void;
}

const defaultFilters: FilterValues = {
  search: '',
  author: '',
  type: 'all',
  dateRange: {
    from: undefined,
    to: undefined
  }
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);

  const updateFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <FilterContext.Provider 
      value={{ 
        filters, 
        updateFilters, 
        resetFilters 
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  
  return context;
}


export { defaultFilters };