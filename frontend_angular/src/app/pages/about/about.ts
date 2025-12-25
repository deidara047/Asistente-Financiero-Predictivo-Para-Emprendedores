import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class AboutComponent {
  sections = [
    {
      icon: 'lightbulb',
      title: 'Nuestra Misión',
      content: 'FinSight es una herramienta de control financiero personal diseñada para empoderar a las personas con educación financiera básica. Automatiza el registro, categorización y análisis de transacciones, ofreciendo gráficos, predicciones simples de gastos y alertas para prevenir excesos. Resolvemos la falta de visibilidad sobre hábitos de gasto, reduciendo el estrés económico y el endeudamiento innecesario.'
    },
    {
      icon: 'bar_chart',
      title: 'Impacto y Valor',
      items: [
        'Mejora la educación financiera y reduce el estrés económico.',
        'Previene el endeudamiento con alertas tempranas y predicciones.',
        'Fomenta el ahorro al mostrar ingresos no gastados.',
        'Empodera a familias e individuos con herramientas accesibles.'
      ]
    },
    {
      icon: 'security',
      title: 'Consideraciones',
      content: 'FinSight es una herramienta de soporte que respeta la privacidad con almacenamiento local en CSV. Requiere disciplina para registrar datos, pero su interfaz intuitiva facilita la adopción. Estamos explorando encriptación y soporte para múltiples monedas en futuras versiones.'
    }
  ];
}
