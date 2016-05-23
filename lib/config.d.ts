
export interface Config {
  // changes the output to show debug information, cmd and stdout output
  debug: boolean;
  
  // if your terminal window can support emojis  
  emoji: boolean;
  
  // default: 'rsync' -- override to whatever rsync command is installed or located
  rsyncCmd: string;
  subscriptions: any;
}

export interface SubConfig {
  type: 'rsync';
  source: string;
  destination: string;
  watchExpression: any[];
}