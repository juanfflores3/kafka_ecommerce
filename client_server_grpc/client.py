import csv
import grpc
from cliente_pb2 import CompraRequest
from server_pb2 import OrderRequest
from server_pb2_grpc import ServerStub
import time
import asyncio
from datetime import datetime
from elasticsearch import Elasticsearch

########################################################
# Elasticsearch
########################################################

# Conectar a Elasticsearch
esClient = Elasticsearch(hosts=["http://localhost:9200"])

# Función para enviar métrias a Elasticsearch
async def sendMetricsElastic(througput):
    try: 
        body = {
            "througput": througput,
            'timestamp': datetime.now().isoformat()
        }
        esClient.index(index="metrics_client", body=body)
        print(f"Métricas de througput enviadas a Elasticsearch: {througput} pedidos/minuto")
    except Exception as e:
        print(f"Error al enviar métricas a Elasticsearch: {e}")

ordersProcessed = 0

# Función para enviar la métrica de Throughput cada minuto
async def startThroughputMetric():
    global ordersProcessed
    while True:
        # Enviar el throughput de pedidos procesados por minuto
        await sendMetricsElastic(ordersProcessed)
        
        # Reiniciar el contador de pedidos procesados
        ordersProcessed = 0

        # Esperar un minuto
        await asyncio.sleep(60)


########################################################
# gRPC Client
########################################################

# Función para crear una solicitud de pedido y enviarla al servidor gRPC.
def connect_server():
    # Conectar al Servidor gRPC
    canal_servidor = grpc.insecure_channel('localhost:50052')
    server_stub = ServerStub(canal_servidor)
    print("Conectado al servidor gRPC en localhost:50052")
    return server_stub

########################################################
# Generador de tráfico
########################################################

# Función para crear una solicitud de pedido y enviarla al servidor gRPC.
def make_order(server_stub, nombre_producto, precio, 
               cliente_email, metodo_pago, banco, tipo_tarjeta, calle, numero, region):
    # Crear la solicitud de pedido para el Servidor gRPC
    pedido = OrderRequest(
        nombre_producto=nombre_producto,
        precio=precio,
        cliente_email=cliente_email,
        metodo_pago=metodo_pago,
        banco=banco,
        tipo_tarjeta=tipo_tarjeta,
        calle=calle,
        numero=numero,
        region=region
    )

    # Enviar el pedido al Servidor gRPC
    answer = server_stub.ProcessOrder(pedido)
    print(f"Respuesta del servidor: {answer.mensaje}")

########################################################
# Dataset
########################################################

# Función para leer el archivo CSV y procesar cada fila como una compra.
async def process_dataset(ruta_dataset, server_stub):
    global ordersProcessed
    with open(ruta_dataset, 'r') as csvfile:
        reader = csv.DictReader(csvfile)

        batch = []

        for row in reader:
            # Extraer los datos de la fila actual
            nombre_producto = row['Product']
            precio = float(row['Price'])
            cliente_email = row['Email_Client']
            metodo_pago = row['Pay_Method']
            banco = row['Bank']
            tipo_tarjeta = row['Type_Card']
            calle = row['Street']
            numero = row['Number']
            region = row['Region']

            batch.append((nombre_producto, precio, cliente_email, 
                          metodo_pago, banco, tipo_tarjeta, calle, numero, region))

            # Enviar 200 pedidos cada dos segundos
            if len(batch) == 200:
                for order in batch:
                    make_order(server_stub, *order)
                
                ordersProcessed += 200
                # Limpiar el lote y esperar dos segundos
                batch = []
                time.sleep(2)
                

        # Procesar cualquier pedido restante
        for order in batch:
            make_order(server_stub, *order)

########################################################
# Main
########################################################

async def main():
    # Conectar al servidor gRPC
    server_stub = connect_server()

    asyncio.create_task(startThroughputMetric())

    # Procesar el dataset
    await process_dataset('dataset_sales.csv', server_stub)

asyncio.run(main())