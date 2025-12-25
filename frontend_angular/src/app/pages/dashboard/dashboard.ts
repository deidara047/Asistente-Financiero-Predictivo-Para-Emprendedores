import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  transactionService = inject(TransactionService);

  // Exponer signals directamente al template
  dashboardData = this.transactionService.dashboardData;
  isLoading = this.transactionService.isLoading;
  error = this.transactionService.error;
}
