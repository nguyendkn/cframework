import { DbContextOptionsBuilder } from "../core/interfaces";

/**
 * SQLite provider configuration
 */
export interface SqliteProviderOptions {
  filename: string;
  memory?: boolean;
  synchronize?: boolean;
  logging?: boolean;
}

/**
 * Extension methods for DbContextOptionsBuilder for SQLite
 */
export function useSqlite(
  builder: DbContextOptionsBuilder,
  options: SqliteProviderOptions
): DbContextOptionsBuilder {
  const database = options.memory ? ":memory:" : options.filename;

  return builder
    .useSqlite(database, options.synchronize || false)
    .enableLogging(options.logging || false);
}
