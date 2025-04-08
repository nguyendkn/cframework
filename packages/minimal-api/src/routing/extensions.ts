import { IMinimalApiBuilder } from "../core/builder";
import { IRouter, Router } from "./router";
import { Controller, ControllerFactory } from "../endpoints/controller";
import { IServiceCollection } from "@core/di";

/**
 * Extension methods for IMinimalApiBuilder
 */
export class MinimalApiBuilderExtensions {
  /**
   * Use a router
   */
  public static useRouter(
    builder: IMinimalApiBuilder,
    router: IRouter
  ): IMinimalApiBuilder {
    router.applyTo(builder);
    return builder;
  }

  /**
   * Map controllers
   */
  public static mapControllers(
    builder: IMinimalApiBuilder,
    controllers: Array<new (...args: any[]) => Controller>,
    serviceProvider?: any
  ): IMinimalApiBuilder {
    for (const controllerType of controllers) {
      // Create controller instance
      let instance: Controller;

      if (serviceProvider) {
        // Try to resolve from service provider
        try {
          instance = serviceProvider.getService(controllerType);
        } catch {
          instance = new controllerType();
        }
      } else {
        instance = new controllerType();
      }

      // Register routes
      Controller.registerRoutes(builder, controllerType, instance);
    }

    return builder;
  }
}

/**
 * Extension methods for IServiceCollection
 */
export class ServiceCollectionExtensions {
  /**
   * Add controllers to the service collection
   */
  public static addControllers(
    services: IServiceCollection,
    controllers: Array<new (...args: any[]) => Controller>
  ): IServiceCollection {
    for (const controller of controllers) {
      services.addScoped(controller);
    }

    return services;
  }
}
