const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let logs = []; // Lưu trữ tin nhắn tạm thời để hiển thị trên Dashboard

app.get('/', (req, res) => {
    // Tạo danh sách tin nhắn dưới dạng HTML để render ra Dashboard
    const messagesHtml = logs.map(m => `<div class="bubble">${m}</div>`).join('');

    res.send(`
        <html>
            <head>
                <title>Server Chat Dashboard</title>
                <style>
                    body { background: #ffff; color: #c9d1d9; font-family: sans-serif; display: flex; justify-content: center; padding: 40px; }
                    .chat-wrapper { width: 400px; border: 1px solid #ffff; border-radius: 15px; overflow: hidden; background: #ffff; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                    .status-bar { padding: 10px; background: #f8f9fa; font-size: 12px; text-align: center; border-bottom: 1px solid #eee; color: #666; font-weight: bold; }
                    .end-bar { padding: 10px; background: #f8f9fa; font-size: 12px; text-align: center; border-top: 1px solid #eee; color: #666; font-weight: bold; }
                    .message-area { height: 350px; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; background: #ffff; }
                    .bubble {
                      background: #0084ff; color: white;
                      padding: 8px 15px;
                      border-radius: 18px;
                      align-self: flex-start;
                      max-width: 80%;
                    }
                    .info { text-align: center; font-size: 16px; color: #8b949e; margin-top: 10px; }
                    h2 { text-align: center; color: #58a6ff; margin-top: 0; }
                </style>
                <script>
                    // Tự động reload trang để cập nhật tin nhắn mới nhất
                    setTimeout(() => {
                        location.reload();
                        const area = document.querySelector('.message-area');
                        area.scrollTop = area.scrollHeight;
                    }, 2000);
                </script>
            </head>
            <body>
                <div>
                    <h2>Server Chat</h2>
                    <div class="chat-wrapper">
                        <div class="status-bar">● SERVER ĐANG CHẠY</div>
                        <div class="message-area">
                            ${messagesHtml || '<div class="info">Chưa có tin nhắn nào...</div>'}
                        </div>
                        <div class="end-bar">
                            Online: ${wss.clients.size} thiết bị
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `);
});

wss.on('connection', (socket) => {
    socket.on('message', (data) => {
        const text = data.toString();
        logs.push(text); // Lưu tin nhắn vào mảng của server

        // Phát cho tất cả Client (bao gồm cả Angular)
        wss.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(text);
            }
        });
    });
});

server.listen(3000, () => console.log('Dashboard tại: http://localhost:3000'));