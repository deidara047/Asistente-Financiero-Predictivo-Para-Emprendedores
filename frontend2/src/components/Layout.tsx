import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Alerts from './Alerts';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const Layout: React.FC = () => {
  // No necesitamos pasar transactions ya que Alerts maneja su propia lógica
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-primary tracking-wide">FinSight</h1>
          <p className="text-sm text-secondary">Control Financiero Personal</p>
        </header>
        <Navbar />
        <Alerts />
        <main className="mt-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;