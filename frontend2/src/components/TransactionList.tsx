import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { setTransactions } from '../store/slices/transactionSlices';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from 'react-icons/fa';

// API base URL
const API_BASE = 'http://localhost:5000';

// Función de ayuda para formatear la fecha con hora
const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    };
    return new Intl.DateTimeFormat('es-ES', options).format(date);
};

const TransactionList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'date', 
    direction: 'desc' 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE}/transactions`);
        const sortedTransactions = res.data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        dispatch(setTransactions(sortedTransactions));
      } catch (err: any) {
        setError('Error al cargar transacciones. Intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [dispatch]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedTransactions = [...transactions].sort((a: any, b: any) => {
        if (key === 'date') {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA < dateB) return direction === 'asc' ? -1 : 1;
            if (dateA > dateB) return direction === 'asc' ? 1 : -1;
            return 0;
        }

      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    dispatch(setTransactions(sortedTransactions));
    setCurrentPage(1); // Reset a la primera página al ordenar
  };

  const filteredTransactions = transactions.filter((t: any) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  // Resetear a página 1 cuando se busca
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Función para generar números de página
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Estados de loading y error - render completo
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 shadow-lg border-2 border-blue-300">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">📋</span>
            Lista de Transacciones
          </h2>
        </div>
        
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl shadow-lg border-2 border-gray-100">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-gray-600 font-semibold text-lg">Cargando transacciones...</p>
          <p className="mt-2 text-gray-400 text-sm">Esto solo tomará un momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 shadow-lg border-2 border-blue-300">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">📋</span>
            Lista de Transacciones
          </h2>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-8 text-center shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-800 mb-2">Error al cargar</h3>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 shadow-lg border-2 border-blue-300">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">📋</span>
              Lista de Transacciones
            </h2>
            <p className="text-blue-100 mt-1 text-sm font-medium">
              {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transacción registrada' : 'transacciones registradas'}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
            <p className="text-white font-semibold text-sm">Total en tabla</p>
            <p className="text-white text-xl font-bold">{filteredTransactions.length}</p>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y selector de items por página */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <span className="text-gray-400 text-2xl">🔍</span>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por descripción o categoría..."
            className="w-full pl-14 pr-12 py-5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 placeholder-gray-400 text-gray-700 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 bg-white rounded-xl border-2 border-gray-200 px-5 py-3 shadow-sm">
          <span className="text-gray-600 font-medium whitespace-nowrap">Mostrar:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="border-2 border-gray-300 rounded-lg px-3 py-2 font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:border-blue-400 transition-colors"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-gray-500 text-sm">por página</span>
        </div>
      </div>

      {/* Tabla de transacciones o mensaje vacío */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-xl p-16 text-center shadow-lg">
          <div className="text-7xl mb-6">📊</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            {searchTerm ? 'No se encontraron resultados' : 'No hay transacciones'}
          </h3>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda o borra el filtro para ver todas las transacciones' 
              : 'Agrega tu primera transacción para comenzar a llevar el control de tus finanzas'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 z-10 border-b-2 border-gray-200">
                  <tr>
                    <th
                      className="p-4 text-left font-bold text-gray-700 cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📅</span>
                        <span>Fecha y Hora</span>
                        <span className={`ml-1 transition-all duration-200 ${
                          sortConfig?.key === 'date' ? 'text-blue-600' : 'text-gray-300 opacity-0 group-hover:opacity-100'
                        }`}>
                          {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          {sortConfig?.key !== 'date' && '⇅'}
                        </span>
                      </div>
                    </th>
                    <th
                      className="p-4 text-left font-bold text-gray-700 cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group"
                      onClick={() => handleSort('description')}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📝</span>
                        <span>Descripción</span>
                        <span className={`ml-1 transition-all duration-200 ${
                          sortConfig?.key === 'description' ? 'text-blue-600' : 'text-gray-300 opacity-0 group-hover:opacity-100'
                        }`}>
                          {sortConfig?.key === 'description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          {sortConfig?.key !== 'description' && '⇅'}
                        </span>
                      </div>
                    </th>
                    <th
                      className="p-4 text-left font-bold text-gray-700 cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏷️</span>
                        <span>Categoría</span>
                        <span className={`ml-1 transition-all duration-200 ${
                          sortConfig?.key === 'category' ? 'text-blue-600' : 'text-gray-300 opacity-0 group-hover:opacity-100'
                        }`}>
                          {sortConfig?.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          {sortConfig?.key !== 'category' && '⇅'}
                        </span>
                      </div>
                    </th>
                    <th
                      className="p-4 text-left font-bold text-gray-700 cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💵</span>
                        <span>Monto</span>
                        <span className={`ml-1 transition-all duration-200 ${
                          sortConfig?.key === 'amount' ? 'text-blue-600' : 'text-gray-300 opacity-0 group-hover:opacity-100'
                        }`}>
                          {sortConfig?.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          {sortConfig?.key !== 'amount' && '⇅'}
                        </span>
                      </div>
                    </th>
                    <th
                      className="p-4 text-left font-bold text-gray-700 cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📊</span>
                        <span>Tipo</span>
                        <span className={`ml-1 transition-all duration-200 ${
                          sortConfig?.key === 'type' ? 'text-blue-600' : 'text-gray-300 opacity-0 group-hover:opacity-100'
                        }`}>
                          {sortConfig?.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          {sortConfig?.key !== 'type' && '⇅'}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentTransactions.map((t: any, index: number) => (
                    <tr
                      key={t.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 transition-all duration-300 group"
                      style={{
                        animation: `fadeIn 0.4s ease-out ${index * 0.05}s both`
                      }}
                    >
                      <td className="p-4 text-gray-600 font-mono text-sm whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">▸</span>
                          {formatDateTime(t.date)}
                        </div>
                      </td>
                      <td className="p-4 text-gray-800 font-semibold">{t.description}</td>
                      <td className="p-4">
                        <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200 group-hover:from-gray-200 group-hover:to-gray-100 transition-all shadow-sm">
                          {t.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`font-bold text-lg flex items-center gap-1 ${t.type === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="text-xl">{t.type === 'ingreso' ? '↗' : '↘'}</span>
                          {t.type === 'ingreso' ? '+' : '-'} ${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-sm border-2 transition-all ${
                          t.type === 'ingreso' 
                            ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-300' 
                            : 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 border-red-300'
                        }`}>
                          <span className="text-lg">{t.type === 'ingreso' ? '💰' : '💸'}</span>
                          {t.type === 'ingreso' ? 'Ingreso' : 'Gasto'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl shadow-xl border-2 border-blue-200 p-6">
              {/* Info de página */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full shadow-md border border-blue-200">
                  <span className="text-lg">📄</span>
                  <span className="text-gray-600 text-sm font-medium">
                    Mostrando <span className="font-bold text-blue-600">{indexOfFirstItem + 1}</span> a{' '}
                    <span className="font-bold text-blue-600">{Math.min(indexOfLastItem, filteredTransactions.length)}</span> de{' '}
                    <span className="font-bold text-indigo-600">{filteredTransactions.length}</span>
                  </span>
                </div>
              </div>

              {/* Botones de paginación */}
              <div className="flex items-center justify-center flex-wrap gap-2">
                {/* Botón Primera Página */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`p-3 rounded-lg transition-all duration-300 transform ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg hover:scale-110 active:scale-95'
                  }`}
                  title="Primera página"
                >
                  <FaAngleDoubleLeft className="text-lg" />
                </button>

                {/* Botón Anterior */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-3 rounded-lg transition-all duration-300 transform ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg hover:scale-110 active:scale-95'
                  }`}
                  title="Página anterior"
                >
                  <FaAngleLeft className="text-lg" />
                </button>

                {/* Números de página */}
                <div className="hidden sm:flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-200 shadow-inner">
                  {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className="px-2 text-gray-400 font-bold">•••</span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(page as number)}
                          className={`min-w-[38px] h-[38px] rounded-lg text-sm font-bold transition-all duration-300 transform ${
                            currentPage === page
                              ? 'bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 text-white shadow-lg scale-110 ring-2 ring-purple-300'
                              : 'bg-white text-gray-700 hover:bg-gradient-to-br hover:from-blue-100 hover:to-indigo-100 hover:text-blue-700 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 border border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Selector de página en móvil */}
                <div className="sm:hidden">
                  <select
                    value={currentPage}
                    onChange={(e) => handlePageChange(Number(e.target.value))}
                    className="bg-white border border-blue-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 shadow-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 cursor-pointer"
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <option key={page} value={page}>
                        Página {page}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botón Siguiente */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-3 rounded-lg transition-all duration-300 transform ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg hover:scale-110 active:scale-95'
                  }`}
                  title="Siguiente página"
                >
                  <FaAngleRight className="text-lg" />
                </button>

                {/* Botón Última Página */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`p-3 rounded-lg transition-all duration-300 transform ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg hover:scale-110 active:scale-95'
                  }`}
                  title="Última página"
                >
                  <FaAngleDoubleRight className="text-lg" />
                </button>
              </div>

              {/* Indicador de página actual en móvil */}
              <div className="sm:hidden text-center mt-4">
                <span className="inline-block bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                  Página {currentPage} de {totalPages}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default TransactionList;