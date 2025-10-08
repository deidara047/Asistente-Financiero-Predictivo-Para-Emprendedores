import { Metadata } from 'next';
import ReportsClient from '@/components/ReportsClient';

export const metadata: Metadata = {
  title: 'FinSight - Reportes',
};

export default function ReportsPage() {
  return <ReportsClient />;
}