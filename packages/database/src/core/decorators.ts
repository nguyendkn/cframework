import {
  Column,
  Entity as TypeOrmEntity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  PrimaryColumnOptions,
} from "typeorm";

/**
 * Entity decorator
 * Marks a class as an entity
 */
export function Entity(tableName?: string) {
  return function (target: Function) {
    TypeOrmEntity(tableName)(target);
  };
}

/**
 * PrimaryKey decorator
 * Marks a property as the primary key
 */
export function PrimaryKey() {
  return function (target: Object, propertyKey: string | symbol) {
    PrimaryGeneratedColumn()(target, propertyKey);
  };
}

/**
 * PrimaryKeyColumn decorator
 * Marks a property as a primary key column with custom options
 */
export function PrimaryKeyColumn(options?: PrimaryColumnOptions) {
  return function (target: Object, propertyKey: string | symbol) {
    PrimaryColumn(options)(target, propertyKey);
  };
}

/**
 * Property decorator
 * Marks a property as a column
 */
export function Property(options?: any) {
  return function (target: Object, propertyKey: string | symbol) {
    Column(options)(target, propertyKey);
  };
}

/**
 * Required decorator
 * Marks a property as required
 */
export function Required() {
  return function (target: Object, propertyKey: string | symbol) {
    Column({ nullable: false })(target, propertyKey);
  };
}

/**
 * MaxLength decorator
 * Sets the maximum length for a string property
 */
export function MaxLength(length: number) {
  return function (target: Object, propertyKey: string | symbol) {
    Column({ length })(target, propertyKey);
  };
}

/**
 * DbContext decorator
 * Registers entities with the context
 */
export function DbContext(entities: Function[]) {
  return function (target: Function) {
    Reflect.defineMetadata("ts-core:ef:entities", entities, target);
  };
}
