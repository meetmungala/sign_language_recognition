# Docker Deployment Configuration

This directory contains Docker configurations for deploying the Sign Language Recognition Platform.

## Services

- **python-ml**: Python ML backend with TensorFlow/PyTorch
- **flask-api**: Flask REST API server
- **php-backend**: PHP backend for user management
- **react-frontend**: React.js frontend application
- **mysql**: MySQL database
- **redis**: Redis cache and message broker
- **nginx**: Reverse proxy and static file server

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sign-language-platform
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and start services**
   ```bash
   docker-compose up -d
   ```

4. **Initialize database**
   ```bash
   docker-compose exec mysql mysql -u root -p < database/schema.sql
   docker-compose exec python-ml python database/init_data.py
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:5000
   - PHP Backend: http://localhost:8080

## Production Deployment

For production deployment, use the `docker-compose.prod.yml` file:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring

- **Logs**: `docker-compose logs -f [service-name]`
- **Health Check**: `docker-compose ps`
- **Resource Usage**: `docker stats`

## Scaling

To scale specific services:

```bash
docker-compose up -d --scale python-ml=3 --scale flask-api=2
```
