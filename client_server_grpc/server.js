// Importar las dependencias necesarias
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = './server.proto'; // Ruta a tu archivo .proto
const { Kafka } =  require('kafkajs'); // Importar la librería de Kafka

////////////////////////////////////////////////////////
// gRPC

// Cargar el archivo .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const servidorProto = grpc.loadPackageDefinition(packageDefinition).server;

// Inicializar el servidor gRPC
function startServer() {
  const server = new grpc.Server();

  // Agregar el servicio al servidor
  server.addService(servidorProto.Server.service, { ProcessOrder: processOrder });

  // Escuchar en el puerto 50052
  server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error(`Error al iniciar el servidor gRPC: ${err}`);
      return;
    }
    console.log(`Servidor de gestión de pedidos iniciado en el puerto ${port}...`);
  });
}

////////////////////////////////////////////////////////
// Kafka 

// Configurar Kafka para conectarse al broker
const kafka = new Kafka({
  clientId: 'server',
  brokers: ['localhost:9092'] // Se conecta al puerto 9092 de Kafka
});

// Crear un productor de Kafka
const producer = kafka.producer();

// Inicar el productor de Kafka
async function startProducerKafka(){
  await producer.connect();
  console.log('Conectado al broker de Kafka como productor');
}

const sendOrders = async (pedido) => {
  try {
    await producer.send({
      topic:'orders',
      messages: [{ value: JSON.stringify(pedido) }]
    });
    console.log('Pedidos enviados a Kafka al tópico orders');
  } catch (error) {
    console.error(`Error al enviar el pedido a Kafka: ${error}`);
  }
};

const sendMetrics = async (pedido) => {
  try {
    await producer.send({
      topic: 'metrics',
      messages: [{ value: JSON.stringify(pedido) }]
    });
    console.log('Métricas enviadas a Kafka al tópico metrics');
  } catch (error) {
    console.error(`Error al enviar las métricas a Kafka: ${error}`);
  }
};

// Implementar la lógica del servicio gRPC
async function processOrder(call, callback) {
  // Crear constante con el pedido a enviar a Kafka
  const order = {
    nombre_producto: call.request.nombre_producto,
    precio: call.request.precio,
    cliente_email: call.request.cliente_email,
    metodo_pago: call.request.metodo_pago,
    banco: call.request.banco,
    tipo_tarjeta: call.request.tipo_tarjeta,
    calle: call.request.calle,
    numero: call.request.numero,
    region: call.request.region,
    timestamp: new Date().toISOString()
  }

  console.log(`Procesando pedido: ${call.request.nombre_producto}`);
  
  sendOrders(order); // Enviar pedido a Kafka
  sendMetrics(order); // Enviar métricas a Kafka

  // Respuesta simulada
  callback(null, {mensaje: `Pedido procesado correctamente para ${call.request.cliente_email}`});
}

////////////////////////////////////////////////////////
// Main

async function main() {
  await startProducerKafka(); // Iniciar el productor de Kafka
  startServer(); // Iniciar el servidor gRPC
}

main();

