import { IMinimalApiBuilder } from "../core/builder";
import { CONTROLLER_METADATA_KEY, ROUTE_METADATA_KEY } from "./decorators";

/**
 * Controller base class
 */
export abstract class ControllerBase {
  /**
   * Register controller routes with the application builder
   */
  public static registerRoutes(
    builder: IMinimalApiBuilder,
    controllerType: any,
    instance: any
  ): void {
    // Get controller metadata
    const basePath =
      Reflect.getMetadata(CONTROLLER_METADATA_KEY, controllerType) || "";
    const routes =
      Reflect.getMetadata(ROUTE_METADATA_KEY, controllerType) || [];

    // Register routes
    for (const route of routes) {
      const { method, path, handlerName } = route;
      const fullPath = this.normalizePath(basePath, path);
      const handler = instance[handlerName].bind(instance);

      // Map route to builder
      builder.map(method, fullPath, handler);
    }
  }

  /**
   * Normalize path by combining base path and route path
   */
  private static normalizePath(basePath: string, routePath: string): string {
    // Remove trailing slash from base path
    if (basePath.endsWith("/")) {
      basePath = basePath.slice(0, -1);
    }

    // Add leading slash to base path if missing
    if (basePath && !basePath.startsWith("/")) {
      basePath = "/" + basePath;
    }

    // Remove trailing slash from route path
    if (routePath.endsWith("/")) {
      routePath = routePath.slice(0, -1);
    }

    // Add leading slash to route path if missing and base path is empty
    if (!basePath && routePath && !routePath.startsWith("/")) {
      routePath = "/" + routePath;
    }

    // Combine paths
    return (
      basePath +
      (routePath.startsWith("/") || !routePath ? routePath : "/" + routePath)
    );
  }
}

/**
 * Controller factory for creating and registering controllers
 */
export class ControllerFactory {
  /**
   * Create and register a controller
   */
  public static createAndRegister<T extends ControllerBase>(
    builder: IMinimalApiBuilder,
    controllerType: new (...args: any[]) => T,
    ...args: any[]
  ): T {
    // Create controller instance
    const instance = new controllerType(...args);

    // Register routes
    ControllerBase.registerRoutes(builder, controllerType, instance);

    return instance;
  }
}
