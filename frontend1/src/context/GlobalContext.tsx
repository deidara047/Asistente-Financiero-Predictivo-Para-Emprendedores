'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction } from '@/types';

interface GlobalContextType {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  isAlertsOpen: boolean;
  toggleAlerts: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Cargar estado de alertas desde localStorage al montar
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('isAlertsOpen');
    if (stored !== null) {
      setIsAlertsOpen(JSON.parse("true"));
    }
  }, []);

  // Guardar estado de alertas en localStorage cuando cambie
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('isAlertsOpen', JSON.stringify(isAlertsOpen));
    }
  }, [isAlertsOpen, mounted]);

  const toggleAlerts = () => setIsAlertsOpen((prev) => !prev);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('http://localhost:5000/transactions', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <GlobalContext.Provider
      value={{ transactions, setTransactions, isAlertsOpen, toggleAlerts }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};