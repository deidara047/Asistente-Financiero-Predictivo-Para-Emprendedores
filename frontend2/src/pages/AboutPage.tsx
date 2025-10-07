import React from 'react';
import { useHead } from '@unhead/react';
import { FaUsers, FaChartBar, FaShieldAlt, FaLightbulb } from 'react-icons/fa';

const AboutPage: React.FC = () => {
  useHead({ title: 'FinSight - Acerca de' });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center text-primary tracking-wide">Acerca de FinSight</h1>
      <div className="max-w-4xl mx-auto">
        <section className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 mb-6">
          <div className="flex items-center mb-4">
            <FaLightbulb className="text-primary mr-2" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Nuestra Misión</h2>
          </div>
          <p className="text-secondary text-lg">
            FinSight es una herramienta de control financiero personal diseñada para empoderar a las personas con educación financiera básica. Automatiza el registro, categorización y análisis de transacciones, ofreciendo gráficos, predicciones simples de gastos y alertas para prevenir excesos. Resolvemos la falta de visibilidad sobre hábitos de gasto, reduciendo el estrés económico y el endeudamiento innecesario.
          </p>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 mb-6">
          <div className="flex items-center mb-4">
            <FaUsers className="text-primary mr-2" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Nuestro Equipo</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p><strong>Luis Rodrigo Morales Florián</strong> - Desarrollador Backend (Gestión de datos y CSV)</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p><strong>Jonathan Alexander Ajbal Cheguén</strong> - Desarrollador de Análisis (Estadísticas y predicciones)</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p><strong>Derick Fernando Yax Pacheco</strong> - Desarrollador Frontend (Interfaz y visualizaciones)</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p><strong>Abdiel Fernando José Otzoy Otzín</strong> - Desarrollador de Reportes (Alertas y reportes)</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 mb-6">
          <div className="flex items-center mb-4">
            <FaChartBar className="text-primary mr-2" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Impacto y Valor</h2>
          </div>
          <ul className="text-secondary text-lg space-y-2 list-disc list-inside">
            <li>Mejora la educación financiera y reduce el estrés económico.</li>
            <li>Previene el endeudamiento con alertas tempranas y predicciones.</li>
            <li>Fomenta el ahorro al mostrar ingresos no gastados.</li>
            <li>Empodera a familias e individuos con herramientas accesibles.</li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
          <div className="flex items-center mb-4">
            <FaShieldAlt className="text-primary mr-2" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Consideraciones</h2>
          </div>
          <p className="text-secondary text-lg">
            FinSight es una herramienta de soporte que respeta la privacidad con almacenamiento local en CSV. Requiere disciplina para registrar datos, pero su interfaz intuitiva facilita la adopción. Estamos explorando encriptación y soporte para múltiples monedas en futuras versiones.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;