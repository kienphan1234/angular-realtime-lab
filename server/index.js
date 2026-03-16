const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let logs = [];

app.get('/', (req, res) => {
    const messagesHtml = logs.map(m => {
        const isServer = m.isServer;
        return `<div class="bubble ${!isServer ? 'right' : 'left'}">${m.text}</div>`;
    }).join('');

    res.send(`
        <html>
            <head>
                <title>Server Control Panel</title>
                <style>
                    body { background: #f0f2f5; font-family: sans-serif; display: flex; justify-content: center; padding: 40px;  flex-direction: column;   align-items: center; }
                    .chat-wrapper { width: 400px; background: white; border-radius: 15px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                    .message-area { height: 400px; padding: 15px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
                    .bubble { padding: 8px 15px; border-radius: 18px; max-width: 80%; font-size: 14px; line-height: 1.4; position: relative; }
                    .left { background: #e4e6eb; color: black; align-self: flex-start; border-bottom-left-radius: 4px; }
                    .right { background: #0084ff; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
                    .input-box { display: flex; padding: 10px; border-top: 1px solid #eee; gap: 5px; }
                    input { flex: 1; border-radius: 20px; border: 1px solid #ddd; padding: 8px 15px; outline: none; }
                    button { border: none; background: #0084ff; color: white; border-radius: 20px; padding: 0 15px; cursor: pointer; font-weight: bold; }
                    h2 {text-align: center;color: #58a6ff;margin-top: 0;}
                    .header {padding: 10px;background: #f8f9fa;font-size: 16px;color: #30b646;text-align: center;border-bottom: 1px solid #eee;font-weight: bold;}
                </style>
            </head>
            <body>
                <h2>SERVER DASHBOARD</h2>
                <div class="chat-wrapper">
                    <div class="header">Server đang chạy</div>
                    <div class="message-area" id="box">${messagesHtml}</div>
                    <form action="/send" method="POST" class="input-box">
                        <input name="msg" placeholder="Gửi tin nhắn xuống Client..." required autocomplete="off">
                        <button type="submit">Gửi</button>
                    </form>
                </div>
                <script>
                    const box = document.getElementById('box');
                    box.scrollTop = box.scrollHeight;
                    setInterval(() => { if(document.activeElement.tagName !== 'INPUT') location.reload(); }, 2000);
                </script>
            </body>
        </html>
    `);
});

app.post('/send', (req, res) => {
    const messageObj = { text: req.body.msg, isServer: true };
    logs.push(messageObj);
    wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(JSON.stringify(messageObj));
    });
    res.redirect('/');
});

wss.on('connection', (socket) => {
    socket.on('message', (data) => {
        const text = data.toString();
        const messageObj = { text: text, isServer: false };
        logs.push(messageObj);
        wss.clients.forEach(client => {
            if (client.readyState === 1) client.send(JSON.stringify(messageObj));
        });
    });
});

server.listen(3000, () => console.log('🚀 Server: http://localhost:3000'));