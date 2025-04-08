# Middleware System Design

## Overview

The middleware system in the Minimal API framework provides a way to intercept and process HTTP requests and responses at various stages of the request pipeline. Middleware components can perform tasks such as authentication, logging, error handling, and more.

## Middleware Pipeline

Middleware functions are executed in a pipeline, where each middleware can:
1. Process the incoming request
2. Call the next middleware in the pipeline
3. Process the outgoing response

```
Request → Middleware 1 → Middleware 2 → ... → Handler → Response
```

## Middleware Types

### Global Middleware
Applied to all routes in the application. Registered at the application level.

```typescript
app.configure(builder => {
  builder.useMiddleware(errorHandler());
  builder.useMiddleware(requestLogger());
});
```

### Route-specific Middleware
Applied only to specific routes. Registered at the route level.

```typescript
router.use(authMiddleware()).get("/protected", handler);
```

### Controller Middleware
Applied to all routes in a controller. Registered at the controller level.

```typescript
@Controller("/api/users")
@UseMiddleware(authMiddleware())
class UsersController {
  // ...
}
```

## Built-in Middleware

The framework provides several built-in middleware components:

### Error Handling
Catches exceptions thrown during request processing and returns appropriate error responses.

```typescript
errorHandler(): EndpointMiddleware
```

### CORS
Handles Cross-Origin Resource Sharing headers.

```typescript
cors(origins?: string[]): EndpointMiddleware
```

### Request Logging
Logs information about incoming requests and their processing time.

```typescript
requestLogger(): EndpointMiddleware
```

### JSON Body Parsing
Parses JSON request bodies.

```typescript
jsonBodyParser(): EndpointMiddleware
```

## Custom Middleware

Custom middleware can be created by implementing the `EndpointMiddleware` type:

```typescript
const authMiddleware = (): EndpointMiddleware => {
  return async (context: HttpContext, next: () => Promise<void>) => {
    const token = context.request.headers.authorization;
    
    if (!token) {
      context.response.status(401).json({ error: "Unauthorized" });
      return;
    }
    
    // Validate token...
    
    // Call next middleware
    await next();
  };
};
```

## Middleware Composition

Middleware can be composed to create reusable middleware pipelines:

```typescript
const apiMiddleware = composeMiddleware([
  cors(),
  jsonBodyParser(),
  authMiddleware(),
  requestLogger()
]);

router.use(apiMiddleware).get("/api/resource", handler);
```

## Middleware Execution Order

Middleware is executed in the order it is registered. This is important to consider when designing middleware pipelines, as some middleware may depend on others (e.g., error handling should typically be registered first).

## Async Middleware

All middleware supports async/await for handling asynchronous operations:

```typescript
const asyncMiddleware = (): EndpointMiddleware => {
  return async (context: HttpContext, next: () => Promise<void>) => {
    // Perform async operation
    const result = await someAsyncOperation();
    
    // Modify context
    context.items.set("result", result);
    
    // Call next middleware
    await next();
  };
};
```