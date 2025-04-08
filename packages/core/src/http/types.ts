import { Request, Response } from "express";
import { IServiceProvider } from "../di/interfaces";

/**
 * Type definitions for HTTP module
 */
export interface HttpContext {
  request: Request;
  response: Response;
  serviceProvider: IServiceProvider;
}

export type RequestDelegate = (context: HttpContext) => Promise<void>;
export type MiddlewareFunction = (
  context: HttpContext,
  next: () => Promise<void>
) => Promise<void>;

/**
 * Get the service provider from the request
 */
export function getServiceProvider(req: Request): IServiceProvider {
  return (req as any).serviceProvider;
}

/**
 * Create a new HTTP context
 */
export function createHttpContext(req: Request, res: Response): HttpContext {
  return {
    request: req,
    response: res,
    serviceProvider: getServiceProvider(req),
  };
}
