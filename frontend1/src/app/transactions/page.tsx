import { Metadata } from 'next';
import TransactionClient from '@/components/TransactionClient';

export const metadata: Metadata = {
  title: 'FinSight - Transacciones',
};

export default function TransactionsPage() {
  return <TransactionClient />;
}