export interface WatchmanClient {
  capabilityCheck(capabilities: any, onCapabilityCheck: (error: string) => void): void;
  on(subscription: string, onSubscription: (resp: SubscriptionResponse) => void): void;
  command(params: any[], onCommand: (error: string) => void): void;
}

export interface SubscriptionResponse {
  subscription: string;
  files: SubscriptionResponseFile[];
}

export interface SubscriptionResponseFile {
  name: string;
}