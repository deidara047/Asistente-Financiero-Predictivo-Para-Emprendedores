import pytest
import requests
from faker import Faker
import random
from datetime import datetime, timedelta
import time
import calendar

fake = Faker('es_ES')

# Configuración de la API
BASE_URL = "http://127.0.0.1:5000/transaction"

# Descripciones realistas por categoría
DESCRIPTIONS = {
    "Transporte": [
        "Uber al trabajo", "Taxi aeropuerto", "Gasolina Shell", "Bus urbano",
        "Uber Eats delivery", "Taxi centro", "Recarga gasolina", "Pasaje bus",
        "Estacionamiento centro", "Peaje autopista"
    ],
    "Alimentacion": [
        "Walmart supermercado", "Restaurante La Estancia", "Almuerzo McDonald's",
        "Cena familiar", "Desayuno Starbucks", "Comida rápida", "Supermercado La Torre",
        "Restaurante Japonés", "Pizza Domino's", "Café Barista", "Panadería",
        "Mercado local", "Delivery iFood"
    ],
    "Entretenimiento": [
        "Netflix mensual", "Spotify Premium", "Cine Cinépolis", "Bar karaoke",
        "Concierto", "Teatro Nacional", "Amazon Prime", "PlayStation Plus",
        "Salida nocturna", "Boliche con amigos", "Gym mensual", "Curso online"
    ],
    "Servicios": [
        "Recibo luz EEGSA", "Internet Claro", "Agua EMPAGUA", "Teléfono Tigo",
        "Netflix", "Seguro médico", "Mantenimiento auto", "Electricidad mes",
        "Gas LP", "Cable TV", "Seguro auto"
    ]
}

# Descripciones para ingresos
INCOME_DESCRIPTIONS = [
    "Salario mensual", "Pago freelance", "Bono performance", "Venta producto",
    "Consultoría", "Proyecto extra", "Reembolso", "Pago servicios profesionales",
    "Comisión ventas", "Inversión dividendos", "Aguinaldo", "Bono anual"
]

def check_server_availability():
    """Verifica si el servidor está corriendo."""
    max_attempts = 5
    timeout = 5
    for attempt in range(max_attempts):
        try:
            response = requests.head(BASE_URL, timeout=timeout)
            if response.status_code in [200, 201, 404, 405]:
                print("✅ Servidor detectado. Iniciando generación de datos...")
                return True
        except requests.ConnectionError:
            print(f"⏳ Intento {attempt + 1}/{max_attempts}: Servidor no disponible. Esperando...")
            time.sleep(2)
    raise Exception("❌ Servidor no disponible. Ejecuta 'python main.py' primero.")

def generate_realistic_transaction(month_offset=0, transaction_type=None, force_category=None):
    """
    Genera una transacción realista.
    month_offset: 0 = mes actual, 1 = mes anterior, etc.
    transaction_type: 'ingreso' o 'gasto' (None = aleatorio)
    force_category: Forzar una categoría específica
    """
    # Calcular fecha dentro del mes especificado
    today = datetime.now()
    target_month = today.month - month_offset
    target_year = today.year
    
    while target_month <= 0:
        target_month += 12
        target_year -= 1
    
    # Determinar el último día válido del mes
    if month_offset == 0:
        # Para el mes actual, usar el día de hoy como máximo
        max_day = today.day
    else:
        # Para meses pasados, usar el último día del mes
        max_day = calendar.monthrange(target_year, target_month)[1]
    
    # Día aleatorio del mes (solo hasta el día válido)
    day = random.randint(1, max_day)
    date = f"{target_year}-{target_month:02d}-{day:02d}"
    
    # Tipo de transacción
    if transaction_type is None:
        transaction_type = random.choices(
            ["ingreso", "gasto"],
            weights=[15, 85]  # 15% ingresos, 85% gastos
        )[0]
    
    if transaction_type == "ingreso":
        # Ingresos más altos y predecibles
        amount = round(random.choice([
            random.uniform(3000, 6000),  # Salario
            random.uniform(800, 2000),   # Freelance
            random.uniform(300, 1000)    # Bonos pequeños
        ]), 2)
        description = random.choice(INCOME_DESCRIPTIONS)
    else:
        # Gastos variados por categoría
        if force_category:
            category = force_category
        else:
            category = random.choice(list(DESCRIPTIONS.keys()))
        
        description = random.choice(DESCRIPTIONS[category])
        
        # Montos realistas según categoría
        if category == "Transporte":
            amount = round(random.uniform(15, 350), 2)
        elif category == "Alimentacion":
            amount = round(random.uniform(30, 600), 2)
        elif category == "Entretenimiento":
            amount = round(random.uniform(50, 500), 2)
        elif category == "Servicios":
            amount = round(random.uniform(150, 900), 2)
        else:
            amount = round(random.uniform(25, 400), 2)
    
    return {
        "type": transaction_type,
        "amount": amount,
        "description": description,
        "date": date
    }

