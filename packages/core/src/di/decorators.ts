// Decorators for dependency injection
import "reflect-metadata";
import { ServiceLifetime } from "./types";

// Metadata keys
export const INJECTABLE_METADATA_KEY = "ts-core:injectable";
export const INJECT_METADATA_KEY = "ts-core:inject";

/**
 * Marks a class as injectable
 * @param lifetime The service lifetime (default: Singleton)
 */
export function Injectable(
  lifetime: ServiceLifetime = ServiceLifetime.Singleton
) {
  return function (target: any) {
    Reflect.defineMetadata(INJECTABLE_METADATA_KEY, lifetime, target);
    return target;
  };
}

/**
 * Singleton service decorator
 */
export function Singleton() {
  return Injectable(ServiceLifetime.Singleton);
}

/**
 * Scoped service decorator
 */
export function Scoped() {
  return Injectable(ServiceLifetime.Scoped);
}

/**
 * Transient service decorator
 */
export function Transient() {
  return Injectable(ServiceLifetime.Transient);
}

/**
 * Inject dependency decorator
 * @param token The token to inject
 */
export function Inject(token?: any) {
  return function (
    target: any,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) {
    const existingInjections =
      Reflect.getOwnMetadata(INJECT_METADATA_KEY, target) || [];
    const type =
      token || Reflect.getMetadata("design:paramtypes", target)[parameterIndex];

    existingInjections.push({
      index: parameterIndex,
      type,
    });

    Reflect.defineMetadata(INJECT_METADATA_KEY, existingInjections, target);
  };
}
