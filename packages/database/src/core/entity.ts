import { EntityMetadata } from "typeorm";

/**
 * Entity interface
 */
export interface IEntity {
  id: number | string;
}

/**
 * Base entity class
 */
export abstract class Entity implements IEntity {
  id!: number | string;
}

/**
 * Repository interface
 */
export interface IRepository<TEntity extends IEntity> {
  findById(id: number | string): Promise<TEntity | null>;
  findAll(): Promise<TEntity[]>;
  create(entity: TEntity): Promise<TEntity>;
  update(entity: TEntity): Promise<TEntity>;
  delete(id: number | string): Promise<boolean>;
  getMetadata(): EntityMetadata;
}
