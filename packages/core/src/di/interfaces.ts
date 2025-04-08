// Core interfaces for dependency injection
export interface IServiceCollection {
  addSingleton<T>(
    serviceType: any,
    implementationType?: any
  ): IServiceCollection;
  addScoped<T>(serviceType: any, implementationType?: any): IServiceCollection;
  addTransient<T>(
    serviceType: any,
    implementationType?: any
  ): IServiceCollection;
  buildServiceProvider(): IServiceProvider;
}

export interface IServiceProvider {
  getService<T>(serviceType: any): T;
  createScope(): IServiceScope;
}

export interface IServiceScope {
  serviceProvider: IServiceProvider;
  dispose(): void;
}
