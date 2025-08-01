# Notifications Microservice

A high-performance notification microservice built with NestJS that handles user lifecycle events and sends email notifications.

## 🚀 Performance

**500 RPS** (AMD Ryzen 7, 8th generation):
- **Min response time**: 0ms
- **Max response time**: 11ms  
- **Mean response time**: 2.3ms
- **Median response time**: 2ms
- **P95**: 4ms
- **P99**: 5ms

## 📋 Overview

This microservice processes user lifecycle events (create, update, delete) via RabbitMQ messages and sends appropriate email notifications. It includes comprehensive error handling with dead letter queues and retry mechanisms.

## 🏗️ Architecture

### Core Components
- **NotificationConsumer**: RabbitMQ message consumer with retry logic
- **NotificationService**: Business logic for processing notifications
- **EmailsExternalService**: External email service integration
- **Health Module**: Service health monitoring

### Message Flow
1. Receives user events via RabbitMQ
2. Processes notifications based on action type
3. Sends emails via external service
4. Handles errors with dead letter queues

## 🔧 Features

### Supported Actions
- `USER_CREATED` - Sends welcome email
- `USER_UPDATED` - Handles user updates
- `USER_DELETED` - Handles user deletion
- `USER_CREATION_FAILED` - Error handling
- `USER_UPDATE_FAILED` - Error handling  
- `USER_DELETE_FAILED` - Error handling

### Error Handling
- **Retry Logic**: 3 retries for normal messages, 5 for error messages
- **Dead Letter Queues**: Failed messages sent to DLX for monitoring
- **TTL Configuration**: 24h for normal, 7 days for errors, 30 days for DLX
- **Queue Limits**: 10k normal messages, 5k error messages

## 🛠️ Technology Stack

- **Framework**: NestJS 10.x
- **Runtime**: Node.js 20.17.0
- **Message Broker**: RabbitMQ
- **Logging**: Pino with structured logging
- **Container**: Docker with multi-stage build
- **Testing**: Jest with E2E tests

## 🚀 Quick Start

### Prerequisites
- Node.js 20.17.0
- Docker & Docker Compose
- RabbitMQ cluster

### Development
```bash
# Install dependencies
yarn install

# Start in development mode
yarn start:dev

# Run tests
yarn test
yarn test:e2e
```

### Production
```bash
# Build Docker image
docker build -t notifications-service .

# Run with Docker Compose
docker-compose up notifications
```

## 📊 Monitoring

### Health Endpoints
- `GET /health` - Service health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

### Logging
Structured JSON logging with correlation IDs and request tracing.

## 🔌 Configuration

### Environment Variables
- `LOG_LEVEL` - Logging level (default: info)
- `RABBITMQ_URL` - RabbitMQ connection string
- `EMAIL_SERVICE_URL` - External email service URL

### RabbitMQ Configuration
- **Exchange**: `notifications`
- **Queues**: `notifications`, `notifications.error`, `notifications.dlx`
- **Routing Keys**: `user.notification`, `user.notification.error`

## 📁 Project Structure

```
src/
├── modules/
│   ├── notifications/
│   │   ├── notification.consumer.ts    # RabbitMQ consumers
│   │   ├── notification.service.ts     # Business logic
│   │   └── notification.module.ts      # Module definition
│   └── health/                         # Health checks
├── common/
│   ├── external-services/              # External integrations
│   ├── modules/rabbitmq/               # RabbitMQ configuration
│   └── logger/                         # Logging utilities
└── tests/                              # Test suites
```

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests  
yarn test:e2e

# Coverage
yarn test:cov
```


