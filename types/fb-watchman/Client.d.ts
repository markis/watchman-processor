import { ClientPrototype } from './ClientPrototype';

export class Client extends ClientPrototype {
  public constructor(options?: any);
  public cancelCommands(why: any): void;
  public capabilityCheck(capabilities: any, onCapabilityCheck: (error: string) => void): void;
  public command(params: any[], onCommand: (error: string) => void): void;
  public connect(): void;
  public end(): void;
  public sendNextCommand(): void;
}
