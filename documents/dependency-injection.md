# Dependency Injection

The dependency injection system in TypeScript Core Framework provides a robust way to manage service lifetimes and dependencies, similar to .NET Core's DI container.

## Core Concepts

### Service Lifetimes

- **Singleton**: A single instance is created and shared throughout the application's lifetime
- **Scoped**: A new instance is created for each scope (typically per HTTP request)
- **Transient**: A new instance is created each time the service is requested

### Service Registration

Services are registered with a `ServiceCollection`, which is used to build a `ServiceProvider` that resolves dependencies.

## Basic Usage

### Service Registration

```typescript
import { ServiceCollection, IServiceCollection } from "@ts-core/core";

// Define interfaces
interface IGreeter {
  greet(name: string): string;
}

// Implement services
class Greeter implements IGreeter {
  greet(name: string): string {
    return `Hello, ${name}!`;
  }
}

// Create a service collection
const services = new ServiceCollection();

// Register services
services.addSingleton<IGreeter>(IGreeter, Greeter);

// Build service provider
const serviceProvider = services.buildServiceProvider();

// Resolve services
const greeter = serviceProvider.getService<IGreeter>(IGreeter);
console.log(greeter.greet("World")); // Output: Hello, World!
```

### Using Decorators

The framework provides decorators for more elegant service registration and dependency injection:

```typescript
import { Singleton, Scoped, Transient, Inject } from "@ts-core/core";

// Define interfaces
interface IUserRepository {
  findAll(): Promise<User[]>;
}

interface IUserService {
  getUsers(): Promise<User[]>;
}

// Implement services with decorators
@Singleton()
class UserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    // Implementation...
    return [];
  }
}

@Scoped()
class UserService implements IUserService {
  constructor(@Inject() private readonly repository: UserRepository) {}

  async getUsers(): Promise<User[]> {
    return this.repository.findAll();
  }
}
```

## Advanced Usage

### Service Scopes

Service scopes allow for creating isolated containers that share singleton services with the parent container but have their own instances of scoped services:

```typescript
// Create a scope
const scope = serviceProvider.createScope();
const scopedProvider = scope.serviceProvider;

// Resolve scoped services
const scopedService = scopedProvider.getService(IScopedService);

// Dispose the scope when done
scope.dispose();
```

### Factory Registration

You can register factory functions to create services:

```typescript
// Register a factory
services.addSingleton<IConfigService>({
  useFactory: (sp) => {
    const config = sp.getService(IConfiguration);
    return new ConfigService(config.get("apiKey"));
  },
});
```

### Integration with HTTP Pipeline

The DI system integrates seamlessly with the HTTP pipeline:

```typescript
import { ApplicationHost } from "@ts-core/core";

const host = new ApplicationHost();

// Configure services
host.configureServices((services) => {
  services.addSingleton<IGreeter>(IGreeter, Greeter);
});

// Configure application
host.configure((app) => {
  app.useMiddleware((req, res, next) => {
    // Get service from request
    const greeter = req.serviceProvider.getService<IGreeter>(IGreeter);
    console.log(greeter.greet("Request"));
    next();
  });
});

// Run application
host.run(3000);
```

## Best Practices

1. **Define interfaces**: Always define interfaces for your services to enable loose coupling
2. **Use appropriate lifetimes**: Choose the right lifetime for your services based on their requirements
3. **Avoid service locator pattern**: Inject dependencies directly rather than resolving them from the container
4. **Dispose scoped services**: Always dispose scopes when you're done with them
5. **Keep services focused**: Follow the Single Responsibility Principle for your services
