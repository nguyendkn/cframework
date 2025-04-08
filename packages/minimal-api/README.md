# Minimal API Framework

A lightweight, fluent API for building HTTP services with minimal boilerplate. Built on top of Express but provides a more streamlined developer experience.

## Features

- Fluent API for defining routes and middleware
- Support for functional and class-based approaches
- Built-in middleware for common tasks
- Automatic result handling
- TypeScript support

## Installation

```bash
npm install @cframework/minimal-api
```

## Quick Start

### Basic Usage

```typescript
import { MinimalApiApplication } from "@cframework/minimal-api";

const app = new MinimalApiApplication();

app.configure(builder => {
  builder.mapGet("/hello", async () => "Hello, World!");
});

app.run(3000).then(() => {
  console.log("Server is running on http://localhost:3000");
});
```

### Using Routers

```typescript
import { MinimalApiApplication, Router } from "@cframework/minimal-api";

const app = new MinimalApiApplication();

app.configure(builder => {
  const router = new Router();
  
  router.get("/hello", async () => "Hello, World!");
  
  router.group("/api", api => {
    api.get("/users", async () => [
      { id: 1, name: "John" },
      { id: 2, name: "Jane" }
    ]);
  });
  
  router.applyTo(builder);
});

app.run(3000);
```

### Using Controllers

```typescript
import { 
  MinimalApiApplication, 
  Controller, 
  ControllerFactory,
  Get, 
  Post 
} from "@cframework/minimal-api";

@Controller("/api/users")
class UsersController extends Controller {
  @Get()
  async getUsers() {
    return [
      { id: 1, name: "John" },
      { id: 2, name: "Jane" }
    ];
  }
  
  @Get("/:id")
  async getUser(context) {
    const id = parseInt(context.request.params.id);
    return { id, name: id === 1 ? "John" : "Jane" };
  }
  
  @Post()
  async createUser(context) {
    const user = context.request.body;
    return { id: 3, ...user };
  }
}

const app = new MinimalApiApplication();

app.configure(builder => {
  ControllerFactory.createAndRegister(builder, UsersController);
});

app.run(3000);
```

## Middleware

The framework includes several built-in middleware components:

```typescript
import { 
  MinimalApiApplication, 
  cors, 
  errorHandler, 
  requestLogger, 
  jsonBodyParser 
} from "@cframework/minimal-api";

const app = new MinimalApiApplication();

app.configure(builder => {
  builder.useMiddleware(errorHandler());
  builder.useMiddleware(requestLogger());
  builder.useMiddleware(cors(["http://localhost:3000"]));
  builder.useMiddleware(jsonBodyParser());
  
  // Define routes...
});

app.run(3000);
```

## Custom Middleware

You can create custom middleware:

```typescript
import { MinimalApiApplication, EndpointMiddleware } from "@cframework/minimal-api";

const authMiddleware = (): EndpointMiddleware => {
  return async (context, next) => {
    const token = context.request.headers.authorization;
    
    if (!token) {
      context.response.status(401).json({ error: "Unauthorized" });
      return;
    }
    
    // Validate token...
    
    await next();
  };
};

const app = new MinimalApiApplication();

app.configure(builder => {
  builder.useMiddleware(authMiddleware());
  
  // Define routes...
});

app.run(3000);
```

## Result Handling

The framework automatically handles various result types:

```typescript
import { 
  MinimalApiApplication, 
  JsonResult, 
  NoContentResult, 
  RedirectResult, 
  FileResult 
} from "@cframework/minimal-api";

const app = new MinimalApiApplication();

app.configure(builder => {
  // Return an object (automatically converted to JSON)
  builder.mapGet("/user", async () => ({ id: 1, name: "John" }));
  
  // Return a custom JSON result with status code
  builder.mapGet("/error", async () => new JsonResult({ error: "Not found" }, 404));
  
  // Return no content
  builder.mapDelete("/user/:id", async () => new NoContentResult());
  
  // Redirect to another URL
  builder.mapGet("/old-path", async () => new RedirectResult("/new-path"));
  
  // Send a file
  builder.mapGet("/download", async () => new FileResult("/path/to/file.pdf", "document.pdf"));
});

app.run(3000);
```

## Examples

Check out the examples directory for more detailed examples:

- [Basic API](./examples/basic-api.ts)
- [Controller-based API](./examples/controller-api.ts)

## API Reference

For detailed API documentation, see the [API Reference](./docs/api-reference.md).

## License

MIT