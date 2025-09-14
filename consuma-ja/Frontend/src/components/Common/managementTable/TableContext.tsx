import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TableContextType {
  tableId: string;
  columns: number;
  setColumns: (count: number) => void;
  rows: number;
  setRows: (count: number) => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

interface TableContextProviderProps {
  children: ReactNode;
  tableId?: string;
}

export const TableContextProvider: React.FC<TableContextProviderProps> = ({
  children,
  tableId = 'default-table'
}) => {
  const [columns, setColumns] = useState(0);
  const [rows, setRows] = useState(0);

  return (
    <TableContext.Provider value={{
      tableId,
      columns,
      setColumns,
      rows,
      setRows
    }}>
      {children}
    </TableContext.Provider>
  );
};

export const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within a TableContextProvider');
  }
  return context;
};
