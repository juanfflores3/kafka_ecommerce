import pandas as pd

# Leer el archivo CSV
df = pd.read_csv('dataset_sales.csv')

# Seleccionar aleatoriamente X filas
df_sample = df.sample(n=500, random_state=42)

# Guardar las X filas en un nuevo archivo CSV
df_sample.to_csv('dataset_sales_500.csv', index=False)

print("Se han seleccionado X filas y guardado en 'dataset_sales_X.csv'.")
