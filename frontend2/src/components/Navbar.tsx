import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="flex justify-center space-x-6 bg-white p-4 rounded-xl shadow-md mb-8">
      <NavLink 
        to="/" 
        className={({ isActive }) => 
          `px-4 py-2 text-primary hover:bg-blue-50 rounded-md transition-all ${isActive ? 'font-bold bg-blue-100' : ''}`
        }
      >
        Dashboard
      </NavLink>
      <NavLink 
        to="/transactions" 
        className={({ isActive }) => 
          `px-4 py-2 text-primary hover:bg-blue-50 rounded-md transition-all ${isActive ? 'font-bold bg-blue-100' : ''}`
        }
      >
        Transacciones
      </NavLink>
      <NavLink 
        to="/reports" 
        className={({ isActive }) => 
          `px-4 py-2 text-primary hover:bg-blue-50 rounded-md transition-all ${isActive ? 'font-bold bg-blue-100' : ''}`
        }
      >
        Reportes
      </NavLink>
      <NavLink 
        to="/about" 
        className={({ isActive }) => 
          `px-4 py-2 text-primary hover:bg-blue-50 rounded-md transition-all ${isActive ? 'font-bold bg-blue-100' : ''}`
        }
      >
        Acerca de
      </NavLink>
    </nav>
  );
};

export default Navbar;