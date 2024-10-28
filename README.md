# Aplicación de e-commerce con kafka

Este proyecto consiste en una aplicación de e-commerce que utiliza kafka para la comunicación entre microservicios. incluye cuatro microservicios principales: client_server_grpc, metrics, send_mail y states, además de servicios de apoyo (kafka, zookeeper, elasticsearch, kibana). a continuación, se detallan las instrucciones para configurar y ejecutar cada servicio.

**[Ver video de implementación](https://drive.google.com/file/d/1MptzfqksVPbxP4y58kWaXR2s550dLztH/view?usp=sharing)**

## Requisitos previos

Asegúrate de tener instalados los siguientes programas:
- [docker](https://www.docker.com/get-started) y docker compose
- node.js y npm (para las dependencias de node.js)
- python 3

## Instalación de dependencias

Cada microservicio tiene sus propias dependencias. a continuación, se explican las instrucciones para instalar las dependencias necesarias en cada uno.

### 1. client_server_grpc

1. Navega al directorio client_server_grpc:
   bash
   cd client_server_grpc
   

2. Instala las dependencias de node.js:

   bash
   npm install
   

### 2. metrics

1. Navega al directorio metrics:
   bash
   cd metrics
   

2. Instala las dependencias de node.js:

   bash
   npm install
   

### 3. send_mail

1. Navega al directorio send_mail:
   bash
   cd send_mail
   

2. Instala las dependencias de node.js:

   bash
   npm install
   

### 4. states

1. Navega al directorio states:
   bash
   cd states
   

2. Instala las dependencias de node.js:

   bash
   npm install
   

## Configuración de Servicios de Apoyo

Para iniciar los servicios de apoyo (Kafka, Zookeeper, Elasticsearch y Kibana), utiliza Docker Compose:

1. Regresa al directorio raíz del proyecto, donde se encuentra el archivo docker-compose.yml.
2. Ejecuta Docker Compose:

bash
docker-compose up -d


Esto iniciará los contenedores de Kafka, Zookeeper, Elasticsearch y Kibana.

## Ejecución Manual de los Servicios

Ejecuta cada microservicio en el siguiente orden:

1. *Servidor gRPC (gRPC Server)*  
Navega al directorio client_server_grpc.

bash
cd client_server_grpc


Ejecuta el servidor gRPC:

bash
node server.js



2. *Cliente gRPC (gRPC Client)*  
En una nueva terminal, permanece en el directorio client_server_grpc.  
Ejecuta el cliente gRPC:

bash
python client.py


3. *Servicio de Estados (states)*  
Abre una nueva terminal y navega al directorio states.
Ejecuta el microservicio de Estados:

bash
node states.js


4. *Servicio de Envío de Correos (send_mail)*  
Abre una nueva terminal y navega al directorio send_mail.
Ejecuta el microservicio de Envío de Correos:

bash
node send_mail.js


5. *Servicio de Métricas (metrics)*  
Abre una nueva terminal y navega al directorio metrics.
Ejecuta el microservicio de Métricas:

bash
node metrics.js


## Monitoreo en Kibana

1. Abre Kibana en tu navegador en [http://localhost:5601](http://localhost:5601).
2. Configura los índices de Elasticsearch (client_metrics, metrics_server, metrics_sentmail, metrics_states) para ver las métricas en el tablero de Kibana.

## Finalización y Detención de los Servicios

Para detener todos los servicios, navega al directorio raíz del proyecto y utiliza Docker Compose para cerrar los contenedores de apoyo (Kafka, Zookeeper, Elasticsearch y Kibana):

bash
docker-compose down


Esto detendrá todos los servicios y limpiará los contenedores, dejándolos listos para la próxima ejecución.

Con esto, se completa la configuración y ejecución manual de cada microservicio en el entorno de e-commerce distribuido utilizando Kafka. Asegúrate de monitorear la actividad y revisar cualquier mensaje de error en las terminales de cada microservicio para resolver posibles problemas de conexión o dependencias faltantes.