import express, { Express, Request, Response, NextFunction } from 'express';
import { IServiceProvider } from '../di/interfaces';

export interface IApplicationBuilder {
  useMiddleware(middleware: (req: Request, res: Response, next: NextFunction) => void): IApplicationBuilder;
  build(): Express;
}

export class ApplicationBuilder implements IApplicationBuilder {
  private readonly _app: Express;
  private readonly _serviceProvider: IServiceProvider;

  constructor(serviceProvider: IServiceProvider) {
    this._app = express();
    this._serviceProvider = serviceProvider;
    
    // Add service provider to request
    this._app.use((req: Request, res: Response, next: NextFunction) => {
      (req as any).serviceProvider = this._serviceProvider;
      next();
    });
  }

  /**
   * Use middleware
   */
  public useMiddleware(middleware: (req: Request, res: Response, next: NextFunction) => void): IApplicationBuilder {
    this._app.use(middleware);
    return this;
  }

  /**
   * Build the application
   */
  public build(): Express {
    return this._app;
  }
}
