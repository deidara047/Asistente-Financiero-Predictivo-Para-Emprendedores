from flask import Flask, request, jsonify, send_file
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from datetime import datetime
import os
import shutil
import io
from scipy.stats import linregress
import numpy as np
from flask_cors import CORS
# Importar pytz para manejar zonas horarias
import pytz

app = Flask(__name__)
CORS(app)

CSV_FILE = 'transactions.csv'
BACKUP_FILE = 'transactions_backup.csv'

CATEGORIES = {
    "Transporte": ["uber", "taxi", "gasolina", "bus", "combustible"],
    "Alimentacion": ["supermercado", "restaurante", "comida", "almuerzo", "cena", "desayuno"],
    "Entretenimiento": ["cine", "netflix", "spotify", "bar", "juego", "musica"],
    "Servicios": ["agua", "luz", "internet", "telefono", "electricidad"],
    "Otros": []
}

def load_data():
    if os.path.exists(CSV_FILE):
        try:
            df = pd.read_csv(CSV_FILE)
            # Asegurar que 'date' se lee como datetime
            df['date'] = pd.to_datetime(df['date']) 
            return df
        except Exception:
            return pd.DataFrame(columns=['date', 'type', 'amount', 'description', 'category'])
    return pd.DataFrame(columns=['date', 'type', 'amount', 'description', 'category'])

def save_data(df):
    df.to_csv(CSV_FILE, index=False)
    shutil.copy(CSV_FILE, BACKUP_FILE)

def categorize(description):
    desc_lower = description.lower()
    for cat, keywords in CATEGORIES.items():
        if any(kw in desc_lower for kw in keywords):
            return cat
    return "Otros"

# Función de ayuda para formatear moneda: $#,###.##
def format_currency(amount):
    """Formatea un número a la cadena de moneda $#,###.##"""
    return f"${amount:,.2f}"

@app.route('/transaction', methods=['POST'])
def add_transaction():
    data = request.json
    required_fields = ['type', 'amount', 'description', 'date']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    transaction_type = data['type']
    if transaction_type not in ['ingreso', 'gasto']:
        return jsonify({"error": "Invalid type: must be 'ingreso' or 'gasto'"}), 400
    
    try:
        amount = float(data['amount'])
        if amount <= 0:
            return jsonify({"error": "Amount must be positive"}), 400
    except ValueError:
        return jsonify({"error": "Invalid amount format"}), 400
    
    try:
        # Se sigue esperando YYYY-MM-DD para la fecha de la transacción
        input_date = data['date']
    except ValueError:
        return jsonify({"error": "Invalid date format, use YYYY-MM-DD"}), 400
    
    description = data['description']
    
    if transaction_type == 'gasto':
        category = categorize(description)
    else:
        category = 'Ingreso'
    
    # === CAMBIO: OBTENER FECHA Y HORA DE GUATEMALA (UTC-6) ===
    tz_guatemala = pytz.timezone('America/Guatemala')
    # Combinar la fecha del input con la hora actual de Guatemala
    now_gt = datetime.now(tz_guatemala)
    # Crear el objeto datetime con la fecha del input y la hora actual de Guatemala
    date_with_time = pd.to_datetime(f"{input_date} {now_gt.strftime('%H:%M:%S')}", format='%Y-%m-%d %H:%M:%S', errors='coerce')
    
    if pd.isna(date_with_time):
        return jsonify({"error": "Invalid date format or combination with current time"}), 400
    
    df = load_data()
    new_row = pd.DataFrame({
        'date': [date_with_time], # Usar el datetime con hora de Guatemala
        'type': [transaction_type],
        'amount': [amount],
        'description': [description],
        'category': [category]
    })
    df = pd.concat([df, new_row], ignore_index=True)
    save_data(df)
    return jsonify({"message": f"Transaction added successfully with Guatemala time ({now_gt.strftime('%H:%M:%S')})"}), 201

# ... [Otras funciones como get_transactions, get_analysis, get_prediction permanecen igual]

@app.route('/transactions', methods=['GET'])
def get_transactions():
    df = load_data()
    if df.empty:
        return jsonify([]), 200
    # Convertir a lista de diccionarios para JSON
    transactions = df.to_dict('records')
    return jsonify(transactions)

