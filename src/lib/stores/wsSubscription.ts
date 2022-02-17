import delay from "delay";
import type { Subscriber } from "svelte/store";

type WSStore = { message: string; at: number };
type WSSubscriber = Subscriber<WSStore>;

export class WSSubscriptionStore {
    public store: WSStore;
    subscribers = [];
    socket: WebSocket = null;
    retryingConnection = false;

    public retryTimeStart = 2000;
    public retryTimeMult = 1.3;
    public retryTimeJitter = 500;

    retryTime: number;

    constructor(public url: string) {
        this.retryTime = this.retryTimeStart;
        this.createNewConnection();
    }

    deleteConnection(): void {
        if (this.socket !== null) {
            this.socket.onmessage = null;
            this.socket.onclose = null;
            this.socket.onerror = null;
            this.socket.close();
            delete this.socket;
            this.socket = null;
        }
    }

    async createNewConnection(): Promise<void> {
        this.deleteConnection();

        this.socket = new WebSocket(this.url);

        this.socket.onmessage = ({ data, timeStamp }) => {
            this.store = {
                message: data,
                at: timeStamp,
            };
            this.dispatch();
        };

        this.socket.onopen = () => {
            this.retryTime = this.retryTimeStart;
            this.dispatch();
        };

        this.socket.onclose = async () => {
            this.retryConnection();
        };

        this.socket.onerror = async () => {
            this.retryConnection();
        };
    }

    async retryConnection(): Promise<void> {
        if (this.retryingConnection) {
            return;
        }
        this.retryingConnection = true;

        const delayTime =
            this.retryTime + Math.random() * this.retryTimeJitter;

        await delay(delayTime);

        this.retryTime *= this.retryTimeMult;

        if (
            this.retryingConnection &&
            this.socket &&
            this.socket.readyState == WebSocket.CLOSED
        ) {
            this.retryingConnection = false;
            this.createNewConnection();
        }
    }

    dispatch(): void {
        for (let i = 0; i < this.subscribers.length; i += 1) {
            this.subscribers[i](this.store);
        }
    }

    public subscribe(subscriber: WSSubscriber): () => void {
        this.subscribers.push(subscriber);

        subscriber(this.store);

        return () => {
            const index = this.subscribers.indexOf(subscriber);
            if (index !== -1) {
                this.subscribers.splice(index, 1);
            }
            if (!this.subscribers.length) {
                this.deleteConnection();
                stores[this.url] = null;
                delete stores[this.url];
            }
        };
    }
}

type WSSubscriptionStoreMap = {
    [key: string]: WSSubscriptionStore;
};

const stores: WSSubscriptionStoreMap = {};

export function getSubscriptionFor(url: string): WSSubscriptionStore {
    if (!stores[url]) {
        stores[url] = new WSSubscriptionStore(url);
    }
    return stores[url];
}