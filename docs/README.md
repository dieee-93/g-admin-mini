# Project Overview

This project is a Vite + React + TypeScript single-page application (SPA) designed to manage and analyze materials within a supply chain context. The application integrates with Supabase for backend services, including authentication and database management.

## Table of Contents

- [Installation](#installation)
- [Development](#development)
- [Audit](#audit)
- [Contributing](#contributing)
- [License](#license)

## Installation

To get started with the project, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install dependencies using pnpm:
   ```
   pnpm install
   ```

## Development

To run the development server, use the following command:
```
pnpm dev
```

This will start the Vite development server, allowing you to view the application in your browser.

### Running Tests

To run the type checks and linting, use:
```
pnpm -s exec tsc --noEmit
pnpm -s exec eslint .
```

## Audit

The audit directory contains several documents that outline various aspects of the project's code quality and architecture. Each document focuses on specific areas of concern:

- **Errors**: Identifies runtime and type errors that may affect application functionality.
- **Bad Practices**: Highlights coding practices that do not adhere to best practices.
- **Architectural Issues**: Discusses concerns related to module separation and component coupling.
- **Business Logic Errors**: Focuses on discrepancies in business logic and data flows.
- **Duplicated Functionality**: Identifies instances of duplicated code that may require refactoring.
- **Gaps**: Captures any missing integrations or unimplemented features.

## Contributing

Contributions are welcome! Please follow the standard pull request process and ensure that your changes adhere to the project's coding standards.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.