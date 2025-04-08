/**
 * Configuration interface
 */
export interface IConfiguration {
  get<T>(key: string): T | undefined;
  getSection(section: string): IConfigurationSection;
}

/**
 * Configuration section interface
 */
export interface IConfigurationSection extends IConfiguration {
  readonly key: string;
  readonly path: string;
  readonly value: any;
}

/**
 * Configuration implementation
 */
export class Configuration implements IConfiguration {
  constructor(private readonly _configData: Record<string, any> = {}) {}

  /**
   * Get a configuration value
   */
  public get<T>(key: string): T | undefined {
    const parts = key.split(":");
    let current = this._configData;

    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined;
      }

      current = current[part];
    }

    return current as T;
  }

  /**
   * Get a configuration section
   */
  public getSection(section: string): IConfigurationSection {
    return new ConfigurationSection(this, section);
  }
}

/**
 * Configuration section implementation
 */
class ConfigurationSection implements IConfigurationSection {
  readonly path: string;
  readonly value: any;

  constructor(
    private readonly _configuration: IConfiguration,
    readonly key: string
  ) {
    this.path = key;
    this.value = _configuration.get(key);
  }

  /**
   * Get a configuration value
   */
  public get<T>(key: string): T | undefined {
    return this._configuration.get<T>(`${this.path}:${key}`);
  }

  /**
   * Get a configuration section
   */
  public getSection(section: string): IConfigurationSection {
    return new ConfigurationSection(
      this._configuration,
      `${this.path}:${section}`
    );
  }
}
