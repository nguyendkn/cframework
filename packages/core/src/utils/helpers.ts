/**
 * Helper functions for the framework
 */

/**
 * Check if a value is null or undefined
 */
export function isNullOrUndefined(value: any): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Check if a value is a string
 */
export function isString(value: any): value is string {
  return typeof value === "string";
}

/**
 * Check if a value is a number
 */
export function isNumber(value: any): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Check if a value is a boolean
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === "boolean";
}

/**
 * Check if a value is an object
 */
export function isObject(value: any): value is object {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Check if a value is an array
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

/**
 * Check if a value is a function
 */
export function isFunction(value: any): value is Function {
  return typeof value === "function";
}

/**
 * Check if a value is a class (constructor function)
 */
export function isClass(value: any): boolean {
  return isFunction(value) && /^\s*class\s+/.test(value.toString());
}

/**
 * Get the name of a type
 */
export function getTypeName(type: any): string {
  if (isNullOrUndefined(type)) {
    return "undefined";
  }

  if (isString(type)) {
    return type;
  }

  if (isFunction(type)) {
    return type.name || "anonymous";
  }

  return type.constructor?.name || "unknown";
}

/**
 * Create a typed proxy for a service
 */
export function createServiceProxy<T>(target: any): T {
  return new Proxy(target, {
    get(target, prop) {
      if (typeof prop === "string" && !(prop in target)) {
        throw new Error(
          `Method or property '${prop}' does not exist on service '${getTypeName(target)}'`
        );
      }
      return target[prop];
    },
  }) as T;
}
