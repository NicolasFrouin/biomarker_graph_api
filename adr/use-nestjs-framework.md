# Use NestJS as Web Framework

## Status

Accepted

## Context

We need a robust web framework for building the biomarker graph API with TypeScript support, good architectural structure, and RESTful API tooling.

## Decision

We chose NestJS because it's built with TypeScript first, provides a modular architecture with controllers/services/modules, has built-in dependency injection for testability, and includes excellent OpenAPI/Swagger integration. The decorator-based approach keeps code clean and the ecosystem is mature with strong community support.

## Consequences

- Clear separation of concerns through modular structure
- Reduced boilerplate with decorators
- Built-in validation and error handling
- Learning curve for decorator-based patterns
- More opinionated than minimalist frameworks
