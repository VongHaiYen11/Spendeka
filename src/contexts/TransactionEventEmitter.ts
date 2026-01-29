/**
 * Simple event emitter for transaction updates
 * Used to notify all components when transactions are added/deleted
 */
type TransactionUpdateListener = () => void;

class TransactionEventEmitter {
  private listeners: Set<TransactionUpdateListener> = new Set();

  subscribe(listener: TransactionUpdateListener): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const transactionEventEmitter = new TransactionEventEmitter();
