
declare module 'fb-watchman' {
  export class ClientPrototype {
    public domain: any;
    public addListener(type: any, listener: any): any;
    public cancelCommands(why: any): void;
    public capabilityCheck(capabilities: any, onCapabilityCheck: (error: string) => void): void;
    public command(params: any[], onCommand: (error: string) => void): void;
    public connect(): void;
    public emit(type: any, ...args: any[]): any;
    public end(): void;
    public eventNames(): any;
    public getMaxListeners(): any;
    public listenerCount(type: any): any;
    public listeners(type: any): any;
    public on(subscription: string, onSubscription: (resp: SubscriptionResponse) => void): void;
    public once(type: any, listener: any): any;
    public prependListener(type: any, listener: any): any;
    public prependOnceListener(type: any, listener: any): any;
    public removeAllListeners(type: any, ...args: any[]): any;
    public removeListener(type: any, listener: any): any;
    public sendNextCommand(): void;
    public setMaxListeners(n: any): any;
  }

  export class Client extends ClientPrototype {
    public constructor(options?: any);
    public cancelCommands(why: any): void;
    public capabilityCheck(capabilities: any, onCapabilityCheck: (error: string) => void): void;
    public command(params: any[], onCommand: (error: string) => void): void;
    public connect(): void;
    public end(): void;
    public sendNextCommand(): void;
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
