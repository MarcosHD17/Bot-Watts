const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const openai = require('openai');
const readline = require('readline');
//clave de OpenAI
const openaiClient = new openai.OpenAI({ apiKey: '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' });

// Inicializar el cliente de WhatsApp
const client = new Client();

// Inicializar la lista de mensajes
let messages = [];

// Crear una interfaz readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función para obtener la entrada del usuario
function obtenerEntradaUsuario() {
    return new Promise((resolve, reject) => {
        rl.question('Tú: ', (input) => {
            resolve(input);
        });
    });
}

// Función principal de conversación
async function main() {
    // Bucle principal de conversación
    while (true) {
        // Solicitar la entrada del usuario
        const user_input = await obtenerEntradaUsuario();

        // Agregar el mensaje del usuario a la lista de mensajes
        messages.push({ role: "user", content: user_input });

        try {
            // Generar una respuesta utilizando la API de OpenAI
            const completion = await openaiClient.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: messages,
                max_tokens: 200
            });

            // Agregar respuesta del modelo a la conversación
            messages.push({
                role: "assistant",
                content: completion.choices[0].message.content
            });

            // Imprimir la respuesta generada
            console.log("IA:", completion.choices[0].message.content);
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// Evento para mostrar el código QR
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Evento cuando el cliente se conecta
client.on('ready', () => {
    console.log('¡Cliente listo y conectado!');
    main(); // Llamar a la función principal cuando el cliente esté listo
});

// Evento para manejar los mensajes entrantes
client.on('message', async message => {
    console.log(`Mensaje recibido de ${message.from}: ${message.body}`);

    // Agregar el mensaje del usuario a la lista de mensajes
    messages.push({ role: "user", content: message.body });

    try {
        // Generar una respuesta utilizando la API de OpenAI
        const completion = await openaiClient.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 200
        });

        // Agregar respuesta del modelo a la conversación
        messages.push({
            role: "assistant",
            content: completion.choices[0].message.content
        });

        // Enviar la respuesta generada al usuario a través de WhatsApp
        client.sendMessage(message.from, completion.choices[0].message.content);

        // Imprimir la respuesta generada en la consola
        console.log("Respuesta enviada a", message.from, ":", completion.choices[0].message.content);
    } catch (error) {
        console.error('Error:', error);
    }
});

// Evento para manejar la desconexión del cliente
client.on('disconnected', (reason) => {
    console.log(`El cliente se desconectó: ${reason}`);
});

// Iniciar sesión en WhatsApp
client.initialize();
