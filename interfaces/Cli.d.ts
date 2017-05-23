declare interface Arguments {
  /**
   * Initialize the configuration file
   */
  init: boolean;

  /**
   * Load custom configuration file path
   */
  config: string;
}

declare interface Cli {
  getArguments(): Arguments;
}

export { Arguments, Cli };
