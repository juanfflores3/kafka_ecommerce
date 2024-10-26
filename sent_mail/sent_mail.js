const nodemailer = require('nodemailer');
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'mail_states',
    brokers: ['localhost:9092']
});

const consumer = kafka.consumer({groupId: 'states-group'});

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
const enviarCorreo = (pedido) => {
    
    // Configurar el correo a enviar
    const mailOptions = {
        from: 'info@demomailtrap.com',
        to: pedido.cliente_email,
        subject: 'Actualización estado de tu pedido',
        text: `Hola, tu pedido ${pedido.nombre_producto} ha pasado al estado: ${pedido.status}`
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo: ', error);
        } else {
            console.log('Correo enviado a: ', info.response);
        }
    })
};

const iniciarConsumidorKafka = async () => {
    // Conectar al consumidor de Kafka
    await consumer.connect();
    console.log('Conectado al broker de Kafka como consumidor');

    //Suscribirse al tópico de estados actualizados
    await consumer.subscribe({topic: 'states-update', fromBeginning: true});

    // Leer mensajes de la actualización de un pedido y los procesa
    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            try {
                const pedido = JSON.parse(message.value.toString());
                console.log(`Mensaje recibido de Kafka en topico ${topic}:`, pedido);

                // Llamar funcion de enviar correo
                enviarCorreo(pedido);
            } catch(error) {
                console.error('Error al procesar el mensaje de Kafka: ', error);
            }
        },
    });
};

iniciarConsumidorKafka().catch(console.error);

