# Docker Deployment Guide

Complete guide for deploying the Salary Advance Platform using Docker.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Configuration](#configuration)
5. [Building Images](#building-images)
6. [Running Services](#running-services)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Copy environment file

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Update database password
- Set JWT secret
- Configure M-Pesa credentials (if using)

### 2. Build and start services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Access services

- **API**: http://localhost:3000
- **Web Dashboard**: http://localhost:3001
- **Database**: localhost:5432

---

## Architecture

### Services

```
┌─────────────────────────────────────────────────────┐
│                    Nginx (Optional)                  │
│              Reverse Proxy & Load Balancer           │
│                    Port 80/443                       │
└────────────┬──────────────────────┬──────────────────┘
             │                      │
    ┌────────▼────────┐    ┌───────▼────────┐
    │   Web (Next.js) │    │   API (Hono)   │
    │    Port 3001    │    │   Port 3000    │
    └─────────────────┘    └────────┬───────┘
                                    │
                            ┌───────▼────────┐
                            │   PostgreSQL   │
                            │   Port 5432    │
                            └────────────────┘
```

### Docker Images

1. **API Service** (`apps/api/Dockerfile`)
   - Multi-stage build
   - Based on Node.js 18 Alpine
   - ~150MB final image size
   - Runs as non-root user

2. **Web Service** (`apps/web/Dockerfile`)
   - Multi-stage build
   - Next.js optimized
   - ~200MB final image size
   - Runs as non-root user

3. **PostgreSQL** (Official image)
   - PostgreSQL 15 Alpine
   - Persistent volume for data

---

## Prerequisites

### Required

- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Available Ports**: 3000, 3001, 5432 (configurable)

### Recommended

- **CPU**: 2+ cores
- **RAM**: 4GB+ available
- **Disk**: 10GB+ available

### Installation

**macOS**:
```bash
brew install docker docker-compose
```

**Ubuntu/Debian**:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**Verify installation**:
```bash
docker --version
docker-compose --version
```

---

## Configuration

### Environment Variables

#### Required Variables

```env
# Database
POSTGRES_PASSWORD=your_secure_password_here
JWT_SECRET=your_secret_key_min_32_chars

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### Optional Variables

```env
# Ports (default values shown)
API_PORT=3000
WEB_PORT=3001
POSTGRES_PORT=5432

# M-Pesa (for production)
MPESA_ENABLED=true
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
```

### Security Best Practices

1. **Never commit `.env` file**
   - Already in `.gitignore`
   - Use `.env.example` as template

2. **Generate strong secrets**:
   ```bash
   # Generate JWT secret
   openssl rand -base64 64

   # Generate database password
   openssl rand -base64 32
   ```

3. **Use Docker secrets** (for production):
   ```yaml
   secrets:
     postgres_password:
       external: true
   ```

---

## Building Images

### Build all services

```bash
docker-compose build
```

### Build specific service

```bash
docker-compose build api
docker-compose build web
```

### Build with no cache

```bash
docker-compose build --no-cache
```

### Build arguments

```bash
docker-compose build --build-arg NEXT_PUBLIC_API_URL=https://api.prod.com
```

### Image optimization

Multi-stage builds automatically:
- ✅ Use Alpine Linux (minimal)
- ✅ Install only production dependencies
- ✅ Remove build artifacts
- ✅ Run as non-root user
- ✅ Include health checks

---

## Running Services

### Start all services

```bash
# Start in background
docker-compose up -d

# Start in foreground
docker-compose up
```

### Start specific service

```bash
docker-compose up -d postgres
docker-compose up -d api
docker-compose up -d web
```

### Stop services

```bash
# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop api
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web

# Last 100 lines
docker-compose logs --tail=100 api
```

### Execute commands

```bash
# API container
docker-compose exec api sh
docker-compose exec api node -v

# Database
docker-compose exec postgres psql -U salary_advance

# Run migrations
docker-compose exec api pnpm db:migrate
```

### Check health

```bash
# Service status
docker-compose ps

# Health checks
docker inspect salary-advance-api --format='{{.State.Health.Status}}'
docker inspect salary-advance-web --format='{{.State.Health.Status}}'
```

---

## Production Deployment

### 1. Use production environment file

```bash
cp .env.example .env.production
# Edit .env.production with production values
```

### 2. Enable Nginx reverse proxy

```bash
# Create SSL certificates directory
mkdir -p nginx/ssl

# Copy your SSL certificates
cp your-cert.pem nginx/ssl/cert.pem
cp your-key.pem nginx/ssl/key.pem

# Start with nginx profile
docker-compose --env-file .env.production --profile production up -d
```

### 3. Production checklist

- [ ] Set strong `POSTGRES_PASSWORD`
- [ ] Set unique `JWT_SECRET` (64+ characters)
- [ ] Configure proper `NEXT_PUBLIC_API_URL`
- [ ] Set up SSL certificates
- [ ] Enable M-Pesa production mode
- [ ] Configure backup strategy
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure log aggregation
- [ ] Enable firewall rules
- [ ] Set up automated database backups

### 4. Database backups

**Backup**:
```bash
docker-compose exec postgres pg_dump -U salary_advance salary_advance > backup.sql
```

**Restore**:
```bash
docker-compose exec -T postgres psql -U salary_advance salary_advance < backup.sql
```

**Automated backups** (add to cron):
```bash
0 2 * * * docker-compose exec postgres pg_dump -U salary_advance salary_advance | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz
```

### 5. Monitoring

Add to `docker-compose.yml`:

```yaml
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3002:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## Troubleshooting

### Common Issues

#### 1. Port already in use

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**:
```bash
# Find process using port
lsof -i :3000

# Kill process or change port in .env
API_PORT=3010
```

#### 2. Database connection failed

**Error**: `ECONNREFUSED postgres:5432`

**Solution**:
```bash
# Check postgres is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

#### 3. Out of disk space

**Error**: `no space left on device`

**Solution**:
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything
docker system prune -a --volumes
```

#### 4. Build fails with "no such file"

**Solution**:
```bash
# Clean build cache
docker-compose build --no-cache

# Check .dockerignore isn't excluding needed files
```

#### 5. Container keeps restarting

**Solution**:
```bash
# Check logs
docker-compose logs api

# Inspect health
docker inspect salary-advance-api

# Run manually to debug
docker run -it --rm salary-advance-api sh
```

### Performance tuning

**Increase container resources**:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Debugging

**Enter container**:
```bash
docker-compose exec api sh
```

**Check environment variables**:
```bash
docker-compose exec api env
```

**Test connectivity**:
```bash
# From API to database
docker-compose exec api ping postgres

# From host to API
curl http://localhost:3000/health
```

---

## Commands Reference

### Docker Compose

```bash
# Build
docker-compose build [service]

# Start
docker-compose up -d [service]

# Stop
docker-compose down

# Logs
docker-compose logs -f [service]

# Execute
docker-compose exec [service] [command]

# Scale
docker-compose up -d --scale api=3
```

### Docker

```bash
# List containers
docker ps -a

# List images
docker images

# Remove container
docker rm [container]

# Remove image
docker rmi [image]

# System info
docker system df
docker system info
```

---

## Security

### Container Security

1. **Run as non-root** ✅ (Already configured)
2. **Use official base images** ✅
3. **Scan for vulnerabilities**:
   ```bash
   docker scan salary-advance-api
   ```
4. **Keep images updated**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

### Network Security

1. **Use internal networks** ✅ (Already configured)
2. **Expose only necessary ports**
3. **Use reverse proxy** (Nginx)
4. **Enable SSL/TLS**

---

## Next Steps

1. **Set up CI/CD**: Automate builds and deployments
2. **Configure monitoring**: Prometheus + Grafana
3. **Set up logging**: ELK stack or Loki
4. **Enable auto-scaling**: Kubernetes for large scale
5. **Configure CDN**: CloudFlare for static assets

---

**Built with ❤️ in Kenya 🇰🇪**
