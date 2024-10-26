import pandas as pd

# Leer el archivo CSV
df = pd.read_csv('dataset_sales.csv')

# Seleccionar aleatoriamente 50 filas
df_sample = df.sample(n=50, random_state=42)

# Guardar las 50 filas en un nuevo archivo CSV
df_sample.to_csv('dataset_sales_50.csv', index=False)

print("Se han seleccionado 50 filas y guardado en 'dataset_sales_50.csv'.")
