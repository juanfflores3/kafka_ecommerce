const { Kafka } = requiere('kafkajs');
const { Client } = require('@elastic/elasticsearch');

//////////////////////////////////////////////////////
// Kafka

const kafka = new Kafka({
    clientId: 'metrics',
    brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'metrics-group' });

const startConsumerKafka = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'metrics', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const message_ = JSON.parse(message.value.toString());
            console.log(`Mensaje recibido de Kafka en topico ${topic}:`, message_);

            await sendElastic(message_);
        },
    });
};

//////////////////////////////////////////////////////
// Elasticsearch

const elasticClient = new Client({ node: 'http://localhost:9200' });

const sendElastic = async (message_) => {
    try {
        await elasticClient.index({
            index: 'metrics',
            body: message_
        });
        console.log('Métricas enviadas a Elasticsearch');
    } catch (error) {
        console.error(`Error al enviar las métricas a Elasticsearch: ${error}`);
    }
}

//////////////////////////////////////////////////////
// Main

startConsumerKafka().catch(console.error);