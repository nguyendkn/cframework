import { IServiceCollection, IServiceProvider } from "../di/interfaces";
import { ServiceCollection } from "../di/container";
import { ApplicationBuilder, IApplicationBuilder } from "./application";
import { Express } from "express";

/**
 * Application host interface
 */
export interface IApplicationHost {
  configureServices(
    configureServices: (services: IServiceCollection) => void
  ): IApplicationHost;
  configure(configure: (app: IApplicationBuilder) => void): IApplicationHost;
  build(): Express;
  run(port?: number): Promise<void>;
}

/**
 * Application host implementation
 */
export class ApplicationHost implements IApplicationHost {
  private readonly _services: IServiceCollection;
  private _serviceProvider: IServiceProvider | null = null;
  private _configureApp: ((app: IApplicationBuilder) => void) | null = null;

  constructor() {
    this._services = new ServiceCollection();
  }

  /**
   * Configure services
   */
  public configureServices(
    configureServices: (services: IServiceCollection) => void
  ): IApplicationHost {
    configureServices(this._services);
    return this;
  }

  /**
   * Configure application
   */
  public configure(
    configure: (app: IApplicationBuilder) => void
  ): IApplicationHost {
    this._configureApp = configure;
    return this;
  }

  /**
   * Build the application
   */
  public build(): Express {
    if (!this._configureApp) {
      throw new Error("Application configuration is required");
    }

    // Build service provider
    this._serviceProvider = this._services.buildServiceProvider();

    // Create application builder
    const appBuilder = new ApplicationBuilder(this._serviceProvider);

    // Configure application
    this._configureApp(appBuilder);

    // Build application
    return appBuilder.build();
  }

  /**
   * Run the application
   */
  public async run(port: number = 3000): Promise<void> {
    const app = this.build();

    return new Promise<void>((resolve) => {
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        resolve();
      });
    });
  }
}
