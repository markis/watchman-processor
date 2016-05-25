export interface WatchmanClient {
  
}

export interface SubscriptionResponse {
  subscription: string;
  files: SubscriptionResponseFile[];
}

export interface SubscriptionResponseFile {
  name: string;
}