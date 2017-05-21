
export class Utils {
  /**
   * Wraps process.stderr.write, so that we can mock this method in tests
   *
   * @param {string} msg
   */
  public static error(msg: string) {
    process.stderr.write(msg);
  }

  /**
   * Wraps process.stdout.write, so that we mock this method in tests
   *
   * @param {string} msg
   */
  public static log(msg: string) {
    process.stdout.write(msg);
  }

  /**
   * No-operation function
   */
  public static noop() {
    // do nothing
  }
}
