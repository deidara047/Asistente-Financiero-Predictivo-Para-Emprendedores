import { Routes } from '@angular/router';
import { AboutComponent } from './pages/about/about';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { TransactionsComponent } from './pages/transactions/transactions';
import { ReportsComponent } from './pages/reports/reports';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'transactions',
    component: TransactionsComponent
  },
  {
    path: 'reports',
    component: ReportsComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full'
  }
];
