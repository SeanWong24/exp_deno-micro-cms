import { parse as parseFlags } from "../deps/std/flags.ts";

export type DBInitCallback = (db: Deno.Kv) => Promise<void>;

class StringBasedConfig {
  logging?: string | boolean;
  cors?: string | boolean;
  passcode?: string;
  frontends?: string;
  dbPath?: string;
  listenTo?: string;
}

const ENV_NAME_DICT: Record<keyof StringBasedConfig, string> = {
  logging: "LOGGING",
  cors: "CORS",
  passcode: "PASSCODE",
  frontends: "FRONTENDS",
  dbPath: "DB_PATH",
  listenTo: "LISTEN_TO",
};

const FLAG_NAME_DICT: Record<keyof StringBasedConfig, string> = {
  logging: "logging",
  cors: "cors",
  passcode: "passcode",
  frontends: "frontends",
  dbPath: "db-path",
  listenTo: "listen-to",
};

export class AppConfig extends StringBasedConfig {
  dbInitCallback?: DBInitCallback;

  get resolvedFrontendConfigs() {
    const configStrings = this.frontends?.split(",");
    return configStrings?.map((configString) =>
      this.#resolveFrontendConfigString(configString)
    );
  }

  applyEnv() {
    Object.keys(new StringBasedConfig()).forEach((key) => {
      const propName = key as keyof StringBasedConfig;
      const value = Deno.env.get(ENV_NAME_DICT[propName]);
      if (value == null) return;
      this[propName] = value;
    });
    return this;
  }

  applyFlags(flags: string[]) {
    const flagDict = parseFlags(flags);
    Object.keys(new StringBasedConfig()).forEach((key) => {
      const propName = key as keyof StringBasedConfig;
      const value = flagDict[FLAG_NAME_DICT[propName]];
      if (value == null) return;
      this[propName] = value;
    });
    return this;
  }

  applyPartial(config: Partial<AppConfig>) {
    return Object.assign(this, config);
  }

  #resolveFrontendConfigString(configString: string) {
    const [baseRoute, rootDirectory, indexPath] = configString.split(":");
    return { baseRoute, rootDirectory, indexPath };
  }
}

export const APP_CONFIG = new AppConfig();
