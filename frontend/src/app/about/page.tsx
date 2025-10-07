import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FinSight - Acerca de',
};

export default function AboutPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Acerca de</h1>
      <p className="text-gray-600">
        FinSight es una aplicación para gestionar tus finanzas personales de manera eficiente.
      </p>
    </div>
  );
}