
export interface SubscriptionResponse {
  subscription: string;
  files: SubscriptionResponseFile[];
}

export interface SubscriptionResponseFile {
  name: string;
}