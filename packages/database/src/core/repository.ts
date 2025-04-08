import { EntityTarget, Repository } from "typeorm";
import { DbContext } from "./context";
import { IEntity, IRepository } from "./entity";

/**
 * Repository implementation
 */
export class EntityRepository<TEntity extends IEntity>
  implements IRepository<TEntity>
{
  private readonly _repository: Repository<TEntity>;

  constructor(
    private readonly _context: DbContext,
    private readonly _entityType: EntityTarget<TEntity>
  ) {
    this._repository = _context.getConnection().getRepository(_entityType);
  }

  /**
   * Find an entity by id
   */
  public async findById(id: number | string): Promise<TEntity | null> {
    return this._repository.findOneBy({ id } as any);
  }

  /**
   * Find all entities
   */
  public async findAll(): Promise<TEntity[]> {
    return this._repository.find();
  }

  /**
   * Create a new entity
   */
  public async create(entity: TEntity): Promise<TEntity> {
    this._context.add(entity);
    await this._context.saveChanges();
    return entity;
  }

  /**
   * Update an existing entity
   */
  public async update(entity: TEntity): Promise<TEntity> {
    this._context.update(entity);
    await this._context.saveChanges();
    return entity;
  }

  /**
   * Delete an entity by id
   */
  public async delete(id: number | string): Promise<boolean> {
    const entity = await this.findById(id);
    if (!entity) {
      return false;
    }

    this._context.remove(entity);
    await this._context.saveChanges();
    return true;
  }

  /**
   * Get entity metadata
   */
  public getMetadata() {
    return this._repository.metadata;
  }
}
