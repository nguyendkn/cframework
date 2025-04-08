import { DataSource, QueryRunner } from "typeorm";
import { IMigration } from "./migration";
import { IServiceCollection, Singleton } from "@core/di";

/**
 * Migrator interface
 */
export interface IMigrator {
  Migrate(): Promise<void>;
  rollback(steps?: number): Promise<void>;
  getMigrations(): IMigration[];
}

/**
 * Migrator implementation
 */
@Singleton()
export class Migrator implements IMigrator {
  constructor(
    private readonly _dataSource: DataSource,
    private readonly _migrations: IMigration[]
  ) {
    // Sort migrations by name to ensure consistent order
    this._migrations.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Apply pending migrations
   */
  public async Migrate(): Promise<void> {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();

    // Create migrations table if it doesn't exist
    await this.createMigrationsTable(queryRunner);

    // Get applied migrations
    const appliedMigrations = await this.getAppliedMigrations(queryRunner);

    // Apply pending migrations
    for (const migration of this._migrations) {
      if (!appliedMigrations.includes(migration.name)) {
        await queryRunner.startTransaction();

        try {
          console.log(`Applying migration: ${migration.name}`);
          await migration.up(queryRunner);

          // Record migration
          await queryRunner.query(
            `INSERT INTO migrations (name, applied_at) VALUES (?, ?)`,
            [migration.name, new Date().toISOString()]
          );

          await queryRunner.commitTransaction();
          console.log(`Migration applied: ${migration.name}`);
        } catch (error) {
          await queryRunner.rollbackTransaction();
          console.error(`Error applying migration ${migration.name}:`, error);
          throw error;
        }
      }
    }

    await queryRunner.release();
  }

  /**
   * Rollback migrations
   */
  public async rollback(steps: number = 1): Promise<void> {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();

    // Create migrations table if it doesn't exist
    await this.createMigrationsTable(queryRunner);

    // Get applied migrations
    const appliedMigrations = await this.getAppliedMigrations(queryRunner);

    // Get migrations to rollback
    const migrationsToRollback = this._migrations
      .filter((m) => appliedMigrations.includes(m.name))
      .sort((a, b) => b.name.localeCompare(a.name)) // Reverse order
      .slice(0, steps);

    // Rollback migrations
    for (const migration of migrationsToRollback) {
      await queryRunner.startTransaction();

      try {
        console.log(`Rolling back migration: ${migration.name}`);
        await migration.down(queryRunner);

        // Remove migration record
        await queryRunner.query(`DELETE FROM migrations WHERE name = ?`, [
          migration.name,
        ]);

        await queryRunner.commitTransaction();
        console.log(`Migration rolled back: ${migration.name}`);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error(`Error rolling back migration ${migration.name}:`, error);
        throw error;
      }
    }

    await queryRunner.release();
  }

  /**
   * Get all migrations
   */
  public getMigrations(): IMigration[] {
    return [...this._migrations];
  }

  /**
   * Create migrations table if it doesn't exist
   */
  private async createMigrationsTable(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at DATETIME NOT NULL
      )
    `);
  }

  /**
   * Get applied migrations
   */
  private async getAppliedMigrations(queryRunner: QueryRunner): Promise<string[]> {
    const result = await queryRunner.query(
      `SELECT name FROM migrations ORDER BY name ASC`
    );
    return result.map((row: any) => row.name);
  }
}

/**
 * Add migrations to the service collection
 */
export function AddMigrations(
  services: IServiceCollection,
  dataSource: DataSource,
  migrations: IMigration[]
): IServiceCollection {
  // Using string as type to avoid TS2693 error
  services.addSingleton('IMigrator', new Migrator(dataSource, migrations));
  return services;
}
