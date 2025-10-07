import pytest
import requests
from faker import Faker
import random
from datetime import datetime, timedelta
import time

fake = Faker()

# Configuración de la API
BASE_URL = "http://127.0.0.1:5000/transaction"
NUM_TRANSACTIONS = 50

# Lista de descripciones para simular categorías
DESCRIPTIONS = {
    "Transporte": ["uber", "taxi", "gasolina", "bus"],
    "Alimentación": ["supermercado", "restaurante", "comida"],
    "Entretenimiento": ["cine", "netflix", "bar"],
    "Servicios": ["agua", "luz", "internet"],
    "Otros": ["regalo", "donación"]
}

def check_server_availability():
    """Verifica si el servidor está corriendo con un tiempo de espera."""
    max_attempts = 5
    timeout = 5  # Segundos de espera por intento
    for attempt in range(max_attempts):
        try:
            response = requests.head(BASE_URL, timeout=timeout)
            if response.status_code in [200, 201, 404]:  # Cualquier respuesta indica que el servidor está vivo
                print("Server is running. Starting tests...")
                return True
        except requests.ConnectionError:
            print(f"Attempt {attempt + 1}/{max_attempts}: Server not available. Waiting...")
            time.sleep(2)  # Espera 2 segundos antes del siguiente intento
    raise Exception("Server is not running or unreachable. Please start the backend (e.g., python main.py) and try again.")

def generate_random_transaction():
    # Generar fecha aleatoria dentro de los últimos 3 meses
    days_ago = random.randint(0, 90)
    date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
    
    # Elegir tipo aleatorio
    transaction_type = random.choice(["ingreso", "gasto"])
    
    # Generar monto aleatorio (entre 10 y 5000)
    amount = round(random.uniform(10, 5000), 2)
    
    # Elegir descripción y categoría implícita
    category = random.choice(list(DESCRIPTIONS.keys()))
    description_keywords = DESCRIPTIONS[category]
    description = f"{fake.word()} {random.choice(description_keywords)}"
    
    return {
        "type": transaction_type,
        "amount": amount,
        "description": description,
        "date": date
    }

@pytest.mark.parametrize("index", range(NUM_TRANSACTIONS))
def test_add_fake_transactions(index):
    transaction = generate_random_transaction()
    
    response = requests.post(
        BASE_URL,
        json=transaction,
        headers={"Content-Type": "application/json"}
    )
    
    assert response.status_code == 201, f"Failed to add transaction {index}: {response.text}"
    assert response.json()["message"] == "Transaction added successfully", f"Unexpected response for transaction {index}: {response.text}"
    
    print(f"Added transaction {index + 1}/{NUM_TRANSACTIONS}: {transaction}")

def test_server_check():
    """Prueba inicial para verificar que el servidor esté corriendo."""
    check_server_availability()

if __name__ == "__main__":
    # Ejecutar la verificación del servidor antes de las pruebas
    try:
        check_server_availability()
        pytest.main(["-v", __file__])
    except Exception as e:
        print(e)