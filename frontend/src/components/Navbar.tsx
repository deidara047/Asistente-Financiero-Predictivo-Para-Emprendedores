'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/transactions', label: 'Transacciones' },
    { href: '/reports', label: 'Reportes' },
    { href: '/about', label: 'Acerca de' },
  ];

  return (
    <nav className="flex justify-center space-x-6 bg-white p-4 rounded-xl shadow-md mb-8">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-4 py-2 text-primary hover:bg-blue-50 rounded-md transition-all ${
            pathname === link.href ? 'font-bold bg-blue-100' : ''
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export default Navbar;