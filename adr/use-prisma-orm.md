# Use Prisma as ORM

## Status

Accepted

## Context

We need an ORM to interact with PostgreSQL for managing biomarker observations and relationships between subjects, analytes, and units with type safety and good migration tooling.

## Decision

We chose Prisma because it auto-generates TypeScript types from the database schema, has a readable declarative schema language, provides robust migration tooling, and offers excellent developer experience with Prisma Studio and good NestJS integration. The seeding support is useful for test data.

## Consequences

- Type-safe queries with IDE autocomplete
- Single source of truth for schema
- Easy migrations and visual database browsing
- Complex queries may need raw SQL
- Schema changes require regenerating client
