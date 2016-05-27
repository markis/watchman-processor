
export interface Config {
  // changes the output to show debug information, cmd and stdout output
  debug?: boolean;
  
  // if your terminal window can support emojis  
  emoji?: boolean;

  // this limits the number files to pass to rsync.
  maxFileLength?: number;
  
  // default: 'rsync' -- override to whatever rsync command is installed or located
  rsyncCmd?: string;
  subscriptions?: any;
}

export interface SubConfig {
  type: 'rsync';
  source: string;
  destination: string;
  watchExpression?: (string | string[])[];
  state?: string;
  statusMessage?: string;
}