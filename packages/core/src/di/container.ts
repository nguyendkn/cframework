import {
  IServiceCollection,
  IServiceProvider,
  IServiceScope,
} from "./interfaces";
import { Constructor, ServiceDescriptor, ServiceLifetime } from "./types";
import { INJECT_METADATA_KEY } from "./decorators";

/**
 * Container implementation for dependency injection
 */
export class ServiceCollection implements IServiceCollection {
  private readonly _services: ServiceDescriptor[] = [];

  /**
   * Add a singleton service to the collection
   */
  public addSingleton<T>(
    serviceType: Constructor<T>,
    implementationType?: Constructor<T>
  ): IServiceCollection {
    return this.add(
      serviceType,
      implementationType || serviceType,
      ServiceLifetime.Singleton
    );
  }

  /**
   * Add a scoped service to the collection
   */
  public addScoped<T>(
    serviceType: Constructor<T>,
    implementationType?: Constructor<T>
  ): IServiceCollection {
    return this.add(
      serviceType,
      implementationType || serviceType,
      ServiceLifetime.Scoped
    );
  }

  /**
   * Add a transient service to the collection
   */
  public addTransient<T>(
    serviceType: Constructor<T>,
    implementationType?: Constructor<T>
  ): IServiceCollection {
    return this.add(
      serviceType,
      implementationType || serviceType,
      ServiceLifetime.Transient
    );
  }

  /**
   * Add a service to the collection
   */
  private add<T>(
    serviceType: Constructor<T>,
    implementationType: Constructor<T>,
    lifetime: ServiceLifetime
  ): IServiceCollection {
    this._services.push({
      serviceType,
      implementationType,
      lifetime,
    });
    return this;
  }

  /**
   * Build the service provider
   */
  public buildServiceProvider(): IServiceProvider {
    return new ServiceProvider(this._services);
  }
}

/**
 * Service provider implementation
 */
class ServiceProvider implements IServiceProvider {
  private readonly _singletonInstances = new Map<any, any>();
  private readonly _descriptors = new Map<any, ServiceDescriptor>();

  constructor(descriptors: ServiceDescriptor[]) {
    // Register the service provider itself
    this._singletonInstances.set(ServiceProvider, this);
    // Register this instance as the IServiceProvider implementation
    // Using type as string to avoid TS2693 error
    this._singletonInstances.set('IServiceProvider', this);

    // Register all descriptors
    for (const descriptor of descriptors) {
      this._descriptors.set(descriptor.serviceType, descriptor);
    }
  }

  /**
   * Get a service from the provider
   */
  public getService<T>(serviceType: Constructor<T>): T {
    return this.resolveService(serviceType);
  }

  /**
   * Create a new scope
   */
  public createScope(): IServiceScope {
    return new ServiceScope(this);
  }

  /**
   * Resolve a service
   */
  private resolveService<T>(
    serviceType: Constructor<T>,
    scopedInstances?: Map<any, any>
  ): T {
    // Check if we already have an instance for singletons
    if (this._singletonInstances.has(serviceType)) {
      return this._singletonInstances.get(serviceType);
    }

    // Check if we have a scoped instance
    if (scopedInstances && scopedInstances.has(serviceType)) {
      return scopedInstances.get(serviceType);
    }

    // Get the descriptor
    const descriptor = this._descriptors.get(serviceType);
    if (!descriptor) {
      throw new Error(`Service ${serviceType.name} is not registered`);
    }

    // Create the instance
    const instance = this.createInstance(
      descriptor.implementationType,
      scopedInstances
    );

    // Store the instance based on lifetime
    if (descriptor.lifetime === ServiceLifetime.Singleton) {
      this._singletonInstances.set(serviceType, instance);
    } else if (
      descriptor.lifetime === ServiceLifetime.Scoped &&
      scopedInstances
    ) {
      scopedInstances.set(serviceType, instance);
    }

    return instance as T;
  }

  /**
   * Create an instance of a type
   */
  private createInstance<T>(
    type: Constructor<T>,
    scopedInstances?: Map<any, any>
  ): T {
    // Get constructor parameters
    const paramTypes = Reflect.getMetadata("design:paramtypes", type) || [];
    const injections = Reflect.getMetadata(INJECT_METADATA_KEY, type) || [];

    // Resolve dependencies
    const params = paramTypes.map((paramType: any, index: number) => {
      // Check if we have an explicit injection
      const injection = injections.find((i: any) => i.index === index);
      const serviceType = injection ? injection.type : paramType;

      return this.resolveService(serviceType, scopedInstances);
    });

    // Create the instance
    return new type(...params);
  }
}

/**
 * Service scope implementation
 */
class ServiceScope implements IServiceScope {
  private readonly _scopedInstances = new Map<any, any>();
  private _disposed = false;

  constructor(private readonly _rootProvider: ServiceProvider) {}

  /**
   * Get the service provider for this scope
   */
  public get serviceProvider(): IServiceProvider {
    if (this._disposed) {
      throw new Error("Service scope has been disposed");
    }

    return {
      getService: <T>(serviceType: Constructor<T>): T => {
        return this._rootProvider["resolveService"](
          serviceType,
          this._scopedInstances
        );
      },
      createScope: (): IServiceScope => {
        return this._rootProvider.createScope();
      },
    };
  }

  /**
   * Dispose the scope
   */
  public dispose(): void {
    this._disposed = true;
    this._scopedInstances.clear();
  }
}
