import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService, TransactionType } from '../../services/transaction';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class TransactionsComponent {
  transactionService = inject(TransactionService);

  // Form state
  formData = signal<Omit<TransactionType, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: 0,
    type: 'expense',
    description: ''
  });

  // UI state
  showForm = signal(false);
  filterType = signal<'all' | 'income' | 'expense'>('all');
  searchTerm = signal('');

  get transactions() {
    return this.transactionService.transactions;
  }

  get isLoading() {
    return this.transactionService.isLoading;
  }

  get error() {
    return this.transactionService.error;
  }

  get categories() {
    return ['Salario', 'Freelance', 'Otros Ingresos', 'Alimentación', 'Transporte', 'Entretenimiento', 'Utilidades', 'Otros'];
  }

  /**
   * Obtiene transacciones filtradas
   */
  get filteredTransactions(): TransactionType[] {
    let filtered = this.transactions();

    // Filtrar por tipo
    if (this.filterType() !== 'all') {
      filtered = filtered.filter(t => t.type === this.filterType());
    }

    // Filtrar por búsqueda
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term)
      );
    }

    // Ordenar por fecha descendente
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Actualiza el formulario
   */
  updateForm(field: keyof Omit<TransactionType, 'id'>, value: any): void {
    this.formData.update(form => ({
      ...form,
      [field]: value
    }));
  }

  /**
   * Envía el formulario
   */
  submitForm(): void {
    const data = this.formData();
    if (data.category && data.amount > 0) {
      this.transactionService.addTransaction(data);
      this.resetForm();
    }
  }

  /**
   * Resetea el formulario
   */
  resetForm(): void {
    this.formData.set({
      date: new Date().toISOString().split('T')[0],
      category: '',
      amount: 0,
      type: 'expense',
      description: ''
    });
    this.showForm.set(false);
  }

  /**
   * Formatea el monto como moneda
   */
  formatCurrency(amount: number, type: string): string {
    return `${type === 'income' ? '+' : '-'}$${Math.abs(amount).toFixed(2)}`;
  }

  /**
   * Formatea la fecha
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Obtiene el color para el tipo de transacción
   */
  getTypeColor(type: string): string {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  }

  /**
   * Actualiza el filtro de tipo
   */
  updateFilterType(value: string): void {
    this.filterType.set(value as 'all' | 'income' | 'expense');
  }

  /**
   * Actualiza el término de búsqueda
   */
  updateSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  /**
   * Maneja cambios en el field type
   */
  onTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.updateForm('type', value);
  }

  /**
   * Maneja cambios en el field category
   */
  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.updateForm('category', value);
  }

  /**
   * Maneja cambios en el field amount
   */
  onAmountChange(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.updateForm('amount', value);
  }

  /**
   * Maneja cambios en el field date
   */
  onDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.updateForm('date', value);
  }

  /**
   * Maneja cambios en el field description
   */
  onDescriptionChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.updateForm('description', value);
  }

  /**
   * Maneja cambios en el filtro de tipo
   */
  onFilterTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.updateFilterType(value);
  }

  /**
   * Maneja cambios en el búsqueda
   */
  onSearchTermChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.updateSearchTerm(value);
  }
}
