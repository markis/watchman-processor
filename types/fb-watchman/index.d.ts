import { Client } from './Client';
import { SubscriptionResponse } from './SubscriptionResponse';

declare module 'fb-watchman' {
  export { Client, SubscriptionResponse };
}
