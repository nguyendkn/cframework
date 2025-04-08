# Minimal API Roadmap

This document outlines the planned features and improvements for the Minimal API framework.

## Current Status

- **Status**: Planning
- **Progress**: 5%
- **Blockers**: Core framework completion

## Short-term Goals (v0.1.0)

- [x] Design API structure
- [x] Plan middleware system
- [x] Create routing system
- [x] Implement controllers
- [ ] Implement basic result types
- [ ] Create examples
- [ ] Write documentation

## Medium-term Goals (v0.2.0)

- [ ] Implement model binding
- [ ] Add validation support
- [ ] Improve error handling
- [ ] Add content negotiation
- [ ] Support for file uploads
- [ ] Add OpenAPI/Swagger integration
- [ ] Create more middleware components

## Long-term Goals (v1.0.0)

- [ ] Add WebSocket support
- [ ] Implement GraphQL integration
- [ ] Add authentication and authorization
- [ ] Create a plugin system
- [ ] Implement caching
- [ ] Add rate limiting
- [ ] Create a CLI tool for scaffolding
- [ ] Implement health checks and diagnostics

## Feature Details

### Model Binding

Automatically bind request data to model objects:

```typescript
@Post()
async createUser(@FromBody() user: User) {
  // user is already parsed and validated
  return userService.create(user);
}
```

### Validation

Integrate with a validation library:

```typescript
@Post()
async createUser(@FromBody() @Validate() user: User) {
  // user is already validated
  return userService.create(user);
}
```

### OpenAPI/Swagger Integration

Generate OpenAPI documentation from code:

```typescript
@Controller("/api/users")
@ApiTags("Users")
class UsersController {
  @Get()
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, type: [User] })
  async getUsers() {
    // ...
  }
}
```

### Authentication and Authorization

Built-in support for authentication and authorization:

```typescript
@Controller("/api/users")
@Authorize()
class UsersController {
  @Get()
  @AllowAnonymous()
  async getUsers() {
    // Public endpoint
  }
  
  @Post()
  @Authorize("admin")
  async createUser(@FromBody() user: User) {
    // Admin-only endpoint
  }
}
```

### GraphQL Integration

Support for GraphQL alongside REST:

```typescript
app.configureGraphQL(builder => {
  builder.addType(User);
  builder.addQuery("users", () => userService.findAll());
  builder.addMutation("createUser", (_, { input }) => userService.create(input));
});
```

## Contributing

We welcome contributions to help us achieve these goals. Please see the [Contributing Guide](./CONTRIBUTING.md) for more information.