@app.route('/analysis', methods=['GET'])
def get_analysis():
    df = load_data()
    if df.empty:
        return jsonify({"error": "No data available"}), 404
    
    df['month'] = df['date'].dt.to_period('M')
    
    total_income = df[df['type'] == 'ingreso']['amount'].sum()
    total_expense = df[df['type'] == 'gasto']['amount'].sum()
    net_gain = total_income - total_expense
    
    unique_months = df['month'].nunique()
    avg_monthly_income = total_income / unique_months if unique_months > 0 else 0
    avg_monthly_expense = total_expense / unique_months if unique_months > 0 else 0
    
    unspent_percentage = ((total_income - total_expense) / total_income * 100) if total_income > 0 else 0
    
    current_month = pd.Timestamp(datetime.now()).to_period('M')
    prev_month = current_month - 1
    
    current_expenses = df[(df['type'] == 'gasto') & (df['month'] == current_month)]['amount'].sum()
    prev_expenses = df[(df['type'] == 'gasto') & (df['month'] == prev_month)]['amount'].sum()
    expense_comparison = "aumentado" if current_expenses > prev_expenses else "disminuido"
    
    current_month_expenses = df[(df['type'] == 'gasto') & (df['month'] == current_month)]
    top_category = current_month_expenses.groupby('category')['amount'].sum().idxmax() if not current_month_expenses.empty else None
    
    current_month_days = current_month_expenses.groupby(current_month_expenses['date'].dt.day)['amount'].sum()
    top_days = current_month_days.nlargest(3).index.tolist() if not current_month_days.empty else []
    
    analysis = {
        "total_income": total_income,
        "total_expense": total_expense,
        "net_gain": net_gain,
        "avg_monthly_income": avg_monthly_income,
        "avg_monthly_expense": avg_monthly_expense,
        "unspent_percentage": unspent_percentage,
        "expense_comparison": expense_comparison,
        "top_category": top_category,
        "top_days": top_days
    }
    return jsonify(analysis)

@app.route('/prediction', methods=['GET'])
def get_prediction():
    df = load_data()
    if df.empty:
        return jsonify({"error": "No data available"}), 404
    
    df['month'] = df['date'].dt.to_period('M')
    expense_monthly = df[df['type'] == 'gasto'].groupby('month')['amount'].sum().reset_index()
    expense_monthly['month_num'] = range(1, len(expense_monthly) + 1)
    
    if len(expense_monthly) < 3:
        return jsonify({"error": "Not enough data for prediction (need at least 3 months)"}), 400
    
    last_three = expense_monthly.tail(3)
    x = last_three['month_num'].values
    y = last_three['amount'].values
    
    slope, intercept, _, _, _ = linregress(x, y)
    next_month_pred = slope * (x[-1] + 1) + intercept
    
    return jsonify({"predicted_expense": next_month_pred})

# Agregar este nuevo endpoint después de /reports/monthly

