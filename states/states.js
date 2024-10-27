const { Kafka } = require('kafkajs');

////////////////////////////////////////////////////////
// States
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
// Kafka

const kafka = new Kafka({
    clientId: 'states',
    brokers: ['localhost:9092']
});

const consumer = kafka.consumer({groupId: 'orders'});
const producer = kafka.producer({createPartitioner: Kafka.DefaultPartitioner});


const startConsumerKafka = async () => {
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

const startProducerKafka = async () => {
    await producer.connect();
    console.log('Conectado al broker de Kafka como productor');
};

////////////////////////////////////////////////////////
// Update State

// Función para generar un tiempo aleatorio entre 1 y 15 segundos
const getRandomTime = () => Math.floor(Math.random() * 5) + 1;

// Función para procesar la compra y actualizar su estado
const processOrder = (order) => {
    // Inicializar la compra en estado "PROCESSING"
    order.status = states.PROCESSING;
    console.log(`Compra recibida: ${order.nombre_producto} - Estado: ${order.status}`);

    const events = ['PrepareOrder', 'ShipOrder', 'DeliverOrder', 'FinishOrder'];
    let currentEventIndex = 0; // Para controlar el índice del evento actual

    // Función para actualizar el estado de la compra
    const updateOrderStatus = async () => {
        if (currentEventIndex < events.length) {
            const event = events[currentEventIndex];
            const nextState = transitions[event][order.status];

            if (nextState) {
                order.status = nextState;
                console.log(`Compra: ${order.nombre_producto} - Nuevo estado: ${order.status}`);

                currentEventIndex++; // Avanzar al siguiente evento

                // Enviar la actualización del estado a Kafka
                try {
                    await producer.send({
                        topic: 'states-update',
                        messages: [{ value: JSON.stringify(order)}]
                    });
                    console.log('Actualización del pedido enviado a Kafka')
                } catch (error) {
                    console.error(`Error al enviar la actualización del pedido: ${error}`);
                }

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

async function main () {
    await startConsumerKafka();
    await startProducerKafka();
}

main().catch(console.error);