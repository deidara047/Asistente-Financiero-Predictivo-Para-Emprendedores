import pytest
import requests
import os
from io import BytesIO
from PIL import Image
from datetime import datetime

BASE_URL = "http://127.0.0.1:5000"
CSV_FILE = "transactions.csv"
BACKUP_FILE = "transactions_backup.csv"

# ==================== FIXTURES ====================

@pytest.fixture(scope="session", autouse=True)
def check_backend():
    """Verifica que el backend estÃ© corriendo antes de los tests"""
    try:
        response = requests.get(f"{BASE_URL}/", timeout=2)
    except requests.exceptions.ConnectionError:
        pytest.exit("âŒ Backend no estÃ¡ corriendo en http://127.0.0.1:5000")
    except requests.exceptions.Timeout:
        pytest.exit("âŒ Backend no responde (timeout)")
    print("\nâœ… Backend estÃ¡ corriendo")


@pytest.fixture(scope="session", autouse=True)
def cleanup_files():
    """Limpia archivos antes y despuÃ©s de todos los tests"""
    # Setup: Limpiar antes de tests
    for file in [CSV_FILE, BACKUP_FILE]:
        if os.path.exists(file):
            os.remove(file)
    print(f"ðŸ§¹ Archivos limpiados antes de tests")
    
    yield  # AquÃ­ se ejecutan todos los tests
    
    # Teardown: Limpiar despuÃ©s de tests
    for file in [CSV_FILE, BACKUP_FILE]:
        if os.path.exists(file):
            os.remove(file)
    print(f"\nðŸ§¹ Archivos limpiados despuÃ©s de tests")


@pytest.fixture(scope="session")
def sample_transactions():
    """Fixture que crea transacciones de prueba"""
    # Limpiar archivos antes de crear las transacciones de muestra
    for file in [CSV_FILE, BACKUP_FILE]:
        if os.path.exists(file):
            os.remove(file)
    
    transactions = [
        {"type": "ingreso", "amount": 1000.0, "description": "Salario mensual", "date": "2025-10-06"},
        {"type": "gasto", "amount": 50.0, "description": "Viaje en uber", "date": "2025-10-05"},
        {"type": "gasto", "amount": 20.0, "description": "Regalo sorpresa", "date": "2025-10-04"},
        {"type": "ingreso", "amount": 2000.0, "description": "Bono", "date": "2025-09-15"},
        {"type": "gasto", "amount": 100.0, "description": "Cena en restaurante", "date": "2025-09-10"},
        {"type": "gasto", "amount": 200.0, "description": "Gasolina para auto", "date": "2025-08-20"},
        {"type": "gasto", "amount": 150.0, "description": "Spotify suscripciÃ³n", "date": "2025-08-15"},
        {"type": "gasto", "amount": 300.0, "description": "Luz y agua", "date": "2025-07-25"},
        {"type": "gasto", "amount": 250.0, "description": "Netflix", "date": "2025-10-03"}
    ]
    
    # Agregar todas las transacciones
    for tx in transactions:
        response = requests.post(f"{BASE_URL}/transaction", json=tx)
        assert response.status_code == 201, f"Error agregando transacciÃ³n: {tx}"
    
    return transactions


# ==================== TESTS DE TRANSACCIONES ====================