@app.route('/reports/monthly-12', methods=['GET'])
def get_monthly_12_report():
    df = load_data()
    if df.empty:
        return jsonify({"error": "No data available"}), 404
    
    # Obtener el mes actual
    current_month = pd.Timestamp(datetime.now()).to_period('M')
    
    # Calcular el mes de hace 12 meses
    start_month = current_month - 11
    
    # Filtrar datos de los últimos 12 meses
    df['month'] = df['date'].dt.to_period('M')
    df_12_months = df[(df['month'] >= start_month) & (df['month'] <= current_month)]
    
    # Crear datos mensuales
    monthly_data = []
    total_income = 0
    total_expense = 0
    
    for i in range(12):
        month_period = start_month + i
        month_df = df_12_months[df_12_months['month'] == month_period]
        
        income = month_df[month_df['type'] == 'ingreso']['amount'].sum()
        expense = month_df[month_df['type'] == 'gasto']['amount'].sum()
        savings = income - expense
        
        # Encontrar categoría con más gasto
        expenses_by_cat = month_df[month_df['type'] == 'gasto'].groupby('category')['amount'].sum()
        top_category = expenses_by_cat.idxmax() if not expenses_by_cat.empty else 'N/A'
        
        monthly_data.append({
            'month': month_period.strftime('%B'),
            'year': month_period.year,
            'income': round(income, 2),
            'expense': round(expense, 2),
            'savings': round(savings, 2),
            'top_category': top_category
        })
        
        total_income += income
        total_expense += expense
    
    total_savings = total_income - total_expense
    avg_monthly_income = total_income / 12
    avg_monthly_expense = total_expense / 12
    avg_monthly_savings = total_savings / 12
    
    # Calcular tasa de ahorro promedio
    savings_rate = (total_savings / total_income * 100) if total_income > 0 else 0
    
    # Encontrar mejor y peor mes
    best_month = max(monthly_data, key=lambda x: x['savings']) if monthly_data else None
    worst_month = min(monthly_data, key=lambda x: x['savings']) if monthly_data else None
    
    # Categoría con más gasto en todo el período
    all_expenses = df_12_months[df_12_months['type'] == 'gasto'].groupby('category')['amount'].sum()
    top_category_overall = all_expenses.idxmax() if not all_expenses.empty else 'N/A'
    top_category_amount = all_expenses.max() if not all_expenses.empty else 0
    
    report = {
        'monthly_data': monthly_data,
        'summary': {
            'total_income': round(total_income, 2),
            'total_expense': round(total_expense, 2),
            'total_savings': round(total_savings, 2),
            'avg_monthly_income': round(avg_monthly_income, 2),
            'avg_monthly_expense': round(avg_monthly_expense, 2),
            'avg_monthly_savings': round(avg_monthly_savings, 2),
            'savings_rate': round(savings_rate, 2),
            'best_month': {
                'month': best_month['month'] if best_month else 'N/A',
                'year': best_month['year'] if best_month else None,
                'savings': best_month['savings'] if best_month else 0
            },
            'worst_month': {
                'month': worst_month['month'] if worst_month else 'N/A',
                'year': worst_month['year'] if worst_month else None,
                'savings': worst_month['savings'] if worst_month else 0
            },
            'top_category': top_category_overall,
            'top_category_amount': round(top_category_amount, 2)
        },
        'period': {
            'start': start_month.strftime('%B %Y'),
            'end': current_month.strftime('%B %Y')
        }
    }
    
    return jsonify(report)

