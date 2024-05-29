const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Almacenar los mensajes en un array
let messages = [];

// Configurar Express para servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Ruta para servir el archivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

wss.on('connection', function connection(ws) {
    // Enviar los mensajes almacenados al nuevo cliente
    messages.forEach((message) => {
        ws.send(JSON.stringify(message));  // Asegurarse de que el mensaje se envíe como JSON
    });

    ws.on('message', function incoming(message) {
        let messageData;
        try {
            messageData = JSON.parse(message);  // Asegurarse de que el mensaje recibido sea un JSON válido
        } catch (e) {
            console.error('Invalid JSON:', e);
            return;
        }

        // Manejar el mensaje de limpieza de chat
        if (messageData.type === 'clear') {
            messages = [];
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'clear' }));
                }
            });
            return;
        }

        // Almacenar el mensaje
        messages.push(messageData);

        // Enviar el mensaje a todos los clientes
        const jsonMessage = JSON.stringify(messageData);
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(jsonMessage);
            }
        });
    });
});

server.listen(8080, function() {
    console.log('Server is listening on http://localhost:8080');
});
