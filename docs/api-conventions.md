# API conventions

These are conventions for future endpoints; this scaffold does not expose an API.

- Use the `/api/v1` prefix for versioned REST endpoints.
- Use nouns for resource paths and HTTP methods for actions (for example, `GET /api/v1/resources`); do not treat this example as an implemented endpoint.
- Send and receive JSON, and use standard HTTP status codes to distinguish success and failure.
- Return errors consistently with a machine-readable code and a human-readable message. Do not include secrets or internal stack traces in responses.
- Document request parameters, response shapes, and authorization requirements alongside each implemented endpoint.

Resource-specific routes and schemas will be documented as features are implemented.