@app.route('/alerts', methods=['GET'])
def get_alerts():
    df = load_data()
    if df.empty:
        return jsonify({"error": "No data available"}), 404
    
    df['month'] = df['date'].dt.to_period('M')
    current_month = pd.Timestamp(datetime.now()).to_period('M')
    
    # Definir ventana de análisis: últimos 3 meses incluyendo el actual
    all_months = sorted(df['month'].unique())
    if len(all_months) >= 3:
        analysis_months = all_months[-3:]
    else:
        analysis_months = all_months
    
    # Filtrar datos para la ventana de análisis
    df_analysis = df[df['month'].isin(analysis_months)]
    
    # Datos históricos (antes de la ventana de análisis)
    df_historical = df[df['month'] < analysis_months[0]]
    
    alerts = []
    
    # 1. ALERTA: Gasto elevado por categoría vs promedio histórico de últimos 3 meses
    if len(analysis_months) >= 2:
        # Comparar mes actual vs promedio de 2 meses anteriores en la ventana
        previous_months = [m for m in analysis_months if m < current_month]
        
        if previous_months:
            prev_avg = df[df['month'].isin(previous_months) & (df['type'] == 'gasto')].groupby('category')['amount'].mean()
            current = df[(df['type'] == 'gasto') & (df['month'] == current_month)].groupby('category')['amount'].sum()
            
            for cat in current.index:
                if cat in prev_avg.index and current[cat] > prev_avg[cat] * 1.5:
                    increase_pct = ((current[cat] - prev_avg[cat]) / prev_avg[cat]) * 100
                    months_str = ', '.join([m.strftime('%b %Y') for m in previous_months])
                    
                    current_amount_str = format_currency(current[cat])
                    average_amount_str = format_currency(prev_avg[cat])
                    
                    alerts.append({
                        "type": "gasto_elevado_categoria",
                        "severity": "alta",
                        "category": cat,
                        "current_amount": round(current[cat], 2),
                        "average_amount": round(prev_avg[cat], 2),
                        "increase_percentage": round(increase_pct, 1),
                        "message": f"⚠️ Gasto elevado en {cat}: {current_amount_str} este mes vs promedio de {average_amount_str} ({months_str}). Aumento del {increase_pct:.1f}%"
                    })
    
    # 2. ALERTA: Déficit mensual en el mes actual
    current_income = df[(df['type'] == 'ingreso') & (df['month'] == current_month)]['amount'].sum()
    current_expense = df[(df['type'] == 'gasto') & (df['month'] == current_month)]['amount'].sum()
    
    if current_expense > current_income and current_income > 0:
        deficit = current_expense - current_income
        deficit_pct = (deficit / current_income) * 100
        
        current_income_str = format_currency(current_income)
        current_expense_str = format_currency(current_expense)
        deficit_str = format_currency(deficit)
        
        alerts.append({
            "type": "deficit_mensual",
            "severity": "critica",
            "income": round(current_income, 2),
            "expense": round(current_expense, 2),
            "deficit": round(deficit, 2),
            "deficit_percentage": round(deficit_pct, 1),
            "message": f"🚨 DÉFICIT: Gastos ({current_expense_str}) superan ingresos ({current_income_str}) por {deficit_str} ({deficit_pct:.1f}% extra)"
        })
    
    # 3. ALERTA: Tasa de ahorro baja en últimos 3 meses
    total_income_period = df_analysis[df_analysis['type'] == 'ingreso']['amount'].sum()
    total_expense_period = df_analysis[df_analysis['type'] == 'gasto']['amount'].sum()
    
    if total_income_period > 0:
        savings = total_income_period - total_expense_period
        savings_rate = (savings / total_income_period) * 100
        period_str = f"{analysis_months[0].strftime('%b')} - {analysis_months[-1].strftime('%b %Y')}"

        if 0 < savings_rate < 20:
            savings_str = format_currency(savings)
            alerts.append({
                "type": "ahorro_bajo",
                "severity": "media",
                "savings_rate": round(savings_rate, 1),
                "savings_amount": round(savings, 2),
                "period": period_str,
                "message": f"📉 Tasa de ahorro baja: {savings_rate:.1f}% ({period_str}). Has ahorrado {savings_str}. Meta recomendada: 20%"
            })
        elif savings_rate < 0:
            deficit_amount_str = format_currency(abs(savings))
            alerts.append({
                "type": "ahorro_negativo",
                "severity": "critica",
                "savings_rate": round(savings_rate, 1),
                "deficit_amount": round(abs(savings), 2),
                "period": period_str,
                "message": f"🚨 AHORRO NEGATIVO: Estás gastando {deficit_amount_str} más de lo que ganas ({period_str})"
            })
    
    # 4. ALERTA: Transacciones inusualmente grandes en últimos 3 meses
    expense_df = df_analysis[df_analysis['type'] == 'gasto']
    if len(expense_df) > 10:
        q75 = expense_df['amount'].quantile(0.75)
        q25 = expense_df['amount'].quantile(0.25)
        iqr = q75 - q25
        threshold = q75 + (1.5 * iqr)
        
        large_transactions = expense_df[expense_df['amount'] > threshold].sort_values('amount', ascending=False)
        
        for idx, (_, tx) in enumerate(large_transactions.head(3).iterrows()):
            amount_str = format_currency(tx['amount'])
            threshold_str = format_currency(threshold)
            
            alerts.append({
                "type": "transaccion_inusual",
                "severity": "media",
                "amount": round(tx['amount'], 2),
                "description": tx['description'],
                "category": tx['category'],
                "date": tx['date'].strftime('%d/%m/%Y'),
                "threshold": round(threshold, 2),
                "message": f"💰 Gasto atípico: {amount_str} en '{tx['description']}' ({tx['category']}) el {tx['date'].strftime('%d/%m/%Y')}. Supera el umbral de {threshold_str}"
            })
    
    # 5. ALERTA: Gastos hormiga en últimos 3 meses
    small_expenses = df_analysis[(df_analysis['type'] == 'gasto') & (df_analysis['amount'] < 100)]
    if not small_expenses.empty:
        small_count = len(small_expenses)
        small_total = small_expenses['amount'].sum()
        total_expenses = df_analysis[df_analysis['type'] == 'gasto']['amount'].sum()
        
        if small_count > 15 and total_expenses > 0:
            small_pct = (small_total / total_expenses) * 100
            avg_small = small_total / small_count
            period_str = f"{analysis_months[0].strftime('%b')} - {analysis_months[-1].strftime('%b %Y')}"
            
            small_total_str = format_currency(small_total)
            avg_small_str = format_currency(avg_small)

            alerts.append({
                "type": "gastos_hormiga",
                "severity": "media",
                "transaction_count": small_count,
                "total_amount": round(small_total, 2),
                "average_amount": round(avg_small, 2),
                "percentage_of_total": round(small_pct, 1),
                "period": period_str,
                "message": f"🐜 Gastos hormiga: {small_count} transacciones pequeñas (promedio {avg_small_str}) suman {small_total_str} ({small_pct:.1f}% del total) en {period_str}"
            })
    
    # 6. ALERTA: Tendencia creciente en últimos 3 meses
    if len(analysis_months) >= 3:
        monthly_expenses = []
        month_names = []
        
        for month in analysis_months:
            month_expense = df[(df['type'] == 'gasto') & (df['month'] == month)]['amount'].sum()
            monthly_expenses.append(month_expense)
            month_names.append(month.strftime('%b %Y'))
        
        if all(monthly_expenses[i] < monthly_expenses[i+1] for i in range(len(monthly_expenses)-1)):
            increase = ((monthly_expenses[-1] - monthly_expenses[0]) / monthly_expenses[0]) * 100
            
            m0_str = format_currency(monthly_expenses[0])
            m1_str = format_currency(monthly_expenses[1])
            m2_str = format_currency(monthly_expenses[2])

            alerts.append({
                "type": "tendencia_creciente",
                "severity": "alta",
                "months": month_names,
                "amounts": [round(x, 2) for x in monthly_expenses],
                "increase_percentage": round(increase, 1),
                "message": f"📈 Tendencia creciente: Gastos aumentando consistentemente: {month_names[0]} ({m0_str}) → {month_names[1]} ({m1_str}) → {month_names[2]} ({m2_str}). Aumento total: {increase:.1f}%"
            })
    
    # 7. ALERTA: Sin ingresos en mes actual
    if current_income == 0 and current_expense > 0:
        current_expense_str = format_currency(current_expense)
        alerts.append({
            "type": "sin_ingresos",
            "severity": "alta",
            "expense_amount": round(current_expense, 2),
            "message": f"⚠️ No hay ingresos registrados en {current_month.strftime('%B %Y')} pero sí gastos por {current_expense_str}. ¿Olvidaste registrar ingresos?"
        })
    
    # 8. ALERTA: Categoría dominante en últimos 3 meses
    category_expenses = df_analysis[df_analysis['type'] == 'gasto'].groupby('category')['amount'].sum()
    total_expenses_period = category_expenses.sum()
    
    if total_expenses_period > 0:
        for cat, amount in category_expenses.items():
            percentage = (amount / total_expenses_period) * 100
            if percentage > 40:
                period_str = f"{analysis_months[0].strftime('%b')} - {analysis_months[-1].strftime('%b %Y')}"
                
                # Formatear montos de otras categorías
                other_categories_list = []
                for c in category_expenses.index:
                    if c != cat:
                        other_categories_list.append(f"{c} ({format_currency(category_expenses[c])})")
                other_categories = ', '.join(other_categories_list)

                amount_str = format_currency(amount)
                
                alerts.append({
                    "type": "categoria_dominante",
                    "severity": "media",
                    "category": cat,
                    "amount": round(amount, 2),
                    "percentage": round(percentage, 1),
                    "total_expenses": round(total_expenses_period, 2),
                    "period": period_str,
                    "message": f"📊 Categoría dominante: '{cat}' representa {amount_str} ({percentage:.1f}%) de tus gastos en {period_str}. Otras: {other_categories}"
                })
    
    # 9. ALERTA: Gastos duplicados (mejorado con normalización)
    current_expenses = df[(df['type'] == 'gasto') & (df['month'] == current_month)].copy()
    if not current_expenses.empty:
        # Normalizar descripción: minúsculas y sin espacios extra
        current_expenses['desc_normalized'] = current_expenses['description'].str.lower().str.strip()
        
        duplicates = current_expenses.groupby(['date', 'amount', 'desc_normalized']).agg({
            'description': 'first',
            'category': 'first'
        }).reset_index()
        
        duplicate_counts = current_expenses.groupby(['date', 'amount', 'desc_normalized']).size()
        duplicate_counts = duplicate_counts[duplicate_counts > 1]
        
        for (date, amount, desc_norm), count in duplicate_counts.items():
            original_desc = duplicates[(duplicates['date'] == date) & 
                                      (duplicates['amount'] == amount) & 
                                      (duplicates['desc_normalized'] == desc_norm)]['description'].values[0]
            category = duplicates[(duplicates['date'] == date) & 
                                 (duplicates['amount'] == amount) & 
                                 (duplicates['desc_normalized'] == desc_norm)]['category'].values[0]
            
            total_duplicated = amount * count
            
            amount_str = format_currency(amount)
            total_duplicated_str = format_currency(total_duplicated)
            
            alerts.append({
                "type": "posible_duplicado",
                "severity": "media",
                "amount": round(amount, 2),
                "description": original_desc,
                "category": category,
                "date": date.strftime('%d/%m/%Y'),
                "count": int(count),
                "total_amount": round(total_duplicated, 2),
                "message": f"🔄 Posible duplicado: {amount_str} en '{original_desc}' ({category}) registrado {count} veces el {date.strftime('%d/%m/%Y')}. Total: {total_duplicated_str}"
            })
    
    # 10. ALERTA: Proyección de gastos para fin de mes
    days_in_month = pd.Timestamp(datetime.now()).days_in_month
    current_day = datetime.now().day
    
    if current_day >= 7 and current_day < days_in_month and current_expense > 0:
        daily_avg = current_expense / current_day
        projected_expense = daily_avg * days_in_month
        
        # Comparar con promedio de meses anteriores en la ventana
        previous_months = [m for m in analysis_months if m < current_month]
        if previous_months:
            avg_prev_months = df[df['month'].isin(previous_months) & (df['type'] == 'gasto')].groupby('month')['amount'].sum().mean()
            
            if projected_expense > avg_prev_months * 1.15:
                excess = projected_expense - avg_prev_months
                excess_pct = ((projected_expense - avg_prev_months) / avg_prev_months) * 100
                months_str = ', '.join([m.strftime('%b') for m in previous_months])
                
                current_expense_str = format_currency(current_expense)
                daily_avg_str = format_currency(daily_avg)
                projected_expense_str = format_currency(projected_expense)
                avg_prev_months_str = format_currency(avg_prev_months)
                excess_str = format_currency(excess)
                
                alerts.append({
                    "type": "proyeccion_excesiva",
                    "severity": "alta",
                    "current_expense": round(current_expense, 2),
                    "days_elapsed": current_day,
                    "daily_average": round(daily_avg, 2),
                    "projected_expense": round(projected_expense, 2),
                    "average_previous_months": round(avg_prev_months, 2),
                    "excess_amount": round(excess, 2),
                    "excess_percentage": round(excess_pct, 1),
                    "message": f"⚡ Proyección alta: Llevas {current_expense_str} en {current_day} días ({daily_avg_str}/día). Proyección fin de mes: {projected_expense_str} vs promedio de {avg_prev_months_str} ({months_str}). Exceso proyectado: {excess_str} (+{excess_pct:.1f}%)"
                })
    
    # Ordenar alertas por severidad
    severity_order = {"critica": 0, "alta": 1, "media": 2, "baja": 3}
    alerts.sort(key=lambda x: severity_order.get(x["severity"], 4))
    
    return jsonify({
        "alerts": alerts,
        "total": len(alerts),
        "analysis_period": {
            "start": analysis_months[0].strftime('%B %Y'),
            "end": analysis_months[-1].strftime('%B %Y'),
            "months_analyzed": len(analysis_months)
        }
    })

