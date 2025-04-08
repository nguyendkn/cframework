import { DbContextOptionsBuilder } from "../core/interfaces";

/**
 * PostgreSQL provider configuration
 */
export interface PostgresProviderOptions {
  host: string;
  port?: number;
  username: string;
  password: string;
  database: string;
  schema?: string;
  synchronize?: boolean;
  logging?: boolean;
  ssl?: boolean;
}

/**
 * Extension methods for DbContextOptionsBuilder for PostgreSQL
 */
export function usePostgres(
  builder: DbContextOptionsBuilder,
  options: PostgresProviderOptions
): DbContextOptionsBuilder {
  const dataSourceOptions = {
    type: "postgres" as const,
    host: options.host,
    port: options.port || 5432,
    username: options.username,
    password: options.password,
    database: options.database,
    schema: options.schema,
    synchronize: options.synchronize || false,
    logging: options.logging || false,
    ssl: options.ssl,
  };

  // Override the data source options
  const mergedOptions = {
    ...builder._dataSourceOptions,
    ...dataSourceOptions,
  };

  // Cast to DataSourceOptions
  builder._dataSourceOptions = mergedOptions as any;

  return builder;
}
