# FinSight Frontend - Guía de Instalación

## Requisitos Previos

Este proyecto requiere Node.js (se recomienda la versión LTS) y npm.

Para verificar si los tiene instalados, ejecute los siguientes comandos en su terminal. Si ambos muestran un número de versión, puede continuar.

```bash
node -v
npm -v
```

Si no los tiene, puede descargar Node.js (que incluye npm) desde [nodejs.org](https://nodejs.org).

## Instalación y Ejecución

### Instalar dependencias

```bash
npm install
```

### Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación se ejecutará en [http://localhost:5173](http://localhost:5173).

## Scripts Principales

| Comando           | Descripción                                               |
|------------------|-----------------------------------------------------------|
| `npm run dev`     | Inicia el servidor de desarrollo con HMR.                 |
| `npm run build`   | Compila la aplicación para producción en la carpeta `dist/`. |
| `npm run lint`    | Analiza el código con ESLint.                             |
| `npm run preview` | Previsualiza el build de producción localmente.           |

## Gestión de Dependencias

### Agregar dependencia de producción

```bash
npm install nombre-paquete
```

### Agregar dependencia de desarrollo

```bash
npm install nombre-paquete -D
```

## Tecnologías Principales

- Framework: React 19  
- Bundler: Vite  
- Lenguaje: TypeScript  
- Estilos: Tailwind CSS  
- Gestión de estado: Redux Toolkit  
- Routing: React Router  
- Peticiones HTTP: Axios  
- Gráficos: Chart.js con react-chartjs-2  
- Iconos: React Icons
