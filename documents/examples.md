# Examples

This section contains example applications that demonstrate how to use the TypeScript Core Framework in real-world scenarios.

## Table of Contents

1. [Basic API](#basic-api) - A simple API with minimal configuration
2. [Todo API](#todo-api) - A complete Todo API with database integration
3. [User Management](#user-management) - A user management system with authentication

## Basic API

A simple API that demonstrates the minimal API functionality:

```typescript
// src/index.ts
import { MinimalApiApplication } from "@ts-core/minimal-api";
import { addLogging } from "@ts-core/core";

// Create application
const app = new MinimalApiApplication();

// Configure services
app.configureServices((services) => {
  // Add logging
  addLogging(services);
});

// Configure application
app.configure((app) => {
  // Add middleware
  app.useMiddleware(async (context, next) => {
    console.log(`Request: ${context.request.method} ${context.request.url}`);
    await next();
  });

  // Add routes
  app.mapGet("/", async (context) => {
    return { message: "Welcome to TypeScript Core Framework" };
  });

  app.mapGet("/hello/:name", async (context) => {
    const name = context.request.params.name;
    return { message: `Hello, ${name}!` };
  });

  app.mapPost("/echo", async (context) => {
    return context.request.body;
  });
});

// Run application
app.run(3000).then(() => {
  console.log("Application started on port 3000");
});
```

## Todo API

A complete Todo API with database integration:

### Entity Definition

```typescript
// src/entities/todo.ts
import {
  Entity,
  PrimaryKey,
  Property,
  Required,
} from "@ts-core/entity-framework";

@Entity("todos")
export class Todo extends Entity {
  @PrimaryKey()
  id!: number;

  @Property()
  @Required()
  title!: string;

  @Property()
  description?: string;

  @Property()
  completed: boolean = false;

  @Property()
  createdAt: Date = new Date();
}
```

### DbContext

```typescript
// src/data/app-db-context.ts
import { DbContext, DbContextOptions, IDbSet } from "@ts-core/entity-framework";
import { Todo } from "../entities/todo";

export class AppDbContext extends DbContext {
  todos: IDbSet<Todo>;

  constructor(options: DbContextOptions) {
    super(options);
    this.todos = this.getDbSet(Todo, "todos");
  }
}
```

### Todo Service

```typescript
// src/services/todo-service.ts
import { Scoped, Inject } from "@ts-core/core";
import { IDbContextFactory } from "@ts-core/entity-framework";
import { AppDbContext } from "../data/app-db-context";
import { Todo } from "../entities/todo";

@Scoped()
export class TodoService {
  constructor(
    @Inject() private readonly dbContextFactory: IDbContextFactory<AppDbContext>
  ) {}

  async getAllTodos(): Promise<Todo[]> {
    const context = await this.dbContextFactory.createDbContext();
    try {
      return await context.todos.findAll();
    } finally {
      await context.dispose();
    }
  }

  async getTodoById(id: number): Promise<Todo | null> {
    const context = await this.dbContextFactory.createDbContext();
    try {
      return await context.todos.find(id);
    } finally {
      await context.dispose();
    }
  }

  async createTodo(todoData: Partial<Todo>): Promise<Todo> {
    const context = await this.dbContextFactory.createDbContext();
    try {
      const todo = new Todo();
      todo.title = todoData.title!;
      todo.description = todoData.description;
      todo.completed = todoData.completed || false;

      context.todos.add(todo);
      await context.saveChanges();

      return todo;
    } finally {
      await context.dispose();
    }
  }

  async updateTodo(id: number, todoData: Partial<Todo>): Promise<Todo | null> {
    const context = await this.dbContextFactory.createDbContext();
    try {
      const todo = await context.todos.find(id);
      if (!todo) return null;

      if (todoData.title !== undefined) todo.title = todoData.title;
      if (todoData.description !== undefined)
        todo.description = todoData.description;
      if (todoData.completed !== undefined) todo.completed = todoData.completed;

      context.update(todo);
      await context.saveChanges();

      return todo;
    } finally {
      await context.dispose();
    }
  }

  async deleteTodo(id: number): Promise<boolean> {
    const context = await this.dbContextFactory.createDbContext();
    try {
      const todo = await context.todos.find(id);
      if (!todo) return false;

      context.todos.remove(todo);
      await context.saveChanges();

      return true;
    } finally {
      await context.dispose();
    }
  }
}
```

### Todo Controller

```typescript
// src/controllers/todo-controller.ts
import { Controller, Get, Post, Put, Delete } from "@ts-core/minimal-api";
import { HttpContext, Inject } from "@ts-core/core";
import { TodoService } from "../services/todo-service";
import { NoContentResult, JsonResult } from "@ts-core/minimal-api";

@Controller("todos")
export class TodoController {
  constructor(@Inject() private readonly todoService: TodoService) {}

  @Get()
  async getAllTodos(context: HttpContext) {
    const todos = await this.todoService.getAllTodos();
    return todos;
  }

  @Get(":id")
  async getTodoById(context: HttpContext) {
    const id = parseInt(context.request.params.id);
    const todo = await this.todoService.getTodoById(id);

    if (!todo) {
      return new JsonResult({ error: "Todo not found" }, 404);
    }

    return todo;
  }

  @Post()
  async createTodo(context: HttpContext) {
    const todoData = context.request.body;
    const todo = await this.todoService.createTodo(todoData);
    return new JsonResult(todo, 201);
  }

  @Put(":id")
  async updateTodo(context: HttpContext) {
    const id = parseInt(context.request.params.id);
    const todoData = context.request.body;
    const todo = await this.todoService.updateTodo(id, todoData);

    if (!todo) {
      return new JsonResult({ error: "Todo not found" }, 404);
    }

    return todo;
  }

  @Delete(":id")
  async deleteTodo(context: HttpContext) {
    const id = parseInt(context.request.params.id);
    const success = await this.todoService.deleteTodo(id);

    if (!success) {
      return new JsonResult({ error: "Todo not found" }, 404);
    }

    return new NoContentResult();
  }
}
```

### Application Setup

```typescript
// src/index.ts
import { MinimalApiApplication } from "@ts-core/minimal-api";
import { addLogging } from "@ts-core/core";
import { addEntityFramework, addDbContext } from "@ts-core/entity-framework";
import { AppDbContext } from "./data/app-db-context";
import { Todo } from "./entities/todo";
import { TodoService } from "./services/todo-service";
import { TodoController } from "./controllers/todo-controller";
import {
  ServiceCollectionExtensions,
  MinimalApiBuilderExtensions,
} from "@ts-core/minimal-api";
import {
  errorHandler,
  requestLogger,
  jsonBodyParser,
} from "@ts-core/minimal-api";

// Create application
const app = new MinimalApiApplication();

// Configure services
app.configureServices((services) => {
  // Add logging
  addLogging(services);

  // Add entity framework
  addEntityFramework(services);

  // Add DbContext
  addDbContext(services, AppDbContext, (builder) => {
    return builder
      .useSqlite({
        filename: "todos.sqlite",
        synchronize: true,
      })
      .addEntities([Todo]);
  });

  // Add services
  services.addScoped(TodoService);

  // Add controllers
  ServiceCollectionExtensions.addControllers(services, [TodoController]);
});

// Configure application
app.configure((app) => {
  // Add middleware
  app.useMiddleware(requestLogger());
  app.useMiddleware(errorHandler());
  app.useMiddleware(jsonBodyParser());

  // Map controllers
  MinimalApiBuilderExtensions.mapControllers(app, [TodoController]);

  // Add home route
  app.mapGet("/", async (context) => {
    return { message: "Todo API", version: "1.0.0" };
  });
});

// Run application
app.run(3000).then(() => {
  console.log("Todo API started on port 3000");
});
```

## User Management

For a more complex example with user management and authentication, please refer to the [examples/user-management](../examples/user-management) directory in the repository.
