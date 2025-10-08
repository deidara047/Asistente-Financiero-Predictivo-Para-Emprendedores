import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MonthlyData {
  month: string;
  year: number;
  income: number;
  expense: number;
  savings: number;
  top_category: string;
}

interface Monthly12Report {
  monthly_data: MonthlyData[];
  summary: {
    total_income: number;
    total_expense: number;
    total_savings: number;
    avg_monthly_income: number;
    avg_monthly_expense: number;
    avg_monthly_savings: number;
    savings_rate: number;
    best_month: {
      month: string;
      year: number;
      savings: number;
    };
    worst_month: {
      month: string;
      year: number;
      savings: number;
    };
    top_category: string;
    top_category_amount: number;
  };
  period: {
    start: string;
    end: string;
  };
}

interface ComparativeReport {
  current_expense: number;
  prev_expense: number;
  difference: number;
}

interface HabitsReport {
  top_days: number[];
  repeated_expenses: { [key: string]: number };
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatDate = (): string => {
  return new Date().toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const addHeader = (doc: jsPDF, title: string) => {
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('FinSight', 20, 18);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(200, 220, 255);
  doc.text(formatDate(), doc.internal.pageSize.width - 20, 25, { align: 'right' });
  
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(20, 45, doc.internal.pageSize.width - 20, 45);
};

const addFooter = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
    
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      'Generado por FinSight - Sistema de Gestión Financiera Personal',
      pageWidth / 2,
      pageHeight - 12,
      { align: 'center' }
    );
    
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - 20,
      pageHeight - 12,
      { align: 'right' }
    );
  }
};

