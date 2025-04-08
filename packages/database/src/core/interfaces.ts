import { DataSource, DataSourceOptions, EntityTarget } from "typeorm";
import { IServiceCollection } from "@core/di/interfaces";
import { Singleton } from "@core/di/decorators";
import { DbContext, DbContextOptions } from "./context";

/**
 * DbContextFactory interface
 */
export interface IDbContextFactory<TContext extends DbContext> {
  createDbContext(): Promise<TContext>;
}

/**
 * DbContextFactory implementation
 */
@Singleton()
export class DbContextFactory<TContext extends DbContext>
  implements IDbContextFactory<TContext>
{
  constructor(
    private readonly _contextType: new (options: DbContextOptions) => TContext,
    private readonly _options: DbContextOptions
  ) {}

  /**
   * Create a new DbContext instance
   */
  public async createDbContext(): Promise<TContext> {
    const context = new this._contextType(this._options);
    await context.initialize();
    return context;
  }
}

/**
 * DbContextOptions builder
 */
export class DbContextOptionsBuilder {
  public _dataSourceOptions: DataSourceOptions = {
    type: "sqlite",
    database: ":memory:",
    synchronize: false,
    logging: false,
    entities: [],
  };

  /**
   * Use SQLite database
   */
  public useSqlite(
    database: string,
    synchronize: boolean = false
  ): DbContextOptionsBuilder {
    // Create a mutable copy of the options
    const options = {
      ...this._dataSourceOptions,
      type: "sqlite" as const,
      database,
      synchronize,
    };
    this._dataSourceOptions = options as DataSourceOptions
    return this;
  }

  /**
   * Add entities to the context
   */
  public addEntities(entities: EntityTarget<any>[]): DbContextOptionsBuilder {
    // Create a mutable copy of the options
    const options = {
      ...this._dataSourceOptions,
      entities: [
        ...(Array.isArray(this._dataSourceOptions.entities) ? this._dataSourceOptions.entities : []),
        ...entities,
      ]
    };
    this._dataSourceOptions = options as DataSourceOptions;
    return this;
  }

  /**
   * Enable logging
   */
  public enableLogging(logging: boolean = true): DbContextOptionsBuilder {
    // Create a mutable copy of the options
    const options = {
      ...this._dataSourceOptions,
      logging
    };
    this._dataSourceOptions = options as DataSourceOptions;
    return this;
  }

  /**
   * Build the options
   */
  public build(): DbContextOptions {
    return {
      dataSourceOptions: this._dataSourceOptions,
    };
  }
}

/**
 * Add entity framework services to the service collection
 */
export function addEntityFramework(
  services: IServiceCollection
): IServiceCollection {
  // Add base services
  return services;
}

/**
 * Add a DbContext to the service collection
 */
export function addDbContext<TContext extends DbContext>(
  services: IServiceCollection,
  contextType: new (options: DbContextOptions) => TContext,
  configureOptions: (
    builder: DbContextOptionsBuilder
  ) => DbContextOptionsBuilder
): IServiceCollection {
  const builder = new DbContextOptionsBuilder();
  const options = configureOptions(builder).build();

  // Register the context factory using string as type to avoid TS2693 error
  services.addScoped(
    'IDbContextFactory',
    new DbContextFactory(contextType, options)
  );

  return services;
}
