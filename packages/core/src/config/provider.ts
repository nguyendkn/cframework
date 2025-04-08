import { IConfiguration, Configuration } from "./configuration";
import { IServiceCollection } from "../di/interfaces";
import { Singleton } from "../di/decorators";

/**
 * Configuration provider interface
 */
export interface IConfigurationProvider {
  load(): Promise<Record<string, any>>;
}

/**
 * Environment variables configuration provider
 */
@Singleton()
export class EnvironmentConfigurationProvider
  implements IConfigurationProvider
{
  constructor(private readonly prefix: string = "") {}

  /**
   * Load configuration from environment variables
   */
  public async load(): Promise<Record<string, any>> {
    const config: Record<string, any> = {};

    for (const key in process.env) {
      if (this.prefix && !key.startsWith(this.prefix)) {
        continue;
      }

      const configKey = this.prefix ? key.substring(this.prefix.length) : key;
      this.setConfigValue(
        config,
        configKey.split("__").join(":"),
        process.env[key] as string
      );
    }

    return config;
  }

  /**
   * Set a configuration value
   */
  private setConfigValue(
    config: Record<string, any>,
    key: string,
    value: string
  ): void {
    const parts = key.split(":");
    let current = config;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    current[lastPart] = this.parseValue(value);
  }

  /**
   * Parse a configuration value
   */
  private parseValue(value: string): any {
    // Try to parse as number
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return Number(value);
    }

    // Try to parse as boolean
    if (value.toLowerCase() === "true") {
      return true;
    }
    if (value.toLowerCase() === "false") {
      return false;
    }

    // Return as string
    return value;
  }
}

/**
 * JSON file configuration provider
 */
@Singleton()
export class JsonFileConfigurationProvider implements IConfigurationProvider {
  constructor(private readonly filePath: string) {}

  /**
   * Load configuration from a JSON file
   */
  public async load(): Promise<Record<string, any>> {
    try {
      // Use dynamic import to avoid Node.js specific imports at the top level
      const fs = await import("fs/promises");
      const content = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error(
        `Error loading configuration from ${this.filePath}:`,
        error
      );
      return {};
    }
  }
}

/**
 * Configuration builder
 */
export class ConfigurationBuilder {
  private readonly _providers: IConfigurationProvider[] = [];

  /**
   * Add a configuration provider
   */
  public addProvider(provider: IConfigurationProvider): ConfigurationBuilder {
    this._providers.push(provider);
    return this;
  }

  /**
   * Add environment variables
   */
  public addEnvironmentVariables(prefix: string = ""): ConfigurationBuilder {
    return this.addProvider(new EnvironmentConfigurationProvider(prefix));
  }

  /**
   * Add a JSON file
   */
  public addJsonFile(filePath: string): ConfigurationBuilder {
    return this.addProvider(new JsonFileConfigurationProvider(filePath));
  }

  /**
   * Build the configuration
   */
  public async build(): Promise<IConfiguration> {
    let configData: Record<string, any> = {};

    for (const provider of this._providers) {
      const data = await provider.load();
      configData = this.mergeConfigurations(configData, data);
    }

    return new Configuration(configData);
  }

  /**
   * Merge configurations
   */
  private mergeConfigurations(
    target: Record<string, any>,
    source: Record<string, any>
  ): Record<string, any> {
    const result = { ...target };

    for (const key in source) {
      if (
        typeof source[key] === "object" &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        result[key] = this.mergeConfigurations(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }
}

/**
 * Extension methods for IServiceCollection
 */
export function addConfiguration(
  services: IServiceCollection,
  configureBuilder: (builder: ConfigurationBuilder) => ConfigurationBuilder
): Promise<IServiceCollection> {
  return (async () => {
    const builder = new ConfigurationBuilder();
    const configuration = await configureBuilder(builder).build();

    // Using string as type to avoid TS2693 error
    services.addSingleton('IConfiguration', { useValue: configuration });

    return services;
  })();
}
