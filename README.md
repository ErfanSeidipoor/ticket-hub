# Ticket Hub

Welcome to the **Ticket Hub** project! This is a monorepo project powered by Nx, a monorepo framework, and can be found on [GitHub](https://github.com/ErfanSeidipoor/ticket-hub).

## Table of Contents

- [Introduction](#introduction)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Nx Graph](#nx-graph)
- [Kubernetes (K8s) Design](#kubernetes-k8s-design)

## Introduction

Ticket Hub is a monorepo project that consists of multiple backend microservices and a frontend application. It leverages Nx as a monorepo framework for efficient development and maintenance. Here's an overview of the project:

- **GitHub Repository:** [Ticket Hub](https://github.com/ErfanSeidipoor/ticket-hub)
- **Frontend Application:** "client"
- **Backend Microservices:**
  - Payments
  - Expiration
  - Auth
  - Orders
  - Tickets

The project uses Kafka as a messaging broker for efficient communication between microservices.

## Project Structure

The project directory structure is organized as follows:

- `/apps`: Contains the frontend application and Nest applications for microservices.

  - `/apps/auth`: Authentication microservice.
  - `/apps/expiration`: Microservice for checking order expiration.
  - `/apps/orders`: Microservice for storing all orders for tickets.
  - `/apps/payments`: Microservice for handling and verifying Stripe transactions.
  - `/apps/tickets`: Microservice for storing and handling tickets.

- `/libs`: Contains shared resources and code used across microservices and the frontend.

  - `/libs/decorator`: Shared decorators used across all microservices.
  - `/libs/dto`: DTOs shared among all microservices.
  - `/libs/enum`: Shared enums.
  - `/libs/error`: Shared error definitions for all microservices.
  - `/libs/event`: Kafka event producers and consumers.
  - `/libs/middleware`: Shared Nest middlewares.
  - `/libs/pipe`: Shared Nest pipes.
  - `/libs/utils`: Shared JavaScript utility functions.

- `/infra`: Includes Dockerfiles and Kubernetes (K8s) configuration files (YAML) for all the microservices and any necessary Docker configurations.
  - `/infra/docker`: Dockerfiles for production.
  - `/infra/k8s.dev`: YAML files for K8s in development mode.
  - `/infra/k8s.prod`: YAML files for K8s in production mode.
  - `/infra/k8s.test`: YAML files for K8s in test mode.

## Getting Started

To start working on the Ticket Hub project, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/ErfanSeidipoor/ticket-hub.git
   cd ticket-hub
   ```

2. Install project dependencies:

   ```bash
   npm install

   ```

3. Set up the required development environment for each microservice based on K8s:

```bash
    # For Payments:
    nx test payments:dev:req

    # For Expiration:
    nx test expiration:dev:req

    # For Tickets:
    nx test tickets:dev:req

    # For Orders:
    nx test orders:dev:req

    # For Auth:
    nx test auth:dev:req
```

### Development

- To start the frontend development server:

```bash
  nx serve client
```

- To start a specific microservice development server, use Nx commands. For example, to start the Auth microservice in development mode:

```bash
  nx run auth:start:dev
```

### Testing

- For testing each microservice, use the following commands:

```bash
  nx serve client
```

- To start a specific microservice development server, use Nx commands. For example, to start the Auth microservice in development mode:

```bash
    # For Payments:
    nx test payments --skip-nx-cache --runInBand

    # For Expiration:
    nx test expiration --skip-nx-cache --runInBand

    # For Tickets:
    nx test tickets --skip-nx-cache --runInBand

    # For Orders:
    nx test orders --skip-nx-cache --runInBand

    # For Auth:
    nx test auth --skip-nx-cache --runInBand
```

## Contributing

We welcome contributions from the community! Please check out our CONTRIBUTING.md file for detailed guidelines on how to contribute to Ticket Hub.

## License

This project is licensed under the [License Name] License - see the LICENSE.md file for details.

## Nx Graph

Below is a visual representation of the Nx dependency graph for the Ticket Hub project:

## Kubernetes (K8s) Design Structure

For detailed information on the Kubernetes design and configurations for the Ticket Hub project, please refer to K8s Design Documentation.
