# Asistente Financiero Predictivo Para Emprendedores

Una simple aplicación para gestionar finanzas personales hecha con las opciones para frontend React, Next.js y backend Flask.

## Descripción General

Esta aplicación proporciona una solución completa para la gestión financiera personal, combinando seguimiento de transacciones con análisis avanzados y funciones predictivas. El sistema categoriza automáticamente los gastos, genera informes detallados y proporciona información accionable para ayudar a los usuarios a tomar mejores decisiones financieras.

## Características

### Gestión de Transacciones
- Registro de ingresos y gastos con categorización automática
- Soporte para múltiples categorías de gastos: Transporte, Alimentación, Entretenimiento, Servicios y Otros
- Historial de transacciones con seguimiento de fecha, monto, descripción y categoría
- Marcas de tiempo con zona horaria de Guatemala (GMT-6)

### Análisis Financiero
- Resúmenes mensuales de ingresos y gastos
- Cálculos de ganancia o pérdida neta
- Promedios mensuales de ingresos y gastos
- Porcentaje de ahorro respecto a ingresos totales
- Comparación de gastos entre períodos
- Identificación de categorías con mayor gasto
- Análisis de días con mayores gastos

### Sistema de Alertas Inteligentes
El sistema monitorea automáticamente los últimos 3 meses de datos y genera alertas sobre:
- Gastos elevados por categoría comparados con el promedio histórico
- Déficit mensual cuando los gastos superan los ingresos
- Tasa de ahorro baja o negativa
- Transacciones inusualmente grandes
- Gastos hormiga acumulados
- Tendencias crecientes en gastos mensuales
- Ausencia de ingresos registrados
- Categorías de gasto dominantes
- Posibles transacciones duplicadas
- Proyecciones de gasto excesivo para fin de mes

### Reportes Especializados
- Reporte mensual actual con desglose de ingresos, gastos y ahorros
- Reporte comparativo entre mes actual y anterior
- Reporte de hábitos de gasto con días y conceptos más frecuentes
- Reporte anual de últimos 12 meses con resumen detallado por mes

### Predicción de Gastos
- Modelo de predicción basado en regresión lineal
- Proyección de gastos para el próximo mes utilizando datos históricos
- Requiere al menos 3 meses de datos para generar predicciones

### Visualizaciones
- Gráfico de barras: Comparación mensual de ingresos vs gastos
- Gráfico circular: Distribución porcentual de gastos por categoría
- Gráfico de líneas: Evolución temporal de gastos mensuales

## Tecnologías

### Backend
- Flask: Framework web para API REST
- Pandas: Procesamiento y análisis de datos
- Matplotlib: Generación de gráficos
- SciPy: Análisis estadístico y regresión lineal
- NumPy: Operaciones numéricas
- Pytz: Manejo de zonas horarias
- Flask-CORS: Soporte para peticiones cross-origin

### Almacenamiento
- CSV: Almacenamiento persistente de transacciones
- Sistema automático de respaldo

## API Endpoints

### Transacciones
- `POST /transaction` - Agregar nueva transacción
- `GET /transactions` - Obtener todas las transacciones

### Análisis y Reportes
- `GET /analysis` - Análisis financiero general
- `GET /alerts` - Obtener alertas inteligentes
- `GET /prediction` - Predicción de gastos futuros
- `GET /reports/monthly` - Reporte del mes actual
- `GET /reports/monthly-12` - Reporte de últimos 12 meses
- `GET /reports/comparative` - Comparación entre meses
- `GET /reports/habits` - Análisis de hábitos de gasto

### Gráficos
- `GET /graphs/bar` - Gráfico de barras
- `GET /graphs/pie` - Gráfico circular
- `GET /graphs/line` - Gráfico de líneas

## Estructura del Proyecto
