# ==============================================================================
# Plexivia Monorepo Makefile
#   Local:  make install | build | dev
#   VPS:    make setup (first time) | make deploy | make status | make logs
# ==============================================================================

SHELL := /usr/bin/env bash
APP_DIR  ?= /opt/plexivia
SERVICES := plexivia-backend plexivia-auth plexivia-hub plexivia-agency plexivia-finance
NGINX_SITES := /etc/nginx/sites-available
SVC ?= plexivia-backend
DSVC ?=

.PHONY: help install build build-services dev setup deploy restart status logs health \
        nginx docker-up docker-down docker-logs docker-ps docker-deploy

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-16s\033[0m %s\n",$$1,$$2}'

# ---------- Local ----------
install: ## Install all workspace dependencies
	npm install --include=optional

build: ## Build backend + admin
	npm run build

build-services: ## Build all microservices
	npm run build:services

dev: ## Run backend in dev mode
	npm run dev

# ---------- VPS ----------
setup: ## First-time VPS setup: install systemd units + nginx confs (run as root)
	install -m 644 deploy/systemd/*.service /etc/systemd/system/
	systemctl daemon-reload
	systemctl enable $(SERVICES)
	$(MAKE) nginx

nginx: ## Install nginx site confs and reload
	install -m 644 deploy/*.conf $(NGINX_SITES)/
	for f in deploy/*.conf; do ln -sf $(NGINX_SITES)/$$(basename $$f) /etc/nginx/sites-enabled/; done
	nginx -t && systemctl reload nginx

deploy: ## Pull, build, publish frontends, restart services (run as root on VPS)
	APP_DIR=$(APP_DIR) bash deploy/deploy.sh

restart: ## Restart all Plexivia services
	systemctl restart $(SERVICES)

status: ## Show status of all Plexivia services
	systemctl --no-pager status $(SERVICES) | grep -E '●|Active:'

logs: ## Tail logs (make logs SVC=plexivia-auth)
	journalctl -u $(SVC) -n 100 -f

health: ## Check API gateway health
	curl -fsS http://127.0.0.1:5095/api/health && echo

# ---------- Docker ----------
COMPOSE := docker compose -f deploy/docker-compose.yml

docker-up: ## Build and start mongo + backend + admin (needs deploy/.env)
	$(COMPOSE) up -d --build

docker-down: ## Stop docker compose stack
	$(COMPOSE) down

docker-logs: ## Tail container logs (make docker-logs DSVC=backend)
	$(COMPOSE) logs -f --tail=100 $(DSVC)

docker-ps: ## Show container status and health
	$(COMPOSE) ps

docker-deploy: ## Pull latest Live branch, rebuild and restart containers
	git pull origin Live
	$(COMPOSE) up -d --build
