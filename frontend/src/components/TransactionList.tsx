'use client';

import { useGlobalContext } from '@/context/GlobalContext';
import { Transaction } from '@/types';
import { useState } from 'react';
import { FaSort, FaSearch } from 'react-icons/fa';

const TransactionList: React.FC = () => {
  const { transactions } = useGlobalContext();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  const filteredTransactions = transactions
    .filter((t) =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortField === 'date') {
        return sortOrder === 'asc'
          ? new Date(aValue as string).getTime() - new Date(bValue as string).getTime()
          : new Date(bValue as string).getTime() - new Date(aValue as string).getTime();
      }
      if (sortField === 'amount') {
        return sortOrder === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
      return sortOrder === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * transactionsPerPage,
    currentPage * transactionsPerPage
  );

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Lista de Transacciones</h2>
      <div className="mb-4 flex items-center">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Buscar por descripción o categoría"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="p-2 cursor-pointer" onClick={() => handleSort('description')}>
              Descripción <FaSort />
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort('category')}>
              Categoría <FaSort />
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort('amount')}>
              Monto <FaSort />
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort('date')}>
              Fecha <FaSort />
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedTransactions.map((transaction) => (
            <tr key={transaction.id} className="border-b">
              <td className="p-2">{transaction.description}</td>
              <td className="p-2">{transaction.category}</td>
              <td className={`p-2 ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td className="p-2">{new Date(transaction.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
        >
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default TransactionList;