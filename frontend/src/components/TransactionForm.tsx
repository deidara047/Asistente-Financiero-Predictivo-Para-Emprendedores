'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { categorizeTransaction } from '@/utils/categories';
import { addTransaction } from '@/utils/actions';
import { useGlobalContext } from '@/context/GlobalContext';

const MySwal = withReactContent(Swal);

const TransactionForm: React.FC = () => {
  const { setTransactions } = useGlobalContext();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount || !date) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, completa todos los campos requeridos.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('description', description);
    formData.append('amount', amount);
    formData.append('date', date);
    const inferredCategory = category || categorizeTransaction(description) || 'Sin categoría';
    formData.append('category', inferredCategory);

    const result = await addTransaction(formData);

    if (result.success) {
      MySwal.fire({
        icon: 'success',
        title: 'Éxito',
        text: result.message,
      });
      setTransactions((prev) => [...prev, result.transaction]);
      setDescription('');
      setAmount('');
      setDate('');
      setCategory('');
    } else {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Agregar Transacción</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Monto</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded-md"
          step="0.01"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Categoría (opcional)</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        Agregar
      </button>
    </form>
  );
};

export default TransactionForm;