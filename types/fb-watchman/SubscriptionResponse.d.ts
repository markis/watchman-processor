export interface SubscriptionResponse {
  root: string;
  subscription: string;
  files: SubscriptionResponseFile[];
}

export interface SubscriptionResponseFile {
  exists: boolean;
  name: string;
  size: number;
  type: string;
}
