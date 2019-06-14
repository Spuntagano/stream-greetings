export default class Websocket {
    private url: string;
    private websocket: WebSocket | null;
    private onMessage: ((event: MessageEvent) => void) | undefined;
    private onOpen: (() => void) | undefined;
    private onClose: (() => void) | undefined;

    constructor(url: string, onMessage?: (event: MessageEvent) => void, onClose?: () => void, onOpen?: () => void) {
        this.url = url;
        this.onMessage = onMessage;
        this.onClose = onClose;
        this.onOpen = onOpen;
        this.websocket = null;
    }

    public connect() {
        console.log('[Websocket] Connected');

        this.websocket = new WebSocket(this.url);
        this.websocket.onmessage = this.message.bind(this);
        this.websocket.onopen = this.open.bind(this);
        this.websocket.onclose = this.close.bind(this);
    }

    public disconnect() {
        if (this.websocket) {
            this.websocket.onclose = null;
            if (this.onClose) {
                this.onClose();
            }
            this.websocket.close();
        }
    }

    private message(event: MessageEvent) {
        if (this.onMessage) {
            this.onMessage(event);
        }
    }

    private close() {
        const reconnectTime = Math.random() * 3000 + 2000;
        console.log(`[Websocket] Disconnected, reconnecting in ${Math.floor(reconnectTime / 1000)}s`);

        setTimeout(() => {
            this.connect();
        }, reconnectTime);

        if (this.onClose) {
            this.onClose();
        }
    }

    private open() {
        if (this.onOpen) {
            this.onOpen();
        }
    }
}
