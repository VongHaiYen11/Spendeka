import { getDatabaseTransactions } from "@/services/ExpenseService";
import { DatabaseTransaction } from "@/types/expense";
import { transactionEventEmitter } from "./TransactionEventEmitter";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface TransactionContextType {
  transactions: DatabaseTransaction[];
  isLoading: boolean;
  reloadTransactions: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  /** Add a transaction to the list immediately (optimistic); persist to DB separately */
  addTransactionOptimistic: (transaction: DatabaseTransaction) => void;
  /** Remove an optimistically added transaction (e.g. when background save fails) */
  removeOptimisticTransaction: (id: string) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<DatabaseTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedTransactions = await getDatabaseTransactions();
      setTransactions(loadedTransactions);
    } catch (error) {
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reload transactions (public method)
  const reloadTransactions = useCallback(async () => {
    await loadTransactions();
  }, [loadTransactions]);

  // Refresh transactions silently (for background updates)
  const refreshTransactions = useCallback(async () => {
    try {
      const loadedTransactions = await getDatabaseTransactions();
      setTransactions(loadedTransactions);
    } catch (error) {
      // Silently handle errors during refresh
    }
  }, []);

  const addTransactionOptimistic = useCallback((transaction: DatabaseTransaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  }, []);

  const removeOptimisticTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Subscribe to transaction updates
  useEffect(() => {
    const unsubscribe = transactionEventEmitter.subscribe(() => {
      refreshTransactions();
    });
    return unsubscribe;
  }, [refreshTransactions]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        isLoading,
        reloadTransactions,
        refreshTransactions,
        addTransactionOptimistic,
        removeOptimisticTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
};
