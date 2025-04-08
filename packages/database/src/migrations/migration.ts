import { QueryRunner } from "typeorm";

/**
 * Migration interface
 */
export interface IMigration {
  name: string;
  up(queryRunner: QueryRunner): Promise<void>;
  down(queryRunner: QueryRunner): Promise<void>;
}

/**
 * Base migration class
 */
export abstract class Migration implements IMigration {
  abstract name: string;

  /**
   * Apply the migration
   */
  abstract up(queryRunner: QueryRunner): Promise<void>;

  /**
   * Revert the migration
   */
  abstract down(queryRunner: QueryRunner): Promise<void>;
}
