type enabledTypes = string | number | boolean;

type Commands = {
  name: string;
  default: enabledTypes;
  alias?: Array<string>;
  description?: string;
};

type Config = {
  skipDefaultArgv: boolean;
  continueWithDefaultArgv: boolean;
};

class Cli {
  private globalCommands: Map<string, Commands> = new Map<string, Commands>();
  private config!: Config;
  private argv!: Array<string>;
  private opts: any = {};

  constructor(
    commands: Array<Commands>,
    config: Config = { skipDefaultArgv: false, continueWithDefaultArgv: false },
  ) {
    this.set(commands, config);
    this.run();
  }

  set(commands: Array<Commands>, config: Config) {
    commands.forEach((c) => this.globalCommands.set(c.name, c));
    this.config = config;
  }

  run() {
    this.argv = !this.config.skipDefaultArgv
      ? process.argv.slice(2)
      : process.argv;

    this.checkArgv();
    this.fill();
    this.logic();
  }

  fill() {
    this.globalCommands.forEach(
      (value: Commands, key: string) => (this.opts[key] = value.default),
    );
  }

  logic() {
    let index = 0;
    let continueWhile = true;
    while (continueWhile) {
      if (!this.globalCommands.has(this.argv[index])) throw new Error();
      const command = this.globalCommands.get(this.argv[index]);

      switch (typeof command?.default) {
        case 'boolean':
          this.opts[command.name] = !command?.default;
          index += 1;
          break;
        case 'string':
          this.opts[command.name] = this.argv[index + 1];
          index += 2;
          break;
        case 'number':
          this.opts[command.name] = this.argv[index + 1];
          index += 2;
          break;
        default:
          throw new Error();
      }

      if (this.argv.length - 1 >= index) continueWhile = false;
    }
  }

  checkArgv() {
    if (this.argv.length === 0 && !this.config.skipDefaultArgv)
      throw new Error();

    if (
      this.argv.length < 2 &&
      this.config.skipDefaultArgv &&
      !this.config.continueWithDefaultArgv
    )
      throw new Error();
  }
}

export const Argxz = (commands: Array<Commands>, config: Config) =>
  new Cli(commands, config);
