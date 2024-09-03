const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
    console.log('Connected to WebSocket server');
    ws.send(JSON.stringify({ event: 'message', data: { author: 'TestUser', content: 'Hello!'}}));
});

ws.on('message', (message) => {
    console.log('Received: ', message);
});

ws.on('error', (error) => {
    console.error('WebSocket Error: ', error);
});

ws.on('close', () => {
    console.log('Disconnected from server.');
});