def generate_12_months_data():
    """
    Genera datos para 12 meses completos con patrones interesantes:
    - Tendencia creciente progresiva
    - Mejor y peor mes identificables
    - Categoría dominante clara
    - Variedad en todos los meses
    """
    transactions = []
    
    print("\n" + "="*70)
    print("📅 GENERANDO DATOS PARA LOS ÚLTIMOS 12 MESES")
    print("="*70)
    
    # Generar datos mes por mes (del más antiguo al más reciente)
    for month_offset in range(11, -1, -1):  # De hace 11 meses a mes actual
        month_num = 12 - month_offset
        print(f"\n📊 Mes {month_num}/12 (hace {month_offset} meses)...")
        
        # Calcular cuántos gastos este mes (tendencia creciente)
        base_expenses = 20
        growth_factor = (12 - month_offset) / 12  # Crece gradualmente
        num_expenses = int(base_expenses + (growth_factor * 15))
        
        # Ingresos mensuales (2-3 por mes)
        num_incomes = random.randint(2, 3)
        for _ in range(num_incomes):
            transactions.append(generate_realistic_transaction(month_offset, "ingreso"))
        
        # Gastos del mes
        for _ in range(num_expenses):
            transactions.append(generate_realistic_transaction(month_offset, "gasto"))
        
        # Hacer que Alimentación sea dominante (40% de los gastos)
        food_expenses = int(num_expenses * 0.4)
        for _ in range(food_expenses):
            transactions.append(
                generate_realistic_transaction(month_offset, "gasto", force_category="Alimentacion")
            )
        
        print(f"   ✓ {num_incomes} ingresos, {num_expenses + food_expenses} gastos")
    
    # AGREGAR ELEMENTOS ESPECIALES EN EL MES ACTUAL
    print("\n🎯 Agregando elementos especiales al mes actual...")
    
    # 1. Gastos hormiga
    print("   🐜 Gastos hormiga (pequeños pero frecuentes)...")
    for _ in range(18):
        tx = generate_realistic_transaction(0, "gasto")
        tx["amount"] = round(random.uniform(15, 95), 2)
        tx["description"] = random.choice([
            "Café Starbucks", "Snack tienda", "Propina", "Antojo dulce",
            "Refresco", "Galletas", "Helado", "Bebida energética",
            "Donas", "Chicles", "Agua embotellada"
        ])
        transactions.append(tx)
    
    # 2. Transacciones duplicadas
    print("   🔄 Transacciones duplicadas...")
    dup_tx = generate_realistic_transaction(0, "gasto")
    dup_tx["amount"] = 149.99
    dup_tx["description"] = "Netflix Premium"
    # Mismo día, mismo monto, misma descripción
    target_date = dup_tx["date"]
    for _ in range(3):
        tx_copy = dup_tx.copy()
        tx_copy["date"] = target_date  # Mismo día
        transactions.append(tx_copy)
    
    # 3. Gasto atípico muy grande
    print("   💰 Gasto atípico grande...")
    large_tx = generate_realistic_transaction(0, "gasto")
    large_tx["amount"] = 2800.00
    large_tx["description"] = "Reparación urgente auto"
    transactions.append(large_tx)
    
    # 4. Más gastos en categoría dominante
    print("   🍔 Reforzando categoría dominante (Alimentación)...")
    for _ in range(12):
        tx = generate_realistic_transaction(0, "gasto", force_category="Alimentacion")
        tx["amount"] = round(random.uniform(150, 500), 2)
        transactions.append(tx)
    
    # 5. Crear el "mejor mes" (hace 8 meses) con más ingresos y menos gastos
    print("\n🏆 Ajustando mejor mes (hace 8 meses)...")
    for _ in range(3):
        tx = generate_realistic_transaction(8, "ingreso")
        tx["amount"] = round(random.uniform(4000, 7000), 2)
        transactions.append(tx)
    
    # 6. Crear el "peor mes" (hace 3 meses) con gastos extra
    print("⚠️  Ajustando peor mes (hace 3 meses)...")
    for _ in range(15):
        tx = generate_realistic_transaction(3, "gasto")
        tx["amount"] = round(random.uniform(200, 600), 2)
        transactions.append(tx)
    
    return transactions

