import { EndpointMiddleware } from "./types";
import { HttpContext } from "@core/http";

/**
 * Common middleware functions for minimal API
 */

/**
 * CORS middleware
 */
export function cors(origins: string[] = ["*"]): EndpointMiddleware {
  return async (context: HttpContext, next: () => Promise<void>) => {
    const { response } = context;

    // Set CORS headers
    response.setHeader(
      "Access-Control-Allow-Origin",
      origins.includes("*") ? "*" : origins.join(",")
    );
    response.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    response.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    // Handle preflight requests
    if (context.request.method === "OPTIONS") {
      response.status(204).end();
      return;
    }

    await next();
  };
}

/**
 * JSON body parser middleware
 */
export function jsonBodyParser(): EndpointMiddleware {
  return async (context: HttpContext, next: () => Promise<void>) => {
    // Express already has body-parser integrated, so we just need to ensure it's JSON
    context.request.headers["content-type"] = "application/json";
    await next();
  };
}

/**
 * Error handling middleware
 */
export function errorHandler(): EndpointMiddleware {
  return async (context: HttpContext, next: () => Promise<void>) => {
    try {
      await next();
    } catch (error: any) {
      const { response } = context;

      // Log the error
      console.error("Error in request:", error);

      // Send error response
      const statusCode = error.statusCode || 500;
      const message = error.message || "Internal Server Error";

      response.status(statusCode).json({
        error: {
          message,
          statusCode,
        },
      });
    }
  };
}

/**
 * Request logging middleware
 */
export function requestLogger(): EndpointMiddleware {
  return async (context: HttpContext, next: () => Promise<void>) => {
    const { request } = context;
    const start = Date.now();

    console.log(
      `[${new Date().toISOString()}] ${request.method} ${request.url} - Started`
    );

    await next();

    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${request.method} ${request.url} - Completed in ${duration}ms`
    );
  };
}
