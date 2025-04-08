# Minimal API

The Minimal API package (`@ts-core/minimal-api`) provides a streamlined approach to building web APIs with minimal boilerplate, similar to .NET Core's minimal API functionality.

## Installation

```bash
pnpm add @ts-core/minimal-api
```

## Key Components

### MinimalApiApplication

The `MinimalApiApplication` is the entry point for creating minimal API applications:

```typescript
import { MinimalApiApplication } from "@ts-core/minimal-api";
import { addLogging } from "@ts-core/core";

// Create application
const app = new MinimalApiApplication();

// Configure services
app.configureServices((services) => {
  addLogging(services);
});

// Configure application
app.configure((app) => {
  app.mapGet("/hello", async (context) => {
    return { message: "Hello, World!" };
  });
});

// Run application
app.run(3000).then(() => {
  console.log("Application started on port 3000");
});
```

### Route Handlers

Route handlers are simple async functions that receive an HTTP context and return a result:

```typescript
// Basic route handler
app.mapGet("/hello", async (context) => {
  return { message: "Hello, World!" };
});

// Route with parameters
app.mapGet("/users/:id", async (context) => {
  const id = context.request.params.id;
  return { id, name: `User ${id}` };
});

// Route with query parameters
app.mapGet("/search", async (context) => {
  const query = context.request.query.q;
  return { query, results: [] };
});
```

### Result Types

The framework provides various result types for different response scenarios:

```typescript
import {
  JsonResult,
  NoContentResult,
  RedirectResult,
  FileResult,
} from "@ts-core/minimal-api";

// JSON result
app.mapGet("/data", async (context) => {
  return new JsonResult({ data: "value" }, 200);
});

// No content result
app.mapPost("/process", async (context) => {
  // Process data...
  return new NoContentResult();
});

// Redirect result
app.mapGet("/old-path", async (context) => {
  return new RedirectResult("/new-path");
});

// File result
app.mapGet("/download", async (context) => {
  return new FileResult("/path/to/file.pdf", "document.pdf");
});
```

### Middleware

Middleware functions can be used to add cross-cutting concerns:

```typescript
import {
  requestLogger,
  errorHandler,
  cors,
  jsonBodyParser,
} from "@ts-core/minimal-api";

// Configure application
app.configure((app) => {
  // Add middleware
  app.useMiddleware(requestLogger());
  app.useMiddleware(errorHandler());
  app.useMiddleware(cors(["https://example.com"]));
  app.useMiddleware(jsonBodyParser());

  // Add routes
  app.mapGet("/hello", async (context) => {
    return { message: "Hello, World!" };
  });
});
```

### Controllers

For more structured APIs, you can use controllers with decorators:

```typescript
import { Controller, Get, Post, Put, Delete } from "@ts-core/minimal-api";
import { Inject, Scoped } from "@ts-core/core";

@Controller("users")
class UsersController {
  constructor(@Inject() private readonly userService: UserService) {}

  @Get()
  async getUsers(context: HttpContext) {
    const users = await this.userService.getUsers();
    return users;
  }

  @Get(":id")
  async getUser(context: HttpContext) {
    const id = context.request.params.id;
    const user = await this.userService.getUserById(id);
    return user;
  }

  @Post()
  async createUser(context: HttpContext) {
    const userData = context.request.body;
    const user = await this.userService.createUser(userData);
    return user;
  }

  @Put(":id")
  async updateUser(context: HttpContext) {
    const id = context.request.params.id;
    const userData = context.request.body;
    const user = await this.userService.updateUser(id, userData);
    return user;
  }

  @Delete(":id")
  async deleteUser(context: HttpContext) {
    const id = context.request.params.id;
    await this.userService.deleteUser(id);
    return new NoContentResult();
  }
}

// Register controllers
import {
  ServiceCollectionExtensions,
  MinimalApiBuilderExtensions,
} from "@ts-core/minimal-api";

// Configure services
app.configureServices((services) => {
  ServiceCollectionExtensions.addControllers(services, [UsersController]);
});

// Configure application
app.configure((app) => {
  MinimalApiBuilderExtensions.mapControllers(app, [UsersController]);
});
```

### Routing

For more complex routing scenarios, you can use the Router class:

```typescript
import { Router } from "@ts-core/minimal-api";

// Create router
const router = new Router();

// Add routes
router.get("/hello", async (context) => {
  return { message: "Hello, World!" };
});

// Create route groups
router.group("users", (userRouter) => {
  userRouter.get("/", async (context) => {
    return { users: [] };
  });

  userRouter.get("/:id", async (context) => {
    const id = context.request.params.id;
    return { id, name: `User ${id}` };
  });
});

// Apply router to application
app.configure((app) => {
  MinimalApiBuilderExtensions.useRouter(app, router);
});
```

## Integration with Entity Framework

The Minimal API integrates seamlessly with Entity Framework:

```typescript
import { MinimalApiApplication } from "@ts-core/minimal-api";
import { addEntityFramework, addDbContext } from "@ts-core/entity-framework";

// Configure services
app.configureServices((services) => {
  // Add entity framework
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

// Configure application
app.configure((app) => {
  // User routes
  app.mapGet("/users", async (context) => {
    const dbContextFactory = context.serviceProvider.getService(
      IDbContextFactory<AppDbContext>
    );
    const dbContext = await dbContextFactory.createDbContext();

    try {
      const users = await dbContext.users.findAll();
      return users;
    } finally {
      await dbContext.dispose();
    }
  });
});
```

## Best Practices

1. **Keep route handlers focused**: Each handler should do one thing well
2. **Use middleware for cross-cutting concerns**: Authentication, logging, error handling
3. **Group related routes**: Use controllers or routers to organize related endpoints
4. **Return appropriate status codes**: Use the right HTTP status codes for different scenarios
5. **Validate input data**: Always validate and sanitize input data before processing
