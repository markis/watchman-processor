declare interface Chalk extends ChalkColors {
  bgGreen: ChalkColors;
  bgRed: ChalkColors;
  bgYellow: ChalkColors;
  bgWhite: ChalkColors;
}

declare interface ChalkColors {
  black(msg: string): string;
  red(msg: string): string;
  white(msg: string): string;
}

declare var chalk: Chalk;

declare module 'chalk' {
  export = chalk;
}