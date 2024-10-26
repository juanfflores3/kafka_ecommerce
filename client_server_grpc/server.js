// Importar las dependencias necesarias
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = './server.proto'; // Ruta a tu archivo .proto
const { Kafka } =  require('kafkajs'); // Importar la librería de Kafka
/* const elastic = require('elasticsearch'); // Importar la librería de Elasticsearch

const elasticClient = elastic.Client({
  host: 'http://localhost:9200', // Conectar al puerto 9200 de Elasticsearch
});

const elastic = new Elastic({
  cloud: { id: 'server'},
  auth: { 
    username: 'elastic',
    password: 'password'
  }
}); */

// Configurar Kafka para conectarse al broker
const kafka = new Kafka({
  clientId: 'server',
  brokers: ['localhost:9092'] // Se conecta al puerto 9092 de Kafka
});

// Cargar el archivo .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const servidorProto = grpc.loadPackageDefinition(packageDefinition).servidor;

// Crear un productor de Kafka
const producer = kafka.producer();

// Inicar el productor de Kafka
async function iniciarProductorKafka(){
  await producer.connect();
  console.log('Conectado al broker de Kafka como productor');
}

// Implementar la lógica del servicio gRPC
async function gestionarPedido(call, callback) {
  // Crear constante con el pedido a enviar a Kafka
  const pedido = {
    nombre_producto: call.request.nombre_producto,
    precio: call.request.precio,
    cliente_email: call.request.cliente_email,
    metodo_pago: call.request.metodo_pago,
    banco: call.request.banco,
    tipo_tarjeta: call.request.tipo_tarjeta,
    calle: call.request.calle,
    numero: call.request.numero,
    region: call.request.region
  }

  console.log(`Procesando pedido: ${call.request.nombre_producto}`);

  // Enviar el pedido a Kafka
  try {
    await producer.send({
      topic: 'pedidos',
      messages: [{ value: JSON.stringify(pedido) }]
    });
    console.log('Pedido enviado a Kafka');
  } catch (error){
    console.error(`Error al enviar el pedido a Kafka: ${error}`);
  }

  // Respuesta simulada
  callback(null, {mensaje: `Pedido procesado correctamente para ${call.request.cliente_email}`});
}

// Inicializar el servidor gRPC
function iniciarServidor() {
  const server = new grpc.Server();

  // Agregar el servicio al servidor
  server.addService(servidorProto.Servidor.service, { GestionarPedido: gestionarPedido });

  // Escuchar en el puerto 50052
  server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error(`Error al iniciar el servidor gRPC: ${err}`);
      return;
    }
    console.log(`Servidor de gestión de pedidos iniciado en el puerto ${port}...`);
  });
}

async function main() {
  await iniciarProductorKafka(); // Iniciar el productor de Kafka
  iniciarServidor();
}

main();

