
declare module 'fb-watchman' {
  export class ClientPrototype {
    domain: any;
    addListener(type: any, listener: any): any;
    cancelCommands(why: any): void;
    capabilityCheck(capabilities: any, onCapabilityCheck: (error: string) => void): void;
    command(params: any[], onCommand: (error: string) => void): void;
    connect(): void;
    emit(type: any, ...args: any[]): any;
    end(): void;
    eventNames(): any;
    getMaxListeners(): any;
    listenerCount(type: any): any;
    listeners(type: any): any;
    on(subscription: string, onSubscription: (resp: SubscriptionResponse) => void): void;
    once(type: any, listener: any): any;
    prependListener(type: any, listener: any): any;
    prependOnceListener(type: any, listener: any): any;
    removeAllListeners(type: any, ...args: any[]): any;
    removeListener(type: any, listener: any): any;
    sendNextCommand(): void;
    setMaxListeners(n: any): any;
  }

  export class Client extends ClientPrototype {
    constructor(options?: any);
    cancelCommands(why: any): void;
    capabilityCheck(capabilities: any, onCapabilityCheck: (error: string) => void): void;
    command(params: any[], onCommand: (error: string) => void): void;
    connect(): void;
    end(): void;
    sendNextCommand(): void;
  }

  export interface SubscriptionResponse {
    root: string;
    subscription: string;
    files: SubscriptionResponseFile[];
  }

  export interface SubscriptionResponseFile {
    exists: boolean,
    name: string;
    size: number;
    type: string;
  }
}