# ... [El resto del código como /reports/monthly, /reports/comparative, /reports/habits y /graphs/* sigue igual]
@app.route('/reports/monthly', methods=['GET'])
def get_monthly_report():
    df = load_data()
    if df.empty:
        return jsonify({"error": "No data available"}), 404
    
    current_month = pd.Timestamp(datetime.now()).to_period('M')
    current_df = df[df['date'].dt.to_period('M') == current_month]
    
    income = current_df[current_df['type'] == 'ingreso']['amount'].sum()
    expense = current_df[current_df['type'] == 'gasto']['amount'].sum()
    savings = income - expense
    top_category = current_df[current_df['type'] == 'gasto'].groupby('category')['amount'].sum().idxmax() if not current_df.empty else None
    
    report = {
        "income": income,
        "expense": expense,
        "savings": savings,
        "top_category": top_category
    }
    return jsonify(report)

@app.route('/reports/comparative', methods=['GET'])
def get_comparative_report():
    df = load_data()
    if df.empty:
        return jsonify({"error": "No data available"}), 404
    
    current_month = pd.Timestamp(datetime.now()).to_period('M')
    prev_month = current_month - 1
    
    current_expense = df[(df['type'] == 'gasto') & (df['date'].dt.to_period('M') == current_month)]['amount'].sum()
    prev_expense = df[(df['type'] == 'gasto') & (df['date'].dt.to_period('M') == prev_month)]['amount'].sum()
    
    difference = current_expense - prev_expense
    
    report = {
        "current_expense": current_expense,
        "prev_expense": prev_expense,
        "difference": difference
    }
    return jsonify(report)

