# Controller System Design

## Overview

The controller system in the Minimal API framework provides a class-based approach to organizing related endpoints. Controllers use decorators to define routes and middleware, making the code more organized and maintainable.

## Controller Definition

Controllers are defined as classes that extend the `Controller` base class:

```typescript
@Controller("/api/users")
class UsersController extends Controller {
  constructor(private userService: UserService) {
    super();
  }

  @Get()
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Get("/:id")
  async getUserById(context: HttpContext) {
    const userId = context.request.params.id;
    return this.userService.findById(userId);
  }
}
```

## Route Decorators

The following decorators are available for defining routes:

- `@Get(path?: string)`: Define a GET route
- `@Post(path?: string)`: Define a POST route
- `@Put(path?: string)`: Define a PUT route
- `@Delete(path?: string)`: Define a DELETE route
- `@Patch(path?: string)`: Define a PATCH route
- `@Options(path?: string)`: Define an OPTIONS route
- `@Head(path?: string)`: Define a HEAD route

The path parameter is optional and will be combined with the controller's base path.

## Controller Registration

Controllers are registered using the `ControllerFactory`:

```typescript
app.configure(builder => {
  ControllerFactory.createAndRegister(builder, UsersController, userService);
});
```

The factory creates an instance of the controller and registers its routes with the application builder.

## Dependency Injection

Controllers can receive dependencies through their constructor:

```typescript
@Controller("/api/users")
class UsersController extends Controller {
  constructor(
    private userService: UserService,
    private logger: Logger
  ) {
    super();
  }
  
  // ...
}

// Registration with dependencies
ControllerFactory.createAndRegister(
  builder, 
  UsersController, 
  userService,
  logger
);
```

## Middleware Decorators

Controllers can use middleware decorators to apply middleware to all routes or specific routes:

```typescript
@Controller("/api/users")
@UseMiddleware(authMiddleware())
class UsersController extends Controller {
  @Get()
  async getAllUsers() {
    // Protected by authMiddleware
    return this.userService.findAll();
  }
  
  @Post()
  @UseMiddleware(validateUserMiddleware())
  async createUser(context: HttpContext) {
    // Protected by authMiddleware and validateUserMiddleware
    const userData = context.request.body;
    return this.userService.create(userData);
  }
}
```

## Route Parameters

Route parameters are accessible through the context object:

```typescript
@Get("/:id")
async getUserById(context: HttpContext) {
  const userId = context.request.params.id;
  return this.userService.findById(userId);
}
```

## Request Body

The request body is accessible through the context object:

```typescript
@Post()
async createUser(context: HttpContext) {
  const userData = context.request.body;
  return this.userService.create(userData);
}
```

## Result Handling

Controller methods can return various types of results:

```typescript
@Get("/:id")
async getUserById(context: HttpContext) {
  const userId = context.request.params.id;
  const user = await this.userService.findById(userId);
  
  if (!user) {
    return new NotFoundResult();
  }
  
  return user; // Automatically converted to JSON
}

@Get("/download")
async downloadFile() {
  return new FileResult("/path/to/file.pdf", "document.pdf");
}

@Get("/redirect")
async redirectToHome() {
  return new RedirectResult("/home");
}
```

## Controller Inheritance

Controllers can inherit from other controllers to share common functionality:

```typescript
class BaseApiController extends Controller {
  protected handleError(error: Error) {
    console.error(error);
    return new JsonResult({ error: error.message }, 500);
  }
}

@Controller("/api/users")
class UsersController extends BaseApiController {
  @Get("/:id")
  async getUserById(context: HttpContext) {
    try {
      const userId = context.request.params.id;
      return await this.userService.findById(userId);
    } catch (error) {
      return this.handleError(error);
    }
  }
}
```