const { Kafka } = require('kafkajs');
const { Client } = require('@elastic/elasticsearch');

////////////////////////////////////////////////////////
// States
////////////////////////////////////////////////////////

const states = {
    PROCESSING: 'Processing',
    PREPARATION: 'Preparation',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    FINISHED: 'Finished',
};

const transitions = {
    PrepareOrder: {
        [states.PROCESSING]: states.PREPARATION,
    },
    ShipOrder: {
        [states.PREPARATION]: states.SHIPPED,
    },
    DeliverOrder: {
        [states.SHIPPED]: states.DELIVERED,
    },
    FinishOrder: {
        [states.DELIVERED]: states.FINISHED,
    },
};

////////////////////////////////////////////////////////
// Elasticsearch
////////////////////////////////////////////////////////

// Configurar Elasticsearch
const esClient = new Client({ node: 'http://localhost:9200'});

// Función para enviar métricas a Elasticsearch
const sendMetricsElastic = async (latency, throughput = null) => {
    try {
        const body = throughput
            ? { throughput, timestamp: new Date().toISOString() }
            : { latency, timestamp: new Date().toISOString() };
        await esClient.index({
            index: 'metrics_states',
            body: body
        });
        console.log('Métricas enviadas a Elasticsearch en el índice metrics_server');
    } catch (error) {
        console.error(`Error al enviar métricas a Elasticsearch: ${error}`);
    }
};

let ordersProcessed = 0;

// Función para enviar la métrica de Throughput cada minuto
const startThroughputMetric = () => {
    setInterval(async () => {
        // Enviar el throughput de pedidos procesados por minuto
        await sendMetricsElastic(null, ordersProcessed);
        console.log(`Throughput enviado a Elasticsearch: ${ordersProcessed} pedidos/minuto`);

        // Reiniciar el contador de pedidos
        ordersProcessed = 0;
    }, 60000)
};

////////////////////////////////////////////////////////
// Kafka
////////////////////////////////////////////////////////

// Configurar Kafka para conectarse al broker
const kafka = new Kafka({
    clientId: 'states',
    brokers: ['localhost:9092'] // Se conecta al puerto 9092 de Kafka
});

const consumer = kafka.consumer({groupId: 'orders'});
const producer = kafka.producer({createPartitioner: Kafka.DefaultPartitioner});

const startConsumerKafka  = async () => {
    // Conectar al consumidor de Kafka
    await consumer.connect();
    console.log('Conectado al broker de Kafka como consumidor');

    // Suscribirse al tópico de pedidos
    await consumer.subscribe({topic: 'orders', fromBeginning: true});

    // Leer/Escuchar mensajes de Kafka y procesarlos
    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            const pedido = JSON.parse(message.value.toString());
            console.log(`Mensaje recibido de Kafka en topico ${topic}:`, pedido);

            processOrder(pedido);
        },
    });
};

const sendOrders = async (order) => {
    try {
        await producer.send({
            topic: 'states-update',
            messages: [{ value: JSON.stringify(order)}]
        });
        console.log('Actualización del pedido enviado a Kafka')
    } catch (error) {
        console.error(`Error al enviar la actualización del pedido: ${error}`);
    }
};

const startProducerKafka = async () => {
    await producer.connect();
    console.log('Conectado al broker de Kafka como productor');
};

////////////////////////////////////////////////////////
// Maquina de estado, actualización del estado de un pedido
////////////////////////////////////////////////////////

// Función para generar un tiempo aleatorio entre 1 y 15 segundos
const getRandomTime = () => Math.floor(Math.random() * 5) + 1;

// Función para procesar la compra y actualizar su estado
const processOrder = (order) => {
    // Inicializar la compra en estado "PROCESSING"
    order.status = states.PROCESSING;
    console.log(`Compra recibida: ${order.nombre_producto} - Estado: ${order.status}`);
    sendOrders(order); // Enviar el estado actual del pedido (PROCESSING) a Kafka
    
    ordersProcessed++; // Incrementar el contador de pedidos procesados
    let lastStateChange = Date.now(); // Timestamp para llegada de pedido

    const events = ['PrepareOrder', 'ShipOrder', 'DeliverOrder', 'FinishOrder'];
    let currentEventIndex = 0; // Para controlar el índice del evento actual

    // Función para actualizar el estado de la compra
    const updateOrderStatus = async () => {
        if (currentEventIndex < events.length) {
            const event = events[currentEventIndex];
            const nextState = transitions[event][order.status];

            if (nextState) {
                const now = Date.now();
                const latency = now - lastStateChange;
                lastStateChange = now;

                order.status = nextState;
                console.log(`Compra: ${order.nombre_producto} - Nuevo estado: ${order.status}`);

                currentEventIndex++; // Avanzar al siguiente evento
                
                sendOrders(order); // Enviar la actualización del estado a Kafka

                await sendMetricsElastic(latency); // Enviar la metricás a Elasticsearch
                
                // Continuar iterando estados aleatoriamente
                const delay = getRandomTime(); // Obtener un tiempo aleatorio
                
                // Enviar a elasticsearch el tiempo de demora del estado
                console.log(`Tiempo de demora para el pedido: ${delay} segundos`);

                setTimeout(updateOrderStatus, delay * 1000); // Cambiar de estado tras un retraso aleatorio
            } else {
                console.log('Transición de estado inválida.');
            }
        }
    };

    // Iniciar el proceso de actualización de estado
    const initialDelay = getRandomTime(); // Tiempo aleatorio para el primer cambio
    setTimeout(updateOrderStatus, initialDelay * 1000);
};

////////////////////////////////////////////////////////
// Main
////////////////////////////////////////////////////////

async function main () {
    await startConsumerKafka();
    await startProducerKafka();
    startThroughputMetric();
}

main().catch(console.error);