import { HttpMethod } from "../core/types";

/**
 * Route decorator metadata key
 */
export const ROUTE_METADATA_KEY = "ts-core:minimal-api:route";

/**
 * Controller decorator metadata key
 */
export const CONTROLLER_METADATA_KEY = "ts-core:minimal-api:controller";

/**
 * Controller decorator
 * @param basePath Base path for all routes in the controller
 */
export function Controller(basePath: string = "") {
  return function (target: Function) {
    Reflect.defineMetadata(CONTROLLER_METADATA_KEY, basePath, target);
    return target;
  };
}

/**
 * Route decorator factory
 * @param method HTTP method
 * @param path Route path
 */
function createRouteDecorator(method: HttpMethod, path: string = "") {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const routes =
      Reflect.getMetadata(ROUTE_METADATA_KEY, target.constructor) || [];

    routes.push({
      method,
      path,
      handlerName: propertyKey,
    });

    Reflect.defineMetadata(ROUTE_METADATA_KEY, routes, target.constructor);
    return descriptor;
  };
}

/**
 * GET route decorator
 */
export function Get(path: string = "") {
  return createRouteDecorator(HttpMethod.GET, path);
}

/**
 * POST route decorator
 */
export function Post(path: string = "") {
  return createRouteDecorator(HttpMethod.POST, path);
}

/**
 * PUT route decorator
 */
export function Put(path: string = "") {
  return createRouteDecorator(HttpMethod.PUT, path);
}

/**
 * DELETE route decorator
 */
export function Delete(path: string = "") {
  return createRouteDecorator(HttpMethod.DELETE, path);
}

/**
 * PATCH route decorator
 */
export function Patch(path: string = "") {
  return createRouteDecorator(HttpMethod.PATCH, path);
}

/**
 * OPTIONS route decorator
 */
export function Options(path: string = "") {
  return createRouteDecorator(HttpMethod.OPTIONS, path);
}

/**
 * HEAD route decorator
 */
export function Head(path: string = "") {
  return createRouteDecorator(HttpMethod.HEAD, path);
}
