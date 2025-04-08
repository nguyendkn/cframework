import { IServiceCollection } from "@core/di";
import { IMinimalApiBuilder, MinimalApiBuilder } from "./builder";
import { ApplicationHost, IApplicationBuilder, IApplicationHost } from "@core/http";

export interface IMinimalApiApplication {
  configureServices(
    configureServices: (services: IServiceCollection) => void
  ): IMinimalApiApplication;
  configure(
    configure: (app: IMinimalApiBuilder) => void
  ): IMinimalApiApplication;
  run(port?: number): Promise<void>;
}

/**
 * Minimal API application implementation
 */
export class MinimalApiApplication implements IMinimalApiApplication {
  private readonly _host: IApplicationHost;
  private _configureApp: ((app: IMinimalApiBuilder) => void) | null = null;

  constructor() {
    this._host = new ApplicationHost();
  }

  /**
   * Configure services
   */
  public configureServices(
    configureServices: (services: IServiceCollection) => void
  ): IMinimalApiApplication {
    this._host.configureServices(configureServices);
    return this;
  }

  /**
   * Configure application
   */
  public configure(
    configure: (app: IMinimalApiBuilder) => void
  ): IMinimalApiApplication {
    this._configureApp = configure;
    return this;
  }

  /**
   * Run the application
   */
  public async run(port: number = 3000): Promise<void> {
    if (!this._configureApp) {
      throw new Error("Application configuration is required");
    }

    this._host.configure((appBuilder: IApplicationBuilder) => {
      // Create minimal API builder
      // Get the service provider from the application builder
      // This is a workaround for the missing getServiceProvider method
      const serviceProvider = (appBuilder as any).serviceProvider;
      const minimalApiBuilder = new MinimalApiBuilder(serviceProvider);

      // Configure minimal API
      if (this._configureApp) {
        this._configureApp(minimalApiBuilder);
      }

      // Build application
      const app = minimalApiBuilder.build();

      // Configure Express application
      app.build();
    });

    return this._host.run(port);
  }
}