class TestTransactions:
    """Tests para el endpoint de transacciones"""
    
    def test_add_ingreso_valid(self):
        """Debe agregar un ingreso vÃ¡lido"""
        payload = {
            "type": "ingreso",
            "amount": 5000.0,
            "description": "Freelance",
            "date": "2025-10-06"
        }
        response = requests.post(f"{BASE_URL}/transaction", json=payload)
        
        assert response.status_code == 201
        assert "message" in response.json()
        assert response.json()["message"] == "Transaction added successfully"
    
    def test_add_gasto_valid(self):
        """Debe agregar un gasto vÃ¡lido"""
        payload = {
            "type": "gasto",
            "amount": 75.0,
            "description": "Compra supermercado",
            "date": "2025-10-05"
        }
        response = requests.post(f"{BASE_URL}/transaction", json=payload)
        
        assert response.status_code == 201
    
    @pytest.mark.parametrize("missing_field", ["type", "amount", "description", "date"])
    def test_missing_required_fields(self, missing_field):
        """Debe rechazar transacciones con campos faltantes"""
        payload = {
            "type": "gasto",
            "amount": 100.0,
            "description": "Test",
            "date": "2025-10-06"
        }
        del payload[missing_field]
        
        response = requests.post(f"{BASE_URL}/transaction", json=payload)
        
        assert response.status_code == 400
        assert "error" in response.json()
        assert "Missing required fields" in response.json()["error"]
    
    @pytest.mark.parametrize("invalid_type", ["compra", "venta", "", "INGRESO"])
    def test_invalid_transaction_type(self, invalid_type):
        """Debe rechazar tipos de transacciÃ³n invÃ¡lidos"""
        payload = {
            "type": invalid_type,
            "amount": 100.0,
            "description": "Test",
            "date": "2025-10-06"
        }
        response = requests.post(f"{BASE_URL}/transaction", json=payload)
        
        assert response.status_code == 400
        assert "Invalid type" in response.json()["error"]
    # CompaÃ±eros huevones yo estoy haciendo todo
    @pytest.mark.parametrize("invalid_amount", [-10.0, 0, -100.5])
    def test_invalid_amount(self, invalid_amount):
        """Debe rechazar montos invÃ¡lidos (negativos o cero)"""
        payload = {
            "type": "gasto",
            "amount": invalid_amount,
            "description": "Test",
            "date": "2025-10-06"
        }
        response = requests.post(f"{BASE_URL}/transaction", json=payload)
        
        assert response.status_code == 400
        assert "Amount must be positive" in response.json()["error"]
    
    @pytest.mark.parametrize("invalid_date", ["2025-13-01", "not-a-date", "01/10/2025"])
    def test_invalid_date_format(self, invalid_date):
        """Debe rechazar formatos de fecha invÃ¡lidos"""
        payload = {
            "type": "gasto",
            "amount": 100.0,
            "description": "Test",
            "date": invalid_date
        }
        response = requests.post(f"{BASE_URL}/transaction", json=payload)
        
        assert response.status_code == 400
        assert "Invalid date format" in response.json()["error"]


# ==================== TESTS DE CATEGORIZACIÃ“N ====================

class TestCategorization:
    """Tests para verificar la categorizaciÃ³n automÃ¡tica"""
    
    @pytest.mark.parametrize("description,expected_category", [
        ("Viaje en uber", "Transporte"),
        ("Taxi al aeropuerto", "Transporte"),
        ("Compra en supermercado", "AlimentaciÃ³n"),
        ("Almuerzo de trabajo", "AlimentaciÃ³n"),
        ("SuscripciÃ³n Netflix", "Entretenimiento"),
        ("Entrada de cine", "Entretenimiento"),
        ("Pago de luz", "Servicios"),
        ("Recarga de internet", "Servicios"),
        ("Compra aleatoria", "Otros"),
    ])
    def test_auto_categorization(self, description, expected_category):
        """Debe categorizar correctamente segÃºn palabras clave"""
        # Nota: Esto requerirÃ­a un endpoint GET para verificar
        # o podrÃ­amos verificar indirectamente en anÃ¡lisis
        payload = {
            "type": "gasto",
            "amount": 100.0,
            "description": description,
            "date": "2025-10-06"
        }
        response = requests.post(f"{BASE_URL}/transaction", json=payload)
        assert response.status_code == 201
        # AquÃ­ idealmente verificarÃ­amos la categorÃ­a asignada


# ==================== TESTS DE ANÃLISIS ====================

class TestAnalysis:
    """Tests para el endpoint de anÃ¡lisis"""
    
    def test_analysis_with_data(self, sample_transactions):
        """Debe retornar anÃ¡lisis correcto con datos"""
        response = requests.get(f"{BASE_URL}/analysis")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verificar que todos los campos existen
        required_fields = [
            "total_income", "total_expense", "net_gain",
            "avg_monthly_income", "avg_monthly_expense",
            "unspent_percentage", "expense_comparison",
            "top_category", "top_days"
        ]
        for field in required_fields:
            assert field in data, f"Campo '{field}' faltante en anÃ¡lisis"
        
        # Verificar valores esperados
        assert data["total_income"] == 3000.0
        assert data["total_expense"] == 1070.0
        assert data["net_gain"] == 1930.0
        assert data["unspent_percentage"] > 0
        assert isinstance(data["top_days"], list)


