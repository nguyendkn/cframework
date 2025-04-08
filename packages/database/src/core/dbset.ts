import { EntityTarget, ObjectLiteral, Repository } from "typeorm";
import { DbContext } from "./context";

/**
 * DbSet interface for entity operations
 */
export interface IDbSet<TEntity extends ObjectLiteral> {
  add(entity: TEntity): void;
  addRange(entities: TEntity[]): void;
  remove(entity: TEntity): void;
  removeRange(entities: TEntity[]): void;
  find(id: any): Promise<TEntity | null>;
  findAll(): Promise<TEntity[]>;
  getRepository(): Repository<TEntity>;
}

/**
 * DbSet implementation for entity operations
 */
export class DbSet<TEntity extends ObjectLiteral> implements IDbSet<TEntity> {
  private readonly _repository: Repository<TEntity>;

  constructor(
    private readonly _context: DbContext,
    private readonly _entityType: EntityTarget<TEntity>
  ) {
    this._repository = _context.getConnection().getRepository(_entityType);
  }

  /**
   * Add an entity to the context
   */
  public add(entity: TEntity): void {
    this._context.add(entity);
  }

  /**
   * Add multiple entities to the context
   */
  public addRange(entities: TEntity[]): void {
    for (const entity of entities) {
      this.add(entity);
    }
  }

  /**
   * Remove an entity from the context
   */
  public remove(entity: TEntity): void {
    this._context.remove(entity);
  }

  /**
   * Remove multiple entities from the context
   */
  public removeRange(entities: TEntity[]): void {
    for (const entity of entities) {
      this.remove(entity);
    }
  }

  /**
   * Find an entity by id
   */
  public async find(id: any): Promise<TEntity | null> {
    return this._repository.findOneBy({ id } as any);
  }

  /**
   * Find all entities
   */
  public async findAll(): Promise<TEntity[]> {
    return this._repository.find();
  }

  /**
   * Get the underlying repository
   */
  public getRepository(): Repository<TEntity> {
    return this._repository;
  }
}
