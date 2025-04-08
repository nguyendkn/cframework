# Core Framework

The Core package (`@core`) provides the foundation for the TypeScript Core Framework, including dependency injection, HTTP abstractions, configuration, and utilities.

## Installation

```bash
pnpm add @core
```

## Key Components

### Dependency Injection

The dependency injection system is the heart of the framework, providing a robust way to manage service lifetimes and dependencies.

#### Service Lifetimes

- **Singleton**: A single instance is created and shared throughout the application
- **Scoped**: A new instance is created for each scope (e.g., request)
- **Transient**: A new instance is created each time the service is requested

#### Service Registration

```typescript
import { ServiceCollection, IServiceCollection } from "@core";

// Create a service collection
const services = new ServiceCollection();

// Register services
services.addSingleton(ILogger, ConsoleLogger);
services.addScoped(IUserRepository, UserRepository);
services.addTransient(IEmailService, EmailService);

// Build service provider
const serviceProvider = services.buildServiceProvider();

// Resolve services
const logger = serviceProvider.getService(ILogger);
```

#### Using Decorators

```typescript
import { Singleton, Scoped, Transient, Inject } from "@core";

// Singleton service
@Singleton()
class UserService {
  constructor(@Inject() private readonly repository: UserRepository) {}

  async getUsers(): Promise<User[]> {
    return this.repository.findAll();
  }
}

// Scoped service
@Scoped()
class RequestContext {
  // ...
}

// Transient service
@Transient()
class EmailSender {
  // ...
}
```

### HTTP Abstractions

The core package provides abstractions for HTTP handling, making it easy to build web applications.

#### Application Builder

```typescript
import { ApplicationBuilder, IServiceProvider } from "@core";

// Create application builder
const appBuilder = new ApplicationBuilder(serviceProvider);

// Add middleware
appBuilder.useMiddleware((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// Build application
const app = appBuilder.build();

// Start server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
```

#### Application Host

```typescript
import { ApplicationHost } from "@core";

// Create application host
const host = new ApplicationHost();

// Configure services
host.configureServices((services) => {
  services.addSingleton(ILogger, ConsoleLogger);
});

// Configure application
host.configure((app) => {
  app.useMiddleware((req, res, next) => {
    console.log(`Request: ${req.method} ${req.url}`);
    next();
  });
});

// Run application
host.run(3000).then(() => {
  console.log("Application started on port 3000");
});
```

### Configuration

The configuration system allows for flexible configuration from various sources.

```typescript
import { ConfigurationBuilder, addConfiguration } from "@core";

// Configure services
services.addConfiguration((builder) => {
  return builder
    .addJsonFile("appsettings.json")
    .addEnvironmentVariables("APP_");
});

// Use configuration
const config = serviceProvider.getService(IConfiguration);
const apiKey = config.get<string>("api:key");
```

### Logging

The logging system provides a structured way to log messages at different levels.

```typescript
import { ILogger, LogLevel, addLogging } from "@core";

// Add logging to services
addLogging(services, LogLevel.Information);

// Use logger
const logger = serviceProvider.getService(ILogger);
logger.info("Application started");
logger.error("An error occurred: {0}", error.message);
```

## Advanced Usage

For more advanced usage and examples, please refer to the [examples directory](../examples) and the API documentation.
