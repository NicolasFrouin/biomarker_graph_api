# Use OpenAPI/Swagger for API Documentation

## Status

Accepted

## Context

We need comprehensive, up-to-date API documentation that's automatically generated from code to prevent drift between implementation and docs, with interactive testing capability.

## Decision

We use @nestjs/swagger because it auto-generates documentation from controllers and DTOs, provides an interactive Swagger UI for testing endpoints in the browser, leverages TypeScript types with decorators, follows the OpenAPI 3.0 standard, and requires minimal maintenance to keep docs current.

## Consequences

- Single source of truth (code is the documentation)
- Always up-to-date docs with interactive testing
- Easy for clients to understand API and generate SDKs
- Swagger decorators add verbosity to controllers
- Startup time slightly increased by schema generation