@app.route('/reports/habits', methods=['GET'])
def get_habits_report():
    df = load_data()
    if df.empty:
        return jsonify({"error": "No data available"}), 404
    
    current_month = pd.Timestamp(datetime.now()).to_period('M')
    current_expenses = df[(df['type'] == 'gasto') & (df['date'].dt.to_period('M') == current_month)]
    
    top_days = current_expenses.groupby(current_expenses['date'].dt.day)['amount'].sum().nlargest(3).index.tolist()
    
    repeated_expenses = current_expenses['description'].value_counts().head(5).to_dict()
    
    report = {
        "top_days": top_days,
        "repeated_expenses": repeated_expenses
    }
    return jsonify(report)

@app.route('/graphs/bar', methods=['GET'])
def get_bar_graph():
    df = load_data()
    if df.empty:
        return jsonify({"error": "No data available"}), 404
    
    df['month'] = df['date'].dt.to_period('M').astype(str)
    monthly = df.groupby(['month', 'type'])['amount'].sum().unstack().fillna(0)
    
    fig, ax = plt.subplots()
    monthly.plot(kind='bar', ax=ax)
    ax.set_title('Ingresos vs Gastos por Mes')
    ax.set_ylabel('Monto')
    
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()
    return send_file(img, mimetype='image/png')

@app.route('/graphs/pie', methods=['GET'])
def get_pie_graph():
    df = load_data()
    if df.empty:
        return jsonify({"error": "No data available"}), 404
    
    expenses = df[df['type'] == 'gasto'].groupby('category')['amount'].sum()
    
    fig, ax = plt.subplots()
    expenses.plot(kind='pie', ax=ax, autopct='%1.1f%%')
    ax.set_title('Distribución de Gastos por Categoría')
    
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()
    return send_file(img, mimetype='image/png')

@app.route('/graphs/line', methods=['GET'])
def get_line_graph():
    df = load_data()
    if df.empty:
        return jsonify({"error": "No data available"}), 404
    
    df['month'] = df['date'].dt.to_period('M').astype(str)
    monthly_expenses = df[df['type'] == 'gasto'].groupby('month')['amount'].sum()
    
    fig, ax = plt.subplots()
    monthly_expenses.plot(kind='line', ax=ax)
    ax.set_title('Evolución de Gastos Mensuales')
    ax.set_ylabel('Monto')
    
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()
    return send_file(img, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True)