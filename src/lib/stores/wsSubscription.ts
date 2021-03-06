import { browser } from "$app/env";
import delay from "delay";
import type { Subscriber } from "svelte/store";
import { writable } from "svelte/store";
import { v4 as uuidv4 } from "uuid";

type WSMessage = { message: string; at: number };
type WSSubscriber = Subscriber<WSMessage | null>;

const wsSubscriptionStores = new Map<string, WSSubscriptionStore>();

export const activeWSSubscriptions = writable(0);
export const activeWSConnections = writable(0);

export class WSSubscriptionStore {
    public wsMessage: WSMessage | null = null;
    subscribers: WSSubscriber[] = [];
    socket: WebSocket;
    socketActive = true;
    url: string;
    uuid: string;

    retryingConnection = false;
    public retryTimeStart = 2000;
    public retryTimeMult = 1.1;
    public retryTimeJitter = 500;
    public maxRetryTime = 20000;

    retryTime: number;

    constructor(url: string) {
        this.url = url;
        this.retryTime = this.retryTimeStart;
        this.socket = this.createNewConnection();
        this.uuid = uuidv4();
        startWatchDog();
        this.debug("constructor");
    }

    deleteConnection(): void {
        this.socket.onmessage = null;
        this.socket.onclose = null;
        this.socket.onerror = null;
        this.socket.close();
        this.socketActive = false;
    }

    createNewConnection(): WebSocket {
        const socket = new WebSocket(this.url);
        socket.onmessage = ({ data, timeStamp }) => {
            this.debug("socket.onmessage", data, timeStamp);
            this.wsMessage = {
                message: data,
                at: timeStamp,
            };
            this.dispatch();
        };
        socket.onopen = () => {
            this.retryTime = this.retryTimeStart;
            // this.dispatch();
        };
        socket.onclose = () => {
            this.debug("socket.onclose");
            this.retryConnection();
        };
        socket.onerror = () => {
            this.debug("socket.onerror");
            this.retryConnection();
        };
        return socket;
    }

    recreateConnection() {
        this.deleteConnection();
        this.createNewConnection();
    }

    async retryConnection(now = false) {
        if (this.retryingConnection) {
            return;
        }

        this.retryingConnection = true;

        const delayTime =
            this.retryTime + Math.random() * this.retryTimeJitter;

        this.retryTime *= this.retryTimeMult;
        this.retryTime = Math.min(this.retryTime, this.maxRetryTime);

        if (now) {
            this.retryTime = 0;
        } else {
            await delay(delayTime);
        }

        if (this.socket && this.socket.readyState == WebSocket.CLOSED) {
            this.recreateConnection();
        }

        this.retryingConnection = false;
    }

    dispatch() {
        this.debug(this.wsMessage, this.subscribers);
        this.subscribers.forEach((subscriber) => {
            subscriber(this.wsMessage);
        });
    }

    public subscribe(subscriber: WSSubscriber): () => void {
        this.subscribers.push(subscriber);
        this.debug("Pushing", subscriber);

        return () => {
            const index = this.subscribers.indexOf(subscriber);
            if (index !== -1) {
                this.subscribers.splice(index, 1);
            }
            if (!this.subscribers.length) {
                this.deleteConnection();
                wsSubscriptionStores.delete(this.url);
                stopWatchDog();
            }
        };
    }

    debug(...arg0: any) {
        console.debug(this.uuid, this.url, ...arg0);
    }
}

export function getSubscriptionFor(url: string): WSSubscriptionStore | null {
    if (!browser) {
        console.debug("Expected browser");
        return null;
    }
    const store = wsSubscriptionStores.get(url);
    if (store) {
        return store;
    }
    const newStore = new WSSubscriptionStore(url);
    wsSubscriptionStores.set(url, newStore);
    return newStore;
}

let watchDogTimer: number | null = null;
let watchDogLastTime = 0;
const watchDogInterval = 1000;

function startWatchDog(): void {
    if (!browser) {
        return;
    }
    if (watchDogLastTime == 0) {
        watchDogLastTime = Date.now();
    }
    if (watchDogTimer) {
        window.clearInterval(watchDogTimer);
    }
    watchDogTimer = window.setInterval(() => {
        const now = Date.now();
        watchDogLastTime = now;

        checkAllConnectionStatus();
    }, watchDogInterval);
}

function stopWatchDog(): void {
    if (!watchDogTimer) {
        throw new Error("Expected watchDogTimer");
    }
    let connectionActive = wsSubscriptionStores.size > 0;
    if (!connectionActive) {
        window.clearInterval(watchDogTimer);
    }
    checkAllConnectionStatus();
}

function checkAllConnectionStatus() {
    let activeWSS = 0;
    let activeCon = 0;

    wsSubscriptionStores.forEach((wsSubscriptionStore) => {
        activeWSS++;
        if (
            wsSubscriptionStore.socketActive &&
            wsSubscriptionStore.socket.readyState <= WebSocket.OPEN
        ) {
            activeCon++;
        }
    });

    activeWSSubscriptions.set(activeWSS);
    activeWSConnections.set(activeCon);

    if (activeWSS === activeCon) {
        return;
    }
    wsSubscriptionStores.forEach((wsSubscriptionStore) => {
        wsSubscriptionStore.retryConnection(true);
    });
}

// Online connection

export const online = writable(true);

if (browser) {
    setTimeout(() => {
        online.set(navigator.onLine);
    }, 1000);

    window.addEventListener("offline", () => {
        online.set(false);
    });

    window.addEventListener("online", () => {
        online.set(true);
    });
}
