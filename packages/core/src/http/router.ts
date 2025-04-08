import {
  Router as ExpressRouter,
  Request,
  Response,
  NextFunction,
} from "express";
import { RequestDelegate, createHttpContext } from "./types";

/**
 * Router class for handling routes
 */
export class Router {
  private readonly _router: ExpressRouter;

  constructor() {
    this._router = ExpressRouter();
  }

  /**
   * Get the Express router
   */
  public getRouter(): ExpressRouter {
    return this._router;
  }

  /**
   * Add a GET route
   */
  public get(path: string, handler: RequestDelegate): Router {
    this._router.get(path, this.createRouteHandler(handler));
    return this;
  }

  /**
   * Add a POST route
   */
  public post(path: string, handler: RequestDelegate): Router {
    this._router.post(path, this.createRouteHandler(handler));
    return this;
  }

  /**
   * Add a PUT route
   */
  public put(path: string, handler: RequestDelegate): Router {
    this._router.put(path, this.createRouteHandler(handler));
    return this;
  }

  /**
   * Add a DELETE route
   */
  public delete(path: string, handler: RequestDelegate): Router {
    this._router.delete(path, this.createRouteHandler(handler));
    return this;
  }

  /**
   * Create a route handler from a request delegate
   */
  private createRouteHandler(
    handler: RequestDelegate
  ): (req: Request, res: Response, next: NextFunction) => void {
    return async (req: Request, res: Response, next: NextFunction) => {
      const context = createHttpContext(req, res);

      try {
        await handler(context);

        // If the response hasn't been sent, assume it's a next() call
        if (!res.headersSent) {
          next();
        }
      } catch (error) {
        next(error);
      }
    };
  }
}
