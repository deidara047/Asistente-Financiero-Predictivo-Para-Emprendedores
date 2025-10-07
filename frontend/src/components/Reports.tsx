'use client'

import React from 'react';
import type { Transaction } from '../types';

// Mock para demo; calcula reales basados en transactions
interface ReportsProps {
  transactions: Transaction[];
}

const Reports: React.FC<ReportsProps> = ({ transactions }) => {
  // Ejemplo de cálculos
  const monthlyReport = 'Resumen: Ingresos 5000, Gastos 3000, Ahorro 2000';
  const comparativeReport = 'Gastos este mes: +10% vs anterior';
  const habitsReport = 'Días con más gasto: Lunes y Viernes';

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reportes</h1>
      <h2 className="text-lg font-semibold">Reporte Mensual</h2>
      <p>{monthlyReport}</p>
      <h2 className="text-lg font-semibold">Reporte Comparativo</h2>
      <p>{comparativeReport}</p>
      <h2 className="text-lg font-semibold">Reporte de Hábitos</h2>
      <p>{habitsReport}</p>
    </div>
  );
};

export default Reports;