# ==================== TESTS DE PREDICCIÃ“N ====================

class TestPrediction:
    """Tests para el endpoint de predicciÃ³n"""
    
    def test_prediction_with_sufficient_data(self, sample_transactions):
        """Debe predecir gastos con suficientes datos (3+ meses)"""
        response = requests.get(f"{BASE_URL}/prediction")
        
        assert response.status_code == 200
        data = response.json()
        assert "predicted_expense" in data
        assert isinstance(data["predicted_expense"], (int, float))
        assert data["predicted_expense"] > 0


# ==================== TESTS DE ALERTAS ====================

class TestAlerts:
    """Tests para el endpoint de alertas"""
    
    def test_alerts_endpoint(self, sample_transactions):
        """Debe retornar alertas (vacÃ­as o con datos)"""
        response = requests.get(f"{BASE_URL}/alerts")
        
        assert response.status_code == 200
        data = response.json()
        assert "alerts" in data
        assert isinstance(data["alerts"], list)


# ==================== TESTS DE REPORTES ====================

class TestReports:
    """Tests para los endpoints de reportes"""
    
    def test_monthly_report(self, sample_transactions):
        """Debe generar reporte mensual"""
        response = requests.get(f"{BASE_URL}/reports/monthly")
        
        assert response.status_code == 200
        data = response.json()
        assert "income" in data
        assert "expense" in data
        assert "savings" in data
        assert "top_category" in data
    
    def test_comparative_report(self, sample_transactions):
        """Debe generar reporte comparativo"""
        response = requests.get(f"{BASE_URL}/reports/comparative")
        
        assert response.status_code == 200
        data = response.json()
        assert "current_expense" in data
        assert "prev_expense" in data
        assert "difference" in data
    
    def test_habits_report(self, sample_transactions):
        """Debe generar reporte de hÃ¡bitos"""
        response = requests.get(f"{BASE_URL}/reports/habits")
        
        assert response.status_code == 200
        data = response.json()
        assert "top_days" in data
        assert "repeated_expenses" in data
        assert isinstance(data["top_days"], list)
        assert isinstance(data["repeated_expenses"], dict)


# ==================== TESTS DE GRÃFICOS ====================

class TestGraphs:
    """Tests para los endpoints de grÃ¡ficos"""
    
    def test_bar_graph(self, sample_transactions):
        """Debe generar grÃ¡fico de barras vÃ¡lido"""
        response = requests.get(f"{BASE_URL}/graphs/bar")
        
        assert response.status_code == 200
        assert response.headers['Content-Type'] == 'image/png'
        
        # Verificar que es una imagen vÃ¡lida
        img = Image.open(BytesIO(response.content))
        assert img.format == 'PNG'
        assert img.size[0] > 0 and img.size[1] > 0
    
    def test_pie_graph(self, sample_transactions):
        """Debe generar grÃ¡fico de pastel vÃ¡lido"""
        response = requests.get(f"{BASE_URL}/graphs/pie")
        
        assert response.status_code == 200
        assert response.headers['Content-Type'] == 'image/png'
        
        img = Image.open(BytesIO(response.content))
        assert img.format == 'PNG'
    
    def test_line_graph(self, sample_transactions):
        """Debe generar grÃ¡fico de lÃ­neas vÃ¡lido"""
        response = requests.get(f"{BASE_URL}/graphs/line")
        
        assert response.status_code == 200
        assert response.headers['Content-Type'] == 'image/png'
        
        img = Image.open(BytesIO(response.content))
        assert img.format == 'PNG'


# ==================== TESTS DE BACKUP ====================

class TestBackup:
    """Tests para verificar el sistema de backup"""
    
    def test_backup_file_created(self):
        """Debe crear archivo de backup al agregar transacciÃ³n"""
        payload = {
            "type": "ingreso",
            "amount": 100.0,
            "description": "Test backup",
            "date": "2025-10-06"
        }
        requests.post(f"{BASE_URL}/transaction", json=payload)
        
        assert os.path.exists(CSV_FILE), "Archivo CSV no fue creado"
        assert os.path.exists(BACKUP_FILE), "Archivo de backup no fue creado"


# ==================== CONFIGURACIÃ“N DE PYTEST ====================

if __name__ == '__main__':
    pytest.main([__file__, "-v", "--tb=short"])