def generate_3_months_data():
    """
    Genera datos para 3 meses (versión original mejorada).
    Útil para pruebas rápidas de alertas.
    """
    transactions = []
    
    print("\n" + "="*70)
    print("📅 GENERANDO DATOS PARA 3 MESES (ALERTAS)")
    print("="*70)
    
    # MES 3 (hace 2 meses) - Gastos bajos
    print("\n📊 Mes 1/3 (hace 2 meses - gastos bajos)...")
    for _ in range(2):
        transactions.append(generate_realistic_transaction(2, "ingreso"))
    for _ in range(25):
        transactions.append(generate_realistic_transaction(2, "gasto"))
    
    # MES 2 (mes anterior) - Gastos medios
    print("📊 Mes 2/3 (mes anterior - gastos medios)...")
    for _ in range(2):
        transactions.append(generate_realistic_transaction(1, "ingreso"))
    for _ in range(35):
        transactions.append(generate_realistic_transaction(1, "gasto"))
    
    # MES 1 (mes actual) - Gastos altos y problemas
    print("📊 Mes 3/3 (mes actual - gastos altos con alertas)...")
    transactions.append(generate_realistic_transaction(0, "ingreso"))
    for _ in range(50):
        transactions.append(generate_realistic_transaction(0, "gasto"))
    
    # Elementos especiales
    print("\n🎯 Agregando elementos especiales...")
    
    # Gastos hormiga
    for _ in range(20):
        tx = generate_realistic_transaction(0, "gasto")
        tx["amount"] = round(random.uniform(10, 80), 2)
        tx["description"] = random.choice([
            "Café Starbucks", "Snack tienda", "Propina", "Antojo dulce"
        ])
        transactions.append(tx)
    
    # Duplicados
    dup_tx = generate_realistic_transaction(0, "gasto")
    dup_tx["amount"] = 150.00
    dup_tx["description"] = "Netflix mensual"
    target_date = dup_tx["date"]
    for _ in range(3):
        tx_copy = dup_tx.copy()
        tx_copy["date"] = target_date
        transactions.append(tx_copy)
    
    # Gasto grande
    large_tx = generate_realistic_transaction(0, "gasto")
    large_tx["amount"] = 2500.00
    large_tx["description"] = "Reparación auto urgente"
    transactions.append(large_tx)
    
    # Categoría dominante
    for _ in range(15):
        tx = generate_realistic_transaction(0, "gasto", force_category="Alimentacion")
        tx["amount"] = round(random.uniform(100, 400), 2)
        transactions.append(tx)
    
    return transactions

