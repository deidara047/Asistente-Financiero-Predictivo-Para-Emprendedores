# FinSight Backend - Guía de Instalación

## Inicio Rápido

### 1\. Instalar `uv`

Este proyecto utiliza `uv` para la gestión de dependencias y entornos virtuales.

**Verificar si `uv` está instalado**

Primero, compruebe si ya tiene `uv` instalado ejecutando el siguiente comando en su terminal:

```bash
uv --version
```

Si el comando muestra un número de versión, puede omitir los siguientes pasos de instalación y continuar con la sección "Instalar dependencias".

**Instalación de `uv`**

Si no tiene `uv` instalado, elija el método que corresponda a su sistema operativo.

**Windows (PowerShell):**

```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**Linux/macOS:**

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Alternativa (cualquier OS con pip):**

```bash
pip install uv
```

-----

### 2\. Instalar dependencias

Una vez que `uv` esté disponible, instale las dependencias del proyecto con el siguiente comando:

```bash
uv sync
```

-----

### 3\. Ejecutar el servidor

Para iniciar el servidor de la aplicación, ejecute:

```bash
uv run src/main.py
```

El servidor estará disponible en la siguiente dirección: **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

-----

## Pruebas (Testing)

### Ejecutar todos los tests

Para correr la suite completa de pruebas en modo verbose:

```bash
uv run pytest tests/ -v
```

**Probar la api completa:**

```bash
uv run python tests/test_finsight.py
```

### Generar datos de prueba

Los siguientes comandos permiten poblar la base de datos con datos de muestra.

**Datos generados aleatoriamente:**

```bash
uv run python tests/test_faker.py
```

**¡¡¡ESTE ES EL MÁS RECOMENDADO PARA PRUEBAS!!! | Datos para un periodo de 12 meses (reportes anuales):**

```bash
uv run python tests/test_fake_reportes.py
```

**Datos para un periodo de 3 meses (alertas):**

```bash
uv run python tests/test_fake_reportes.py 3
```

-----

## Gestión de Dependencias

Para agregar un nuevo paquete al proyecto, utilice el siguiente comando:

```bash
uv add nombre-paquete
```

Esto agregará la dependencia al archivo `pyproject.toml` y la instalará en el entorno virtual.

-----

## Archivos Importantes

  - `src/main.py` - Punto de entrada principal y servidor Flask.
  - `pyproject.toml` - Define las dependencias y la configuración del proyecto.
  - `transactions.csv` - Archivo de base de datos (se genera automáticamente al ejecutar la aplicación).
  - `.venv/` - Directorio del entorno virtual (ignorado por Git).

-----

## Endpoints Principales

  - `POST /transaction` - Agrega una nueva transacción.
  - `GET /transactions` - Lista todas las transacciones existentes.
  - `GET /analysis` - Devuelve un análisis financiero general.
  - `GET /reports/monthly` - Genera el reporte para el mes actual.
  - `GET /reports/monthly-12` - Genera un reporte consolidado de los últimos 12 meses.
  - `GET /alerts` - Obtiene alertas financieras basadas en patrones de gasto.
  - `GET /graphs/bar` - Genera un gráfico de barras (formato PNG).
  - `GET /graphs/pie` - Genera un gráfico de pastel (formato PNG).
  - `GET /graphs/line` - Genera un gráfico de líneas (formato PNG).
