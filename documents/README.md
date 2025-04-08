# TypeScript Core Framework

A comprehensive TypeScript framework inspired by .NET Core, providing dependency injection, entity framework, and minimal API capabilities.

## Overview

TypeScript Core Framework is a full-featured framework that brings the elegance and structure of .NET Core to the TypeScript ecosystem. It provides a robust foundation for building scalable and maintainable applications with familiar patterns and concepts.

## Key Features

- **Dependency Injection**: A complete DI system with lifetime management (singleton, scoped, transient)
- **Entity Framework**: ORM capabilities with DbContext, migrations, and multiple database providers
- **Minimal API**: Streamlined API development with minimal boilerplate
- **Modular Architecture**: Clean separation of concerns with a monorepo structure

## Packages

The framework consists of the following packages:

- `@core`: Core functionality including dependency injection and HTTP abstractions
- `@database`: ORM capabilities similar to Entity Framework Core
- `@minimal-api`: Minimal API functionality for building web APIs

## Getting Started

### Prerequisites

- Node.js 16 or later
- pnpm package manager

### Installation

```bash
# Install the packages
pnpm add @core @database @minimal-api
```

### Basic Usage

Here's a simple example of creating a minimal API application:

```typescript
import { MinimalApiApplication } from "@minimal-api";
import { addLogging } from "@core";

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
  app.mapGet("/hello", async (context) => {
    return { message: "Hello, World!" };
  });
});

// Run the application
app.run(3000).then(() => {
  console.log("Application started on port 3000");
});
```

## Documentation

For detailed documentation, please refer to the following sections:

- [Core Framework](./core.md)
- [Dependency Injection](./dependency-injection.md)
- [Entity Framework](./entity-framework.md)
- [Minimal API](./minimal-api.md)
- [Examples](./examples.md)

## License

MIT
