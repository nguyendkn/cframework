# System Patterns

## Architecture Overview
The TypeScript Core Framework follows a modular monorepo architecture with three main packages:
1. Core (@ts-core/core): Foundation with DI and HTTP abstractions
2. Entity Framework (@ts-core/entity-framework): ORM functionality
3. Minimal API (@ts-core/minimal-api): Streamlined API development

## Design Patterns
### Dependency Injection
- **Purpose**: Manage service lifetimes and dependencies
- **Implementation**: Service collection and provider pattern
- **Usage**: Throughout the framework for service management

### Unit of Work (DbContext)
- **Purpose**: Manage database operations and transactions
- **Implementation**: Entity Framework DbContext pattern
- **Usage**: Database operations and entity management

### Middleware Pipeline
- **Purpose**: HTTP request/response processing
- **Implementation**: Chainable middleware components
- **Usage**: Request processing in Minimal API

## Code Organization
- Monorepo structure with separate packages
- Feature-based organization within packages
- Clear separation of interfaces and implementations
- Consistent file naming and organization
- Shared types and utilities

## Technical Decisions
### TypeScript First
- **Context**: Framework development language
- **Decision**: Built entirely in TypeScript
- **Consequences**: Better type safety, IDE support, and developer experience

### Modular Architecture
- **Context**: Framework structure
- **Decision**: Separate packages for core features
- **Consequences**: Better maintainability and selective adoption

### Database Abstraction
- **Context**: Data access strategy
- **Decision**: Entity Framework-like ORM
- **Consequences**: Consistent data access across providers

## Best Practices
- Comprehensive unit testing
- Consistent code style (ESLint + Prettier)
- Documentation-driven development
- Conventional commits
- Semantic versioning
- Type-safe implementations

## System Dependencies
- Node.js 16+
- TypeScript 4.x+
- pnpm package manager
- SQLite/PostgreSQL (for Entity Framework)
- Jest (testing)
- ESLint/Prettier (code quality)
- TypeDoc (documentation) 