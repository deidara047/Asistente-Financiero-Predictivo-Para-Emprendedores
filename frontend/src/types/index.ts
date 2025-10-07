export interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
}

export interface Alert {
  type: string;
  severity: 'critica' | 'alta' | 'media' | 'baja';
  message: string;
}