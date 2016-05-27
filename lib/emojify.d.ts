declare interface Emoji {
  emojify(msg: string): string;
}

declare module 'node-emoji' {
  export default Emoji;
}
