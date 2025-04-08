import { Router as ExpressRouter } from "express";
import { IMinimalApiBuilder } from "../core/builder";
import { EndpointHandler, EndpointMiddleware, HttpMethod } from "../core/types";

/**
 * Router interface
 */
export interface IRouter {
  use(middleware: EndpointMiddleware): IRouter;
  route(method: HttpMethod, path: string, handler: EndpointHandler): IRouter;
  get(path: string, handler: EndpointHandler): IRouter;
  post(path: string, handler: EndpointHandler): IRouter;
  put(path: string, handler: EndpointHandler): IRouter;
  delete(path: string, handler: EndpointHandler): IRouter;
  patch(path: string, handler: EndpointHandler): IRouter;
  options(path: string, handler: EndpointHandler): IRouter;
  head(path: string, handler: EndpointHandler): IRouter;
  group(prefix: string, configure: (router: IRouter) => void): IRouter;
  applyTo(builder: IMinimalApiBuilder, prefix?: string): void;
}

/**
 * Router implementation
 */
export class Router implements IRouter {
  private readonly _middlewares: EndpointMiddleware[] = [];
  private readonly _routes: Array<{
    method: HttpMethod;
    path: string;
    handler: EndpointHandler;
    middlewares: EndpointMiddleware[];
  }> = [];
  private readonly _groups: Array<{
    prefix: string;
    router: Router;
  }> = [];

  /**
   * Use middleware
   */
  public use(middleware: EndpointMiddleware): IRouter {
    this._middlewares.push(middleware);
    return this;
  }

  /**
   * Add a route
   */
  public route(
    method: HttpMethod,
    path: string,
    handler: EndpointHandler
  ): IRouter {
    this._routes.push({
      method,
      path,
      handler,
      middlewares: [...this._middlewares],
    });
    return this;
  }

  /**
   * Add a GET route
   */
  public get(path: string, handler: EndpointHandler): IRouter {
    return this.route(HttpMethod.GET, path, handler);
  }

  /**
   * Add a POST route
   */
  public post(path: string, handler: EndpointHandler): IRouter {
    return this.route(HttpMethod.POST, path, handler);
  }

  /**
   * Add a PUT route
   */
  public put(path: string, handler: EndpointHandler): IRouter {
    return this.route(HttpMethod.PUT, path, handler);
  }

  /**
   * Add a DELETE route
   */
  public delete(path: string, handler: EndpointHandler): IRouter {
    return this.route(HttpMethod.DELETE, path, handler);
  }

  /**
   * Add a PATCH route
   */
  public patch(path: string, handler: EndpointHandler): IRouter {
    return this.route(HttpMethod.PATCH, path, handler);
  }

  /**
   * Add an OPTIONS route
   */
  public options(path: string, handler: EndpointHandler): IRouter {
    return this.route(HttpMethod.OPTIONS, path, handler);
  }

  /**
   * Add a HEAD route
   */
  public head(path: string, handler: EndpointHandler): IRouter {
    return this.route(HttpMethod.HEAD, path, handler);
  }

  /**
   * Create a route group
   */
  public group(prefix: string, configure: (router: IRouter) => void): IRouter {
    const router = new Router();
    configure(router);

    this._groups.push({
      prefix,
      router,
    });

    return this;
  }

  /**
   * Apply routes to the application builder
   */
  public applyTo(builder: IMinimalApiBuilder, prefix: string = ""): void {
    // Apply routes
    for (const route of this._routes) {
      const fullPath = this.normalizePath(prefix, route.path);

      // Apply middlewares
      for (const middleware of route.middlewares) {
        builder.useMiddleware(middleware);
      }

      // Map route
      builder.map(route.method, fullPath, route.handler);
    }

    // Apply groups
    for (const group of this._groups) {
      const fullPrefix = this.normalizePath(prefix, group.prefix);
      group.router.applyTo(builder, fullPrefix);
    }
  }

  /**
   * Normalize path
   */
  private normalizePath(prefix: string, path: string): string {
    // Remove trailing slash from prefix
    if (prefix.endsWith("/")) {
      prefix = prefix.slice(0, -1);
    }

    // Add leading slash to prefix if missing
    if (prefix && !prefix.startsWith("/")) {
      prefix = "/" + prefix;
    }

    // Remove trailing slash from path
    if (path.endsWith("/")) {
      path = path.slice(0, -1);
    }

    // Add leading slash to path if missing and prefix is empty
    if (!prefix && path && !path.startsWith("/")) {
      path = "/" + path;
    }

    // Combine paths
    return prefix + (path.startsWith("/") || !path ? path : "/" + path);
  }
}
