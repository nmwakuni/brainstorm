# ============================================================================
# Salary Advance Platform - Makefile
# ============================================================================

.PHONY: help build up down logs clean test lint format docker-build docker-up docker-down docker-logs db-migrate db-backup

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

## help: Display this help message
help:
	@echo "$(BLUE)Salary Advance Platform - Available Commands$(NC)"
	@echo ""
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## /  /' | column -t -s ':' | sed 's/^/  /'
	@echo ""

# ============================================================================
# Development Commands
# ============================================================================

## dev: Start development servers
dev:
	@echo "$(GREEN)Starting development servers...$(NC)"
	pnpm dev

## install: Install all dependencies
install:
	@echo "$(GREEN)Installing dependencies...$(NC)"
	pnpm install

## build: Build all packages for production
build:
	@echo "$(GREEN)Building all packages...$(NC)"
	pnpm build

## clean: Clean build artifacts and dependencies
clean:
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf apps/*/.next
	rm -rf apps/*/dist
	rm -rf packages/*/dist
	rm -rf .turbo

# ============================================================================
# Testing & Quality
# ============================================================================

## test: Run all tests
test:
	@echo "$(GREEN)Running tests...$(NC)"
	pnpm test

## test-watch: Run tests in watch mode
test-watch:
	@echo "$(GREEN)Running tests in watch mode...$(NC)"
	pnpm test:watch

## test-coverage: Run tests with coverage
test-coverage:
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	pnpm test:coverage

## lint: Run linter
lint:
	@echo "$(GREEN)Running linter...$(NC)"
	pnpm lint

## lint-fix: Fix linting issues
lint-fix:
	@echo "$(GREEN)Fixing linting issues...$(NC)"
	pnpm lint:fix

## format: Format code with Prettier
format:
	@echo "$(GREEN)Formatting code...$(NC)"
	pnpm format

## format-check: Check code formatting
format-check:
	@echo "$(GREEN)Checking code formatting...$(NC)"
	pnpm format:check

## check: Run all quality checks (lint, format, test, build)
check: lint format-check test build
	@echo "$(GREEN)✓ All quality checks passed!$(NC)"

# ============================================================================
# Database Commands
# ============================================================================

## db-generate: Generate database migrations
db-generate:
	@echo "$(GREEN)Generating database migrations...$(NC)"
	pnpm db:generate

## db-migrate: Run database migrations
db-migrate:
	@echo "$(GREEN)Running database migrations...$(NC)"
	pnpm db:migrate

## db-studio: Open Drizzle Studio
db-studio:
	@echo "$(GREEN)Opening Drizzle Studio...$(NC)"
	pnpm db:studio

# ============================================================================
# Docker Commands
# ============================================================================

## docker-build: Build Docker images
docker-build:
	@echo "$(GREEN)Building Docker images...$(NC)"
	docker-compose build

## docker-up: Start Docker services
docker-up:
	@echo "$(GREEN)Starting Docker services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Services started!$(NC)"
	@echo "$(BLUE)API:$(NC) http://localhost:3000"
	@echo "$(BLUE)Web:$(NC) http://localhost:3001"

## docker-down: Stop Docker services
docker-down:
	@echo "$(YELLOW)Stopping Docker services...$(NC)"
	docker-compose down

## docker-logs: View Docker logs
docker-logs:
	docker-compose logs -f

## docker-logs-api: View API logs
docker-logs-api:
	docker-compose logs -f api

## docker-logs-web: View Web logs
docker-logs-web:
	docker-compose logs -f web

## docker-ps: List running containers
docker-ps:
	docker-compose ps

## docker-restart: Restart Docker services
docker-restart:
	@echo "$(YELLOW)Restarting Docker services...$(NC)"
	docker-compose restart

## docker-clean: Remove Docker containers, volumes, and images
docker-clean:
	@echo "$(RED)Cleaning Docker resources...$(NC)"
	docker-compose down -v
	docker system prune -f

## docker-rebuild: Rebuild and restart Docker services
docker-rebuild: docker-down docker-build docker-up
	@echo "$(GREEN)✓ Docker services rebuilt and restarted!$(NC)"

# ============================================================================
# Docker Database Commands
# ============================================================================

## docker-db-migrate: Run migrations in Docker
docker-db-migrate:
	@echo "$(GREEN)Running migrations in Docker...$(NC)"
	docker-compose exec api pnpm db:migrate

## docker-db-backup: Backup database
docker-db-backup:
	@echo "$(GREEN)Backing up database...$(NC)"
	@mkdir -p backups
	docker-compose exec postgres pg_dump -U salary_advance salary_advance > backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)✓ Database backed up to backups/backup-$$(date +%Y%m%d-%H%M%S).sql$(NC)"

## docker-db-restore: Restore database from backup (requires BACKUP_FILE=path/to/backup.sql)
docker-db-restore:
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "$(RED)Error: BACKUP_FILE not specified$(NC)"; \
		echo "Usage: make docker-db-restore BACKUP_FILE=backups/backup-xxx.sql"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Restoring database from $(BACKUP_FILE)...$(NC)"
	docker-compose exec -T postgres psql -U salary_advance salary_advance < $(BACKUP_FILE)
	@echo "$(GREEN)✓ Database restored!$(NC)"

# ============================================================================
# Production Commands
# ============================================================================

## docker-prod: Start production services with Nginx
docker-prod:
	@echo "$(GREEN)Starting production services...$(NC)"
	docker-compose --profile production up -d
	@echo "$(GREEN)✓ Production services started!$(NC)"
	@echo "$(BLUE)Access via Nginx:$(NC) http://localhost"

## docker-prod-logs: View production logs
docker-prod-logs:
	docker-compose --profile production logs -f

# ============================================================================
# Utility Commands
# ============================================================================

## env-setup: Create .env file from example
env-setup:
	@if [ -f .env ]; then \
		echo "$(YELLOW).env file already exists. Skipping...$(NC)"; \
	else \
		echo "$(GREEN)Creating .env file from .env.example...$(NC)"; \
		cp .env.example .env; \
		echo "$(GREEN)✓ .env file created. Please update it with your values.$(NC)"; \
	fi

## version: Show version information
version:
	@echo "$(BLUE)Salary Advance Platform$(NC)"
	@echo "Node: $$(node --version)"
	@echo "pnpm: $$(pnpm --version)"
	@echo "Docker: $$(docker --version 2>/dev/null || echo 'Not installed')"
	@echo "Docker Compose: $$(docker-compose --version 2>/dev/null || echo 'Not installed')"

# Default target
.DEFAULT_GOAL := help
