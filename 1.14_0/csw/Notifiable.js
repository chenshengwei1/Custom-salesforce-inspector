export class Notifiable{
    constructor(){
        this.listeners = [];
        this.listenerMap = new Map();
    }

    notify(type, event){
        if (!event){
            event = new Event('loaded');
        }
        let listeners = this.listenerMap.get(type);
        if (listeners){
            for (let e of listeners){
                try{
                    e(event);
                }catch(e){
                    console.dir(e);
                }
            }
        }
    }

    addListener(type, fn){
        if (!fn){
            return;
        }
        let listeners = this.listenerMap.get(type);
        if (!listeners){
            listeners = [];
            this.listenerMap.set(type, listeners);
        }
        listeners.push(fn);
    }
}