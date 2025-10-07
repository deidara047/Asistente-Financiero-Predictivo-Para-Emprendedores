'use server';

import { Transaction } from '@/types';
import { revalidatePath } from 'next/cache';

export async function addTransaction(formData: FormData) {
  const transaction: Omit<Transaction, 'id'> = {
    description: formData.get('description') as string,
    amount: parseFloat(formData.get('amount') as string),
    date: formData.get('date') as string,
    category: formData.get('category') as string,
    type: (formData.get('amount') as string).startsWith('-') ? 'expense' : 'income',
  };

  try {
    const res = await fetch('http://localhost:5000/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });

    if (!res.ok) {
      return { success: false, message: 'Error al agregar la transacción' };
    }

    const newTransaction = await res.json();
    revalidatePath('/transactions');
    revalidatePath('/');

    return { success: true, message: 'Transacción agregada con éxito', transaction: newTransaction };
  } catch (err) {
    return { success: false, message: 'Error al conectar con el servidor' };
  }
}