export const generateMonthlyPDF = async (data: Monthly12Report): Promise<void> => {
  const doc = new jsPDF();
  
  addHeader(doc, 'Reporte Anual - Últimos 12 Meses');
  
  doc.setTextColor(0, 0, 0);
  
  // Período del reporte
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Período: ${data.period.start} - ${data.period.end}`, 20, 58);
  
  // Resumen Ejecutivo
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen Ejecutivo (12 meses)', 20, 70);
  
  const startY = 80;
  
  // Total Ingresos
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(20, startY, 85, 18, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Ingresos Totales', 25, startY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(22, 163, 74);
  doc.text(formatCurrency(data.summary.total_income), 100, startY + 7, { align: 'right' });
  
  // Total Gastos
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(254, 226, 226);
  doc.roundedRect(110, startY, 80, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Gastos Totales', 115, startY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(220, 38, 38);
  doc.text(formatCurrency(data.summary.total_expense), 185, startY + 7, { align: 'right' });
  
  // Ahorro Total
  doc.setTextColor(0, 0, 0);
  const savingsColor = data.summary.total_savings >= 0 ? [219, 234, 254] : [255, 237, 213];
  doc.setFillColor(savingsColor[0], savingsColor[1], savingsColor[2]);
  doc.roundedRect(20, startY + 22, 85, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Ahorro Total', 25, startY + 29);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(data.summary.total_savings >= 0 ? 37 : 234, data.summary.total_savings >= 0 ? 99 : 88, data.summary.total_savings >= 0 ? 235 : 12);
  doc.text(formatCurrency(data.summary.total_savings), 100, startY + 29, { align: 'right' });
  
  // Tasa de Ahorro
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(243, 232, 255);
  doc.roundedRect(110, startY + 22, 80, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Tasa de Ahorro', 115, startY + 29);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(109, 40, 217);
  doc.text(`${data.summary.savings_rate.toFixed(1)}%`, 185, startY + 29, { align: 'right' });
  
  // Promedios Mensuales
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Promedios Mensuales', 20, startY + 52);
  
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(20, startY + 58, 170, 30, 2, 2, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Ingreso Promedio:', 25, startY + 66);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(data.summary.avg_monthly_income), 70, startY + 66);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Gasto Promedio:', 25, startY + 74);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(data.summary.avg_monthly_expense), 70, startY + 74);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Ahorro Promedio:', 25, startY + 82);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(data.summary.avg_monthly_savings), 70, startY + 82);
  
  // Mejores y Peores Meses
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Análisis de Rendimiento', 20, startY + 102);
  
  // Mejor Mes
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(20, startY + 108, 80, 22, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('✓ Mejor Mes', 25, startY + 115);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`${data.summary.best_month.month} ${data.summary.best_month.year}`, 25, startY + 121);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text(formatCurrency(data.summary.best_month.savings), 95, startY + 121, { align: 'right' });
  
  // Peor Mes
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(254, 226, 226);
  doc.roundedRect(110, startY + 108, 80, 22, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text('✗ Peor Mes', 115, startY + 115);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`${data.summary.worst_month.month} ${data.summary.worst_month.year}`, 115, startY + 121);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(formatCurrency(data.summary.worst_month.savings), 185, startY + 121, { align: 'right' });
  
  // Categoría más gastada
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(255, 243, 224);
  doc.roundedRect(20, startY + 135, 170, 18, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Categoría con mayor gasto:', 25, startY + 142);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.summary.top_category}`, 85, startY + 142);
  doc.text(formatCurrency(data.summary.top_category_amount), 185, startY + 142, { align: 'right' });
  
  // Nueva página para la tabla detallada
  doc.addPage();
  addHeader(doc, 'Detalle Mensual - Últimos 12 Meses');
  
  // Crear tabla con datos mensuales
  const tableData = data.monthly_data.map(month => [
    `${month.month} ${month.year}`,
    formatCurrency(month.income),
    formatCurrency(month.expense),
    formatCurrency(month.savings),
    month.top_category
  ]);
  
  autoTable(doc, {
    startY: 55,
    head: [['Mes', 'Ingresos', 'Gastos', 'Ahorro', 'Top Categoría']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 50 }
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    margin: { left: 20, right: 20 }
  });
  
  // Recomendaciones
  const recY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFillColor(250, 245, 255);
  doc.roundedRect(20, recY, 170, 60, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(109, 40, 217);
  doc.text('Recomendaciones Financieras', 25, recY + 12);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  if (data.summary.total_savings < 0) {
    doc.text('• Tus gastos superan tus ingresos. Es urgente revisar y reducir gastos.', 25, recY + 22);
    doc.text('• Identifica gastos innecesarios y establece un presupuesto estricto.', 25, recY + 30);
    doc.text('• Busca oportunidades para aumentar tus ingresos.', 25, recY + 38);
  } else if (data.summary.savings_rate < 10) {
    doc.text('• Tu tasa de ahorro es muy baja (menos del 10%).', 25, recY + 22);
    doc.text('• Intenta reducir gastos en tu categoría principal: ' + data.summary.top_category, 25, recY + 30);
    doc.text('• Establece como meta alcanzar al menos 20% de ahorro.', 25, recY + 38);
  } else if (data.summary.savings_rate < 20) {
    doc.text('• Tu tasa de ahorro está por debajo del 20% recomendado.', 25, recY + 22);
    doc.text('• Vas bien, pero hay espacio para mejorar tus finanzas.', 25, recY + 30);
    doc.text('• Analiza tus gastos en ' + data.summary.top_category + ' para optimizar.', 25, recY + 38);
  } else {
    doc.text('• ¡Excelente! Mantienes una tasa de ahorro saludable.', 25, recY + 22);
    doc.text('• Continúa con tus buenos hábitos financieros.', 25, recY + 30);
    doc.text('• Considera invertir tus ahorros para hacerlos crecer.', 25, recY + 38);
  }
  
  addFooter(doc);
  doc.save(`FinSight_Reporte_12_Meses_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateComparativePDF = async (data: ComparativeReport): Promise<void> => {
  const doc = new jsPDF();
  
  addHeader(doc, 'Reporte Comparativo');
  
  doc.setTextColor(0, 0, 0);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Comparación Mensual de Gastos', 20, 60);
  
  const barY = 75;
  const barHeight = 80;
  const maxAmount = Math.max(data.current_expense, data.prev_expense);
  
  const prevHeight = (data.prev_expense / maxAmount) * barHeight;
  doc.setFillColor(167, 139, 250);
  doc.roundedRect(40, barY + barHeight - prevHeight, 50, prevHeight, 2, 2, 'F');
  doc.setFontSize(10);
  doc.text('Mes Anterior', 65, barY + barHeight + 10, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(formatCurrency(data.prev_expense), 65, barY + barHeight + 18, { align: 'center' });
  
  const currHeight = (data.current_expense / maxAmount) * barHeight;
  doc.setFillColor(139, 92, 246);
  doc.roundedRect(120, barY + barHeight - currHeight, 50, currHeight, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.text('Mes Actual', 145, barY + barHeight + 10, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(data.current_expense), 145, barY + barHeight + 18, { align: 'center' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Análisis de Variación', 20, 190);
  
  const diffPercentage = data.prev_expense > 0 
    ? ((data.difference / data.prev_expense) * 100).toFixed(1)
    : '0.0';
  
  const isIncrease = data.difference > 0;
  const boxColor = isIncrease ? [254, 226, 226] : [220, 252, 231];
  
  doc.setFillColor(boxColor[0], boxColor[1], boxColor[2]);
  doc.roundedRect(20, 200, 170, 35, 3, 3, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Diferencia absoluta:', 25, 212);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isIncrease ? 220 : 22, isIncrease ? 38 : 163, isIncrease ? 38 : 74);
  doc.text(formatCurrency(Math.abs(data.difference)), 185, 212, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Variación porcentual:', 25, 224);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isIncrease ? 220 : 22, isIncrease ? 38 : 163, isIncrease ? 38 : 74);
  doc.text(`${isIncrease ? '+' : ''}${diffPercentage}%`, 185, 224, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Interpretación', 20, 250);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (isIncrease) {
    doc.text(`Tus gastos aumentaron ${diffPercentage}% respecto al mes anterior.`, 25, 262);
    doc.text('Considera revisar dónde incrementaste el gasto y si fue justificado.', 25, 272);
  } else if (data.difference < 0) {
    doc.text(`Felicitaciones! Redujiste tus gastos en ${Math.abs(parseFloat(diffPercentage))}%.`, 25, 262);
    doc.text('Continúa con estos buenos hábitos de control financiero.', 25, 272);
  } else {
    doc.text('Tus gastos se mantuvieron estables respecto al mes anterior.', 25, 262);
    doc.text('Mantén el control y busca oportunidades de optimización.', 25, 272);
  }
  
  addFooter(doc);
  doc.save(`FinSight_Reporte_Comparativo_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateHabitsPDF = async (data: HabitsReport): Promise<void> => {
  const doc = new jsPDF();
  
  addHeader(doc, 'Reporte de Hábitos de Gasto');
  
  doc.setTextColor(0, 0, 0);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Días con Mayor Gasto', 20, 60);
  
  doc.setFillColor(252, 231, 243);
  doc.roundedRect(20, 70, 170, 30, 3, 3, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  if (data.top_days && data.top_days.length > 0) {
    const daysText = data.top_days.join(', ');
    doc.text(`Los días ${daysText} del mes son cuando más gastas.`, 25, 82);
    doc.text('Planifica mejor tus compras para estos días críticos.', 25, 92);
  } else {
    doc.text('No hay suficientes datos para identificar patrones de días.', 25, 87);
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Gastos Más Frecuentes', 20, 115);
  
  const tableData: any[] = [];
  
  if (data.repeated_expenses && Object.keys(data.repeated_expenses).length > 0) {
    Object.entries(data.repeated_expenses)
      .sort((a, b) => b[1] - a[1])
      .forEach(([description, count]) => {
        tableData.push([description, `${count} veces`]);
      });
  }
  
  if (tableData.length > 0) {
    autoTable(doc, {
      startY: 125,
      head: [['Descripción del Gasto', 'Frecuencia']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [236, 72, 153],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11
      },
      bodyStyles: {
        fontSize: 10
      },
      alternateRowStyles: {
        fillColor: [252, 231, 243]
      },
      margin: { left: 20, right: 20 }
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No se encontraron gastos repetidos en este período.', 25, 135);
  }
  
  const recY = tableData.length > 0 ? (doc as any).lastAutoTable.finalY + 15 : 150;
  
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(20, recY, 170, 60, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('Recomendaciones de Hábitos', 25, recY + 12);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  if (data.top_days && data.top_days.length > 0) {
    doc.text('Establece presupuestos diarios más estrictos para tus días críticos.', 25, recY + 24);
  }
  
  if (tableData.length > 0) {
    doc.text('Considera suscripciones o compras al por mayor para gastos frecuentes.', 25, recY + 34);
    doc.text('Evaliza si todos tus gastos repetidos son realmente necesarios.', 25, recY + 44);
  } else {
    doc.text('Mantén un registro detallado para identificar patrones futuros.', 25, recY + 24);
  }
  
  addFooter(doc);
  doc.save(`FinSight_Reporte_Habitos_${new Date().toISOString().split('T')[0]}.pdf`);
};