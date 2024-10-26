import pandas as pd

# Cargar el archivo CSV original
df = pd.read_csv('.csv')

# Eliminar duplicados en NUMBER y STREET para asegurar la unicidad
df_unique = df.drop_duplicates(subset=['NUMBER', 'STREET'])

# Verificar que existan al menos 10,000 filas únicas
if df_unique.shape[0] >= 10000:
    # Seleccionar las primeras 10,000 filas únicas
    df_selected = df_unique[['NUMBER', 'STREET']].head(10000)

    # Guardar el nuevo archivo CSV con el nombre "chile_number_street.csv"
    df_selected.to_csv('chile_number_street.csv', index=False)
    print("Archivo 'chile_number_street.csv' generado con éxito.")
else:
    print("No hay suficientes filas únicas para generar el archivo.")