def send_transactions(transactions):
    """Envía las transacciones a la API."""
    success_count = 0
    errors = []
    
    for i, transaction in enumerate(transactions, 1):
        try:
            response = requests.post(
                BASE_URL,
                json=transaction,
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            if response.status_code == 201:
                success_count += 1
                if i % 20 == 0:
                    print(f"   ✅ {i}/{len(transactions)} transacciones agregadas...")
            else:
                error_msg = f"Transacción {i}: {response.status_code} - {response.text[:50]}"
                errors.append(error_msg)
                if len(errors) <= 5:  # Solo mostrar los primeros 5 errores
                    print(f"   ⚠️  {error_msg}")
        except Exception as e:
            error_msg = f"Transacción {i}: {str(e)[:50]}"
            errors.append(error_msg)
            if len(errors) <= 5:
                print(f"   ❌ {error_msg}")
        
        # Pequeña pausa para no saturar el servidor
        time.sleep(0.03)
    
    return success_count, errors

def print_summary(transactions, success_count, errors):
    """Imprime un resumen del proceso."""
    print("\n" + "="*70)
    print("📊 RESUMEN DE GENERACIÓN DE DATOS")
    print("="*70)
    print(f"✅ Transacciones exitosas: {success_count}/{len(transactions)}")
    
    if errors:
        print(f"❌ Errores encontrados: {len(errors)}")
        if len(errors) > 5:
            print(f"   (Mostrando solo los primeros 5)")
    
    # Estadísticas
    ingresos = sum(1 for tx in transactions if tx['type'] == 'ingreso')
    gastos = sum(1 for tx in transactions if tx['type'] == 'gasto')
    total_ingresos = sum(tx['amount'] for tx in transactions if tx['type'] == 'ingreso')
    total_gastos = sum(tx['amount'] for tx in transactions if tx['type'] == 'gasto')
    
    print(f"\n📈 Estadísticas generadas:")
    print(f"   • Ingresos: {ingresos} transacciones (Q{total_ingresos:,.2f})")
    print(f"   • Gastos: {gastos} transacciones (Q{total_gastos:,.2f})")
    print(f"   • Balance: Q{total_ingresos - total_gastos:,.2f}")
    
    print("\n💡 Ahora puedes probar:")
    print("   ✓ GET /reports/monthly - Reporte del mes actual")
    print("   ✓ GET /reports/monthly-12 - Reporte de 12 meses completo")
    print("   ✓ GET /alerts - Ver todas las alertas generadas")
    print("   ✓ GET /analysis - Análisis financiero general")
    print("="*70 + "\n")

# ==================== TESTS ====================

def test_server_check():
    """Verifica que el servidor esté corriendo."""
    check_server_availability()

@pytest.mark.parametrize("scenario", ["12_months"])
def test_generate_12_months(scenario):
    """Genera datos para 12 meses completos - IDEAL PARA REPORTE ANUAL."""
    transactions = generate_12_months_data()
    
    print(f"\n📦 Total de transacciones generadas: {len(transactions)}")
    print("📤 Enviando a la API...")
    
    success_count, errors = send_transactions(transactions)
    
    print_summary(transactions, success_count, errors)
    
    assert success_count > 0, "No se pudo agregar ninguna transacción"
    assert success_count >= len(transactions) * 0.95, f"Demasiados errores: {len(errors)}"

@pytest.mark.parametrize("scenario", ["3_months"])
def test_generate_3_months(scenario):
    """Genera datos para 3 meses - IDEAL PARA PROBAR ALERTAS."""
    transactions = generate_3_months_data()
    
    print(f"\n📦 Total de transacciones generadas: {len(transactions)}")
    print("📤 Enviando a la API...")
    
    success_count, errors = send_transactions(transactions)
    
    print_summary(transactions, success_count, errors)
    
    assert success_count > 0, "No se pudo agregar ninguna transacción"

# ==================== MAIN ====================

if __name__ == "__main__":
    import sys
    
    try:
        check_server_availability()
        
        # Detectar qué test ejecutar
        if len(sys.argv) > 1 and "3" in sys.argv[1]:
            print("\n🎯 Modo: 3 MESES (Alertas)")
            pytest.main(["-v", "-s", __file__, "-k", "test_generate_3_months"])
        else:
            print("\n🎯 Modo: 12 MESES (Reporte Anual)")
            pytest.main(["-v", "-s", __file__, "-k", "test_generate_12_months"])
            
    except Exception as e:
        print(f"\n❌ {e}\n")
        print("💡 Asegúrate de ejecutar 'python main.py' primero\n")