import {
  DataSource,
  DataSourceOptions,
  EntityTarget,
  ObjectLiteral,
  Repository,
} from "typeorm";
import { IDbSet, DbSet } from "./dbset";
import { IServiceProvider } from "@core/di/interfaces";

/**
 * DbContext options interface
 */
export interface DbContextOptions {
  dataSourceOptions: DataSourceOptions;
}

/**
 * DbContext base class for database operations
 */
export abstract class DbContext {
  private readonly _dataSource: DataSource;
  private readonly _pendingChanges: Map<
    any,
    { entity: any; operation: "add" | "update" | "remove" }
  > = new Map();
  private readonly _dbSets: Map<string, IDbSet<any>> = new Map();
  private _isInitialized = false;

  constructor(
    private readonly _options: DbContextOptions,
    private readonly _serviceProvider?: IServiceProvider
  ) {
    this._dataSource = new DataSource(_options.dataSourceOptions);
  }

  /**
   * Initialize the context
   */
  public async initialize(): Promise<void> {
    if (this._isInitialized) {
      return;
    }

    await this._dataSource.initialize();
    this._isInitialized = true;
  }

  /**
   * Get the underlying connection
   */
  public getConnection(): DataSource {
    if (!this._isInitialized) {
      throw new Error("DbContext is not initialized");
    }

    return this._dataSource;
  }

  /**
   * Get a repository for an entity
   */
  public getRepository<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>
  ): Repository<Entity> {
    return this.getConnection().getRepository(entityClass);
  }

  /**
   * Get a DbSet for an entity
   */
  protected getDbSet<TEntity extends ObjectLiteral>(
    entityType: EntityTarget<TEntity>,
    propertyName: string
  ): IDbSet<TEntity> {
    if (!this._dbSets.has(propertyName)) {
      this._dbSets.set(propertyName, new DbSet<TEntity>(this, entityType));
    }

    return this._dbSets.get(propertyName) as IDbSet<TEntity>;
  }

  /**
   * Add an entity to the context
   */
  public add<TEntity>(entity: TEntity): void {
    this._pendingChanges.set(entity, { entity, operation: "add" });
  }

  /**
   * Update an entity in the context
   */
  public update<TEntity>(entity: TEntity): void {
    this._pendingChanges.set(entity, { entity, operation: "update" });
  }

  /**
   * Remove an entity from the context
   */
  public remove<TEntity>(entity: TEntity): void {
    this._pendingChanges.set(entity, { entity, operation: "remove" });
  }

  /**
   * Save changes to the database
   */
  public async saveChanges(): Promise<void> {
    if (!this._isInitialized) {
      throw new Error("DbContext is not initialized");
    }

    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const [_, change] of this._pendingChanges) {
        const repository = this._dataSource.getRepository(
          change.entity.constructor
        );

        switch (change.operation) {
          case "add":
            await repository.save(change.entity);
            break;
          case "update":
            await repository.save(change.entity);
            break;
          case "remove":
            await repository.remove(change.entity);
            break;
        }
      }

      await queryRunner.commitTransaction();
      this._pendingChanges.clear();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Dispose the context
   */
  public async dispose(): Promise<void> {
    if (this._isInitialized) {
      await this._dataSource.destroy();
      this._isInitialized = false;
    }
  }
}
