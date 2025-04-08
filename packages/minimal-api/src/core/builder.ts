import { NextFunction } from "express";
import { Request } from "express";
import { IServiceProvider } from "@core/di";
import {
  EndpointHandler,
  EndpointMiddleware,
  HttpMethod,
  RouteDefinition,
} from "./types";
import { ApplicationBuilder, IApplicationBuilder } from "@core/http";

/**
 * Minimal API application builder interface
 */
export interface IMinimalApiBuilder {
  useMiddleware(middleware: EndpointMiddleware): IMinimalApiBuilder;
  map(
    method: HttpMethod,
    path: string,
    handler: EndpointHandler
  ): IMinimalApiBuilder;
  mapGet(path: string, handler: EndpointHandler): IMinimalApiBuilder;
  mapPost(path: string, handler: EndpointHandler): IMinimalApiBuilder;
  mapPut(path: string, handler: EndpointHandler): IMinimalApiBuilder;
  mapDelete(path: string, handler: EndpointHandler): IMinimalApiBuilder;
  build(): IApplicationBuilder;
}

/**
 * Minimal API application builder implementation
 */
export class MinimalApiBuilder implements IMinimalApiBuilder {
  private readonly _routes: RouteDefinition[] = [];
  private readonly _middlewares: EndpointMiddleware[] = [];

  constructor(private readonly _serviceProvider: IServiceProvider) {}

  /**
   * Use middleware
   */
  public useMiddleware(middleware: EndpointMiddleware): IMinimalApiBuilder {
    this._middlewares.push(middleware);
    return this;
  }

  /**
   * Map a route
   */
  public map(
    method: HttpMethod,
    path: string,
    handler: EndpointHandler
  ): IMinimalApiBuilder {
    this._routes.push({
      path,
      method,
      handler,
      middlewares: [...this._middlewares],
    });
    return this;
  }

  /**
   * Map a GET route
   */
  public mapGet(path: string, handler: EndpointHandler): IMinimalApiBuilder {
    return this.map(HttpMethod.GET, path, handler);
  }

  /**
   * Map a POST route
   */
  public mapPost(path: string, handler: EndpointHandler): IMinimalApiBuilder {
    return this.map(HttpMethod.POST, path, handler);
  }

  /**
   * Map a PUT route
   */
  public mapPut(path: string, handler: EndpointHandler): IMinimalApiBuilder {
    return this.map(HttpMethod.PUT, path, handler);
  }

  /**
   * Map a DELETE route
   */
  public mapDelete(path: string, handler: EndpointHandler): IMinimalApiBuilder {
    return this.map(HttpMethod.DELETE, path, handler);
  }

  /**
   * Build the application
   */
  public build(): IApplicationBuilder {
    const appBuilder = new ApplicationBuilder(this._serviceProvider);

    // Register routes
    for (const route of this._routes) {
      const expressHandler = this.createRouteHandler(route);

      switch (route.method) {
        case HttpMethod.GET:
          // Use the express app directly as a workaround for the missing getRouter method
          (appBuilder as any).app.get(route.path, expressHandler);
          break;
        case HttpMethod.POST:
          // Use the express app directly as a workaround for the missing getRouter method
          (appBuilder as any).app.post(route.path, expressHandler);
          break;
        case HttpMethod.PUT:
          // Use the express app directly as a workaround for the missing getRouter method
          (appBuilder as any).app.put(route.path, expressHandler);
          break;
        case HttpMethod.DELETE:
          // Use the express app directly as a workaround for the missing getRouter method
          (appBuilder as any).app.delete(route.path, expressHandler);
          break;
        case HttpMethod.PATCH:
          // Use the express app directly as a workaround for the missing getRouter method
          (appBuilder as any).app.patch(route.path, expressHandler);
          break;
        case HttpMethod.OPTIONS:
          // Use the express app directly as a workaround for the missing getRouter method
          (appBuilder as any).app.options(route.path, expressHandler);
          break;
        case HttpMethod.HEAD:
          // Use the express app directly as a workaround for the missing getRouter method
          (appBuilder as any).app.head(route.path, expressHandler);
          break;
      }
    }

    return appBuilder;
  }

  /**
   * Create a route handler
   */
  private createRouteHandler(
    route: RouteDefinition
  ): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return async (req: any, res: any, next: any) => {
      try {
        const context = {
          request: req,
          response: res,
          serviceProvider: this._serviceProvider,
        };

        // Apply middlewares
        let middlewareIndex = 0;

        const executeMiddleware = async (): Promise<void> => {
          if (middlewareIndex < route.middlewares.length) {
            const middleware = route.middlewares[middlewareIndex++];
            await middleware(context, executeMiddleware);
          } else {
            // Execute handler
            const result = await route.handler(context);

            // Handle result
            if (result && typeof result.execute === "function") {
              await result.execute(context);
            } else if (result !== undefined && !res.headersSent) {
              res.json(result);
            }
          }
        };

        await executeMiddleware();
      } catch (error) {
        next(error);
      }
    };
  }
}
