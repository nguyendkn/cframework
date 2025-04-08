// Service lifetime types
export enum ServiceLifetime {
  Singleton,
  Scoped,
  Transient,
}

// Type definitions for dependency injection
export type ServiceDescriptor = {
  serviceType: any;
  implementationType: any;
  lifetime: ServiceLifetime;
};

export type Constructor<T = any> = new (...args: any[]) => T;
