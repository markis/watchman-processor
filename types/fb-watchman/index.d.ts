declare interface WatchmanClient {
  capabilityCheck(capabilities: any, onCapabilityCheck: (error: string) => void): void;
  on(subscription: string, onSubscription: (resp: SubscriptionResponse) => void): void;
  command(params: any[], onCommand?: (error: string) => void): void;
  end(): void;
}

declare interface SubscriptionResponse {
  subscription: string;
  files: SubscriptionResponseFile[];
}

declare interface SubscriptionResponseFile {
  name: string;
}

declare module 'fb-watchman' {
  export var Client: {
    new (): WatchmanClient;
  };
}