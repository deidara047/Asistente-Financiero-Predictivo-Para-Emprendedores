import { Injectable, signal } from '@angular/core';

export interface TransactionType {
  id?: string;
  date: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
}

export interface DashboardAnalysis {
  total_income: number;
  total_expense: number;
  net_gain: number;
  avg_monthly_income: number;
  avg_monthly_expense: number;
  unspent_percentage: number;
  expense_comparison: string;
  top_category: string;
  top_days: string[];
}

export interface DashboardData {
  analysis: DashboardAnalysis;
  prediction: number;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly API_BASE = 'http://localhost:5000';

  // Signals para estado global
  transactions = signal<TransactionType[]>([]);
  dashboardData = signal<DashboardData>({
    analysis: {
      total_income: 0,
      total_expense: 0,
      net_gain: 0,
      avg_monthly_income: 0,
      avg_monthly_expense: 0,
      unspent_percentage: 0,
      expense_comparison: 'N/A',
      top_category: 'N/A',
      top_days: [],
    },
    prediction: 0,
  });
  
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor() {
    this.initializeData();
  }

  /**
   * Inicializa los datos al crear el servicio
   */
  private initializeData(): void {
    this.fetchTransactions();
    this.fetchDashboardData();
  }

  /**
   * Obtiene todas las transacciones del servidor
   */
  fetchTransactions(): void {
    this.isLoading.set(true);
    this.error.set(null);

    fetch(`${this.API_BASE}/transactions`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        this.transactions.set(data);
        this.isLoading.set(false);
      })
      .catch(err => {
        console.error('Error fetching transactions:', err);
        this.error.set('Error al cargar transacciones');
        this.isLoading.set(false);
      });
  }

  /**
   * Obtiene los datos del dashboard (análisis y predicción)
   */
  fetchDashboardData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    Promise.all([
      fetch(`${this.API_BASE}/analysis`, { cache: 'no-store' }).then(res => 
        res.ok ? res.json() : null
      ),
      fetch(`${this.API_BASE}/prediction`, { cache: 'no-store' }).then(res => 
        res.ok ? res.json() : null
      ),
    ])
      .then(([analysis, prediction]) => {
        const defaultAnalysis: DashboardAnalysis = {
          total_income: 0,
          total_expense: 0,
          net_gain: 0,
          avg_monthly_income: 0,
          avg_monthly_expense: 0,
          unspent_percentage: 0,
          expense_comparison: 'N/A',
          top_category: 'N/A',
          top_days: [],
        };

        this.dashboardData.set({
          analysis: analysis || defaultAnalysis,
          prediction: prediction?.predicted_expense || 0,
        });

        if (!analysis && !prediction) {
          this.error.set('No hay datos disponibles.');
        }

        this.isLoading.set(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard data:', err);
        this.error.set('Error al cargar datos del dashboard');
        this.isLoading.set(false);
      });
  }

  /**
   * Agrega una nueva transacción
   */
  addTransaction(transaction: Omit<TransactionType, 'id'>): void {
    fetch(`${this.API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    })
      .then(res => res.json())
      .then(() => {
        this.fetchTransactions();
        this.fetchDashboardData();
      })
      .catch(err => {
        console.error('Error adding transaction:', err);
        this.error.set('Error al agregar transacción');
      });
  }

  /**
   * Obtiene solo las transacciones de gasto
   */
  getExpenses() {
    return this.transactions().filter(t => t.type === 'expense');
  }

  /**
   * Obtiene solo las transacciones de ingreso
   */
  getIncomes() {
    return this.transactions().filter(t => t.type === 'income');
  }

  /**
   * Refrescar todos los datos
   */
  refresh(): void {
    this.fetchTransactions();
    this.fetchDashboardData();
  }
}
