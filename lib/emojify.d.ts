declare interface Emoji {
  emojify(msg: string): string;
}

declare var emoji: Emoji;

declare module 'node-emoji' {
  export = emoji;
}
