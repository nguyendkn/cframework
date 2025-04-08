import { Request, Response, NextFunction } from "express";
import { MiddlewareFunction, createHttpContext } from "./types";

/**
 * Middleware class for the HTTP pipeline
 */
export class Middleware {
  /**
   * Create Express middleware from a middleware function
   */
  public static createMiddleware(
    middleware: MiddlewareFunction
  ): (req: Request, res: Response, next: NextFunction) => void {
    return async (req: Request, res: Response, next: NextFunction) => {
      const context = createHttpContext(req, res);

      try {
        await middleware(context, async () => {
          return new Promise<void>((resolve, reject) => {
            next((err?: any) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        });
      } catch (error) {
        next(error);
      }
    };
  }
}
