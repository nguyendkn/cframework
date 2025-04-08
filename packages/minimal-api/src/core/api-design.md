# Minimal API Design

## Architecture Overview

The Minimal API is designed to provide a lightweight, fluent API for building HTTP services with minimal boilerplate. It's built on top of Express but provides a more streamlined developer experience.

## Core Components

### Application
- `MinimalApiApplication`: The main entry point for creating a minimal API application
- Fluent configuration API with `configureServices` and `configure` methods
- Built on top of the core HTTP application host

### Builder
- `MinimalApiBuilder`: Responsible for building the application and registering routes
- Provides methods for mapping routes and middleware
- Converts minimal API routes to Express routes

### Routing
- `Router`: Provides a fluent API for defining routes and route groups
- Support for all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Route grouping with prefixes

### Controllers
- Class-based approach for organizing related endpoints
- Decorator-based routing (`@Controller`, `@Get`, `@Post`, etc.)
- Automatic registration of controller routes

### Middleware
- Pipeline-based middleware system
- Built-in middleware for common tasks (CORS, error handling, logging)
- Support for custom middleware

## API Design Principles

1. **Fluent API**: Chain method calls for a more readable and concise API
2. **Convention over Configuration**: Sensible defaults with the ability to customize
3. **Minimal Boilerplate**: Reduce the amount of code needed to create endpoints
4. **Type Safety**: Leverage TypeScript for better developer experience
5. **Extensibility**: Easy to extend with custom middleware and plugins

## Usage Patterns

### Minimal Approach
```typescript
const app = new MinimalApiApplication();

app.configure(builder => {
  builder.mapGet("/hello", async () => "Hello, World!");
});

app.run();
```

### Router-based Approach
```typescript
const app = new MinimalApiApplication();

app.configure(builder => {
  const router = new Router();
  
  router.get("/hello", async () => "Hello, World!");
  router.group("/api", api => {
    api.get("/users", async () => [{ id: 1, name: "John" }]);
  });
  
  router.applyTo(builder);
});

app.run();
```

### Controller-based Approach
```typescript
@Controller("/api/users")
class UsersController {
  @Get()
  async getUsers() {
    return [{ id: 1, name: "John" }];
  }
  
  @Get("/:id")
  async getUser(context: HttpContext) {
    const id = context.request.params.id;
    return { id, name: "John" };
  }
}

const app = new MinimalApiApplication();

app.configure(builder => {
  ControllerFactory.createAndRegister(builder, UsersController);
});

app.run();
```