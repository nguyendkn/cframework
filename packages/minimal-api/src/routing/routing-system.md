# Routing System Design

## Overview

The routing system in the Minimal API framework provides a flexible and intuitive way to define routes and map them to handlers. It supports various routing patterns, parameter extraction, and route grouping.

## Route Definition

Routes are defined by specifying an HTTP method, a path pattern, and a handler function:

```typescript
router.get("/users/:id", async (context) => {
  const userId = context.request.params.id;
  return { id: userId, name: "John Doe" };
});
```

## HTTP Methods

The routing system supports all standard HTTP methods:

- GET: `router.get(path, handler)`
- POST: `router.post(path, handler)`
- PUT: `router.put(path, handler)`
- DELETE: `router.delete(path, handler)`
- PATCH: `router.patch(path, handler)`
- OPTIONS: `router.options(path, handler)`
- HEAD: `router.head(path, handler)`

## Path Parameters

Routes can include path parameters, which are extracted and made available in the request params:

```typescript
router.get("/users/:id/posts/:postId", async (context) => {
  const { id, postId } = context.request.params;
  // ...
});
```

## Query Parameters

Query parameters are automatically parsed and made available in the request query object:

```typescript
// GET /search?q=typescript&limit=10
router.get("/search", async (context) => {
  const { q, limit } = context.request.query;
  // ...
});
```

## Route Groups

Routes can be organized into groups with a common prefix:

```typescript
router.group("/api", api => {
  api.group("/users", users => {
    users.get("/", getAllUsers);
    users.get("/:id", getUserById);
    users.post("/", createUser);
  });
  
  api.group("/posts", posts => {
    posts.get("/", getAllPosts);
    posts.get("/:id", getPostById);
  });
});
```

## Route Middleware

Middleware can be applied to specific routes or route groups:

```typescript
router
  .use(authMiddleware())
  .get("/protected", protectedHandler);

router.group("/admin", admin => {
  admin.use(adminAuthMiddleware());
  admin.get("/dashboard", dashboardHandler);
});
```

## Route Handlers

Route handlers are async functions that receive a context object and return a result:

```typescript
const getUserById = async (context: HttpContext) => {
  const userId = context.request.params.id;
  const user = await userService.findById(userId);
  
  if (!user) {
    return new NotFoundResult();
  }
  
  return user;
};
```

## Result Handling

The routing system automatically handles various result types:

- Objects and arrays are serialized as JSON
- Strings are sent as text
- `IResult` implementations (JsonResult, RedirectResult, etc.) are executed
- `undefined` results do not modify the response

## Controller-based Routing

In addition to the functional approach, routes can be defined using controllers and decorators:

```typescript
@Controller("/api/users")
class UsersController {
  constructor(private userService: UserService) {}

  @Get()
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Get("/:id")
  async getUserById(context: HttpContext) {
    const userId = context.request.params.id;
    return this.userService.findById(userId);
  }

  @Post()
  async createUser(context: HttpContext) {
    const userData = context.request.body;
    return this.userService.create(userData);
  }
}
```

## Route Registration

Routes defined using the Router class must be registered with the application builder:

```typescript
const router = new Router();
// Define routes...
router.applyTo(builder);
```

Controllers are registered using the ControllerFactory:

```typescript
ControllerFactory.createAndRegister(builder, UsersController, userService);
```