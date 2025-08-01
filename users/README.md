# Users Microservice

A high-performance user management microservice built with NestJS that handles CRUD operations for users and sends notifications via RabbitMQ.

## 🚀 Performance

**500 RPS** (AMD Ryzen 7, 8th generation):
- **Min response time**: 0ms
- **Max response time**: 11ms  
- **Mean response time**: 2.3ms
- **Median response time**: 2ms
- **P95**: 4ms
- **P99**: 5ms

## 📋 Overview

RESTful API for user management with MongoDB integration and RabbitMQ notifications. Supports user CRUD operations with automatic notification publishing.

## 🛠️ Technology Stack

- **Framework**: NestJS 10.x
- **Database**: MongoDB with replica set
- **Message Broker**: RabbitMQ
- **Container**: Docker

## 🚀 Quick Start

```bash
# Development
yarn install
yarn start:dev

# Production
docker build -t users-service .
docker-compose up users
```

## 📊 API Endpoints

- `POST /users` - Create user
- `GET /users` - Get all users (with pagination)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /health` - Health check

## 🔧 Features

- MongoDB replica set support
- RabbitMQ notifications for user events
- Pagination and projection support
- Comprehensive error handling
- Swagger API documentation

