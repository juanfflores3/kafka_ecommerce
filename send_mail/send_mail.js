const nodemailer = require('nodemailer');
const { Kafka } = require('kafkajs');
////////////////////////////////////////////////////////
// Elasticsearch
////////////////////////////////////////////////////////

// Configurar Elasticsearch
const esClient = new Client({ node: 'http://localhost:9200'});

// Función para enviar métricas a Elasticsearch
const sendMetricsElastic = async (throughput) => {
    try {
        const body = {
            throughput,
            timestamp: new Date().toISOString()
        };
        await esClient.index({
            index: 'metrics_sentmail',
            body: body
        });
        console.log('Métricas enviadas a Elasticsearch en el índice metrics_sentmail');
    } catch (error) {
    console.error(`Error al enviar métricas a Elasticsearch: ${error}`);
    }
};

let ordersProcessed = 0;

// Función para enviar la métrica de Throughput cada minuto
const startThroughputMetric = () => {
    setInterval(async () => {
      // Enviar el throughput de pedidos procesados por minuto
      await sendMetricsElastic(ordersProcessed);
      console.log(`Throughput enviado a Elasticsearch: ${ordersProcessed} pedidos/minuto`);
  
      // Reiniciar el contador de pedidos procesados
      ordersProcessed = 0; // Reiniciar el contador de pedidos procesados
    }, 60000);
}
;
////////////////////////////////////////////////////////
// Kafka
////////////////////////////////////////////////////////

const kafka = new Kafka({
    clientId: 'mail_states',
    brokers: ['localhost:9092']
});

const consumer = kafka.consumer({groupId: 'states-group'});

const startConsumerKafka = async () => {
    // Conectar al consumidor de Kafka
    await consumer.connect();
    console.log('Conectado al broker de Kafka como consumidor');

    //Suscribirse al tópico de estados actualizados
    await consumer.subscribe({topic: 'states-update', fromBeginning: true});

    // Leer mensajes de la actualización de un pedido y los procesa
    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            try {
                const order = JSON.parse(message.value.toString());
                console.log(`Mensaje recibido de Kafka en topico ${topic}:`, order);

                // Llamar funcion de enviar correo
                sendEmail(order);
            } catch(error) {
                console.error('Error al procesar el mensaje de Kafka: ', error);
            }
        },
    });
};

////////////////////////////////////////////////////////
// Nodemailer
////////////////////////////////////////////////////////

// Creamos el objeto que transporte
const transporter = nodemailer.createTransport({
    host: 'live.smtp.mailtrap.io',
    port: 587,
    auth: {
        user: 'api',
        pass: '68b56795f8791edad95d9043dfc7cc83',
    }
});

// Función para enviar correos
const sendEmail = (order) => {
    ordersProcessed++; // Incrementar el contador de pedidos procesados

    // Configurar el correo a enviar
    const mailOptions = {
        from: 'info@demomailtrap.com',
        to: order.cliente_email,
        subject: 'Actualización estado de tu pedido',
        text: `Hola, tu pedido ${order.nombre_producto} ha pasado al estado: ${order.status}`
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo: ', error);
        } else {
            console.log('Correo enviado a: ', info.response);
        }
    })
};

////////////////////////////////////////////////////////
// Main
////////////////////////////////////////////////////////

async function main() {
    await startConsumerKafka().catch(console.error);
    startThroughputMetric();
}

main();