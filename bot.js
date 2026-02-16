// wolf-bot.js
export class WolfBot {
    constructor(client, targetGroupId) {
        this.client = client;
        this.targetGroupId = targetGroupId;
        this.lastFishTimestamp = Date.now();
        this.requiredElapsedTime = 1000; // 1 saniye
    }

    // Temel mesaj gönderici
    _sendMessage(targetId, content, isGroup = true) {
        const packet = {
            body: {
                recipient: targetId,
                isGroup: isGroup,
                mimeType: 'text/plain',
                data: new TextEncoder().encode(content).buffer,
                flightId: Math.random().toString(36).substring(7),
            }
        };
        return this.client.socket.emit('message send', packet);
    }

    sendGroupMessage(content) {
        return this._sendMessage(this.targetGroupId, content, true);
    }

    // Balık tutma mantığı (Race tetikleyici)
    handleMessage(data) {
        const message = data.body;
        const text = new TextDecoder().decode(message.data);

        // Şartlar: Belirli bir kullanıcıdan gelmeli ve içeriği eşleşmeli
        if (message.originator === 15145815 && (text.includes('121212') || text.includes('j yarıs'))) {
            this.executeRace();
        }
    }

    executeRace() {
        const elapsedTime = Date.now() - this.lastFishTimestamp;

        if (elapsedTime > this.requiredElapsedTime) {
            this._performAction();
        } else {
            setTimeout(() => {
                if (Date.now() - this.lastFishTimestamp > this.requiredElapsedTime) {
                    this._performAction();
                }
            }, this.requiredElapsedTime - elapsedTime);
        }
    }

    _performAction() {
        console.warn('Eylem tetiklendi: !j race');
        this.sendGroupMessage('!j race');
        this.lastFishTimestamp = Date.now();
    }

    start() {
        console.log('Bot aktif, dinleniyor...');
        this.client.socket.on('message send', (data) => this.handleMessage(data));
    }
}
