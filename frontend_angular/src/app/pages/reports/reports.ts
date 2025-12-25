import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService, TransactionType, DashboardAnalysis } from '../../services/transaction';

interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

@Component({
  selector: 'app-reports',
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class ReportsComponent {
  transactionService = inject(TransactionService);

  // UI State
  selectedMonth = signal(new Date().toISOString().split('T')[0].slice(0, 7));
  reportType = signal<'summary' | 'category' | 'monthly'>('summary');

  get dashboardData() {
    return this.transactionService.dashboardData;
  }

  get transactions() {
    return this.transactionService.transactions;
  }

  get isLoading() {
    return this.transactionService.isLoading;
  }

  get error() {
    return this.transactionService.error;
  }

  /**
   * Obtiene gastos por categoría
   */
  get expensesByCategory(): CategorySummary[] {
    const expenses = this.transactions().filter(t => t.type === 'expense');
    const categoryMap = new Map<string, { total: number; count: number }>();

    expenses.forEach(t => {
      const existing = categoryMap.get(t.category) || { total: 0, count: 0 };
      categoryMap.set(t.category, {
        total: existing.total + t.amount,
        count: existing.count + 1
      });
    });

    const totalExpenses = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.total, 0);

    return Array.from(categoryMap.entries())
      .map(([category, { total, count }]) => ({
        category,
        total,
        count,
        percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);
  }

  /**
   * Obtiene ingresos por categoría
   */
  get incomeByCategory(): CategorySummary[] {
    const incomes = this.transactions().filter(t => t.type === 'income');
    const categoryMap = new Map<string, { total: number; count: number }>();

    incomes.forEach(t => {
      const existing = categoryMap.get(t.category) || { total: 0, count: 0 };
      categoryMap.set(t.category, {
        total: existing.total + t.amount,
        count: existing.count + 1
      });
    });

    const totalIncomes = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.total, 0);

    return Array.from(categoryMap.entries())
      .map(([category, { total, count }]) => ({
        category,
        total,
        count,
        percentage: totalIncomes > 0 ? (total / totalIncomes) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);
  }

  /**
   * Obtiene datos mensuales
   */
  get monthlyData() {
    const year = parseInt(this.selectedMonth().split('-')[0]);
    const month = parseInt(this.selectedMonth().split('-')[1]);

    const monthTransactions = this.transactions().filter(t => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() === year && tDate.getMonth() + 1 === month;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      net: income - expenses,
      transactionCount: monthTransactions.length
    };
  }

  /**
   * Formatea número como moneda
   */
  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  /**
   * Obtiene color para una categoría (para gráficos)
   */
  getCategoryColor(index: number): string {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'
    ];
    return colors[index % colors.length];
  }

  /**
   * Exporta a PDF (placeholder - en real se usaría una librería como jsPDF)
   */
  exportToPDF(): void {
    alert('Funcionalidad de exportación a PDF será implementada pronto. Se usará la librería jsPDF + Chart.js para generar reportes detallados.');
  }

  /**
   * Descarga CSV
   */
  downloadCSV(): void {
    const headers = ['Fecha', 'Categoría', 'Tipo', 'Monto', 'Descripción'];
    const rows = this.transactions().map(t => [
      t.date,
      t.category,
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      t.amount.toFixed(2),
      t.description
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `reportes-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
