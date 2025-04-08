# Entity Framework

The Entity Framework package (`@ts-core/entity-framework`) provides ORM capabilities similar to Entity Framework Core in .NET, allowing for easy database access and management.

## Installation

```bash
pnpm add @ts-core/entity-framework
```

## Key Components

### DbContext

The `DbContext` is the central component for database operations, providing a unit of work pattern for managing entities and their changes.

```typescript
import {
  DbContext,
  DbContextOptions,
  Entity,
  PrimaryKey,
  Property,
} from "@ts-core/entity-framework";

// Define an entity
@Entity("users")
class User extends Entity {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  email!: string;
}

// Create a DbContext
class AppDbContext extends DbContext {
  users: IDbSet<User>;

  constructor(options: DbContextOptions) {
    super(options);
    this.users = this.getDbSet(User, "users");
  }
}
```

### Entity Configuration

Entities are configured using decorators:

```typescript
import {
  Entity,
  PrimaryKey,
  Property,
  MaxLength,
  Required,
} from "@ts-core/entity-framework";

@Entity("products")
class Product extends Entity {
  @PrimaryKey()
  id!: number;

  @Property()
  @Required()
  @MaxLength(100)
  name!: string;

  @Property()
  description?: string;

  @Property()
  price!: number;
}
```

### Database Operations

The DbContext provides methods for common database operations:

```typescript
// Initialize context
const context = new AppDbContext(options);
await context.initialize();

// Add a new entity
const user = new User();
user.name = "John Doe";
user.email = "john@example.com";
context.users.add(user);
await context.saveChanges();

// Query entities
const allUsers = await context.users.findAll();
const user = await context.users.find(1);

// Update an entity
user.name = "Jane Doe";
context.update(user);
await context.saveChanges();

// Remove an entity
context.users.remove(user);
await context.saveChanges();
```

### Database Providers

The framework supports multiple database providers:

#### SQLite

```typescript
import { DbContextOptionsBuilder, useSqlite } from "@ts-core/entity-framework";

const options = new DbContextOptionsBuilder()
  .useSqlite({
    filename: "database.sqlite",
    synchronize: true,
    logging: true,
  })
  .addEntities([User, Product])
  .build();
```

#### PostgreSQL

```typescript
import {
  DbContextOptionsBuilder,
  usePostgres,
} from "@ts-core/entity-framework";

const options = new DbContextOptionsBuilder()
  .usePostgres({
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "password",
    database: "myapp",
    synchronize: false,
    logging: true,
  })
  .addEntities([User, Product])
  .build();
```

### Migrations

The framework provides a migration system for managing database schema changes:

```typescript
import { Migration, IMigrator, addMigrations } from "@ts-core/entity-framework";

// Define a migration
class InitialMigration extends Migration {
  name = "20250407_InitialMigration";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE users`);
  }
}

// Register migrations
services.addMigrations(dataSource, [new InitialMigration()]);

// Apply migrations
const migrator = serviceProvider.getService(IMigrator);
await migrator.migrate();
```

## Integration with Dependency Injection

The Entity Framework integrates with the dependency injection system:

```typescript
import { addEntityFramework, addDbContext } from "@ts-core/entity-framework";

// Configure services
host.configureServices((services) => {
  // Add entity framework services
  addEntityFramework(services);

  // Add DbContext
  addDbContext(services, AppDbContext, (builder) => {
    return builder
      .useSqlite({
        filename: "database.sqlite",
        synchronize: true,
      })
      .addEntities([User, Product]);
  });
});

// Use DbContext in a service
@Scoped()
class UserService {
  constructor(
    @Inject() private readonly dbContextFactory: IDbContextFactory<AppDbContext>
  ) {}

  async getUsers(): Promise<User[]> {
    const context = await this.dbContextFactory.createDbContext();
    try {
      return await context.users.findAll();
    } finally {
      await context.dispose();
    }
  }
}
```

## Best Practices

1. **Use DbContext as a unit of work**: Group related changes and save them together
2. **Dispose contexts when done**: Always dispose DbContext instances to release resources
3. **Use migrations for schema changes**: Avoid using synchronize in production
4. **Define entity relationships explicitly**: Use decorators to define relationships between entities
5. **Use repositories for complex queries**: Create repository classes for complex query logic
