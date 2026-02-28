---
title: Self-Hosting
description: Deploy Storno.ro on your own infrastructure using Docker.
---

# Self-Hosting

Storno.ro can be deployed on your own servers using Docker. Self-hosted instances connect to the Storno.ro SaaS for license validation and plan management, while all your data stays on your infrastructure.

## Prerequisites

- Docker and Docker Compose installed
- A valid license key from [app.storno.ro/settings/billing](https://app.storno.ro/settings/billing)
- A domain name with SSL (recommended for production)

## Quick Start

### 1. Download the deployment files

```bash
mkdir storno && cd storno
curl -O https://raw.githubusercontent.com/stornoro/storno/main/deploy/docker-compose.yml
curl -O https://raw.githubusercontent.com/stornoro/storno/main/deploy/.env.example
curl -O https://raw.githubusercontent.com/stornoro/storno/main/deploy/centrifugo.json
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

```bash
# Generate secrets (run each one separately)
openssl rand -hex 32  # → APP_SECRET
openssl rand -hex 32  # → JWT_PASSPHRASE
openssl rand -hex 32  # → CENTRIFUGO_API_KEY
openssl rand -hex 32  # → CENTRIFUGO_TOKEN_HMAC_SECRET

# Set your database password
MYSQL_ROOT_PASSWORD=your-strong-password
MYSQL_PASSWORD=your-strong-password

# Paste your license key
LICENSE_KEY=your-license-key-here
```

### 3. Start the services

```bash
docker compose --profile local-db up -d
```

This starts five containers:

| Service | Description | Default Port |
|---------|-------------|-------------|
| `backend` | PHP API server (Symfony + Nginx) | 8900 |
| `frontend` | Nuxt SSR web application | 8901 |
| `db` | MySQL 8.0 database | 3306 |
| `redis` | Redis 7 (cache, queues, locks) | 6379 |
| `centrifugo` | WebSocket server for real-time updates | 8445 |

### 4. Initialize the database

On first startup, create the database schema and mark all migrations as applied:

```bash
docker compose exec backend php bin/console doctrine:schema:create
docker compose exec backend php bin/console doctrine:migrations:sync-metadata-storage
docker compose exec backend php bin/console doctrine:migrations:version --add --all --no-interaction
```

### 5. Create the first user

```bash
docker compose exec backend php bin/console app:user:create \
  --email=admin@yourdomain.com \
  --password=your-password \
  --admin
```

JWT keys are generated automatically on first startup — no manual step needed.

### 6. Access the application

Open `http://localhost:8901` in your browser (or your configured domain) and log in.

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_SECRET` | Symfony application secret | `openssl rand -hex 32` |
| `JWT_PASSPHRASE` | JWT key passphrase | `openssl rand -hex 32` |
| `MYSQL_ROOT_PASSWORD` | MySQL root password | — |
| `MYSQL_PASSWORD` | MySQL user password | — |
| `CENTRIFUGO_API_KEY` | Centrifugo internal API key | `openssl rand -hex 32` |
| `CENTRIFUGO_TOKEN_HMAC_SECRET` | Centrifugo HMAC secret | `openssl rand -hex 32` |
| `LICENSE_KEY` | Your Storno.ro license key | Get from SaaS dashboard |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_PORT` | `8900` | Backend API port |
| `FRONTEND_PORT` | `8901` | Frontend web port |
| `CENTRIFUGO_PORT` | `8445` | WebSocket port |
| `MYSQL_PORT` | `3306` | MySQL port |
| `MYSQL_DATABASE` | `storno` | Database name |
| `MYSQL_USER` | `storno` | Database user |
| `FRONTEND_URL` | `http://localhost:8901` | Public URL for the frontend |
| `PUBLIC_API_BASE` | `/api` | How the browser reaches the API |
| `CORS_ALLOW_ORIGIN` | `localhost` pattern | CORS allowed origins regex |
| `MAILER_DSN` | `null://null` | SMTP/SES transport DSN |
| `MAIL_FROM` | `noreply@storno.ro` | Sender email address |
| `GOOGLE_CLIENT_ID` | — | Google OAuth client ID (optional). Mapped to both backend and frontend containers. |
| `GOOGLE_CLIENT_SECRET` | — | Google OAuth client secret (optional). Mapped to the backend container. |
| `LICENSE_SERVER_URL` | `https://app.storno.ro` | License validation server (do not change) |

---

## License Key

Your license key connects your self-hosted instance to your Storno.ro subscription. The key is validated periodically against the SaaS server.

### Obtaining a License Key

1. Log in to [app.storno.ro](https://app.storno.ro)
2. Go to **Settings → Billing**
3. Go to **Settings → Licensing** and generate a new key
5. Copy the key and paste it in your `.env` file as `LICENSE_KEY`

### How Validation Works

- The license key is a signed JWT validated **entirely offline** — no network calls to the SaaS server
- Plan, features, and expiration are embedded in the JWT and verified via RSA signature
- When the key expires, the instance falls back to the Community (free) plan
- **No user data or business information is ever transmitted**

### License Sync Command

The license is validated automatically, but you can also run it manually:

```bash
docker compose exec backend php bin/console app:license:sync
```

For automated validation, add a cron job (recommended every 6 hours):

```bash
0 */6 * * * cd /path/to/storno && docker compose exec -T backend php bin/console app:license:sync
```

---

## Reverse Proxy Setup

For production, place a reverse proxy (Nginx, Caddy, Traefik) in front of the services to handle SSL termination.

### Nginx Example

```nginx
server {
    listen 443 ssl http2;
    server_name factura.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/factura.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/factura.yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:8901;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api {
        proxy_pass http://127.0.0.1:8900;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 50M;
    }

    # WebSocket
    location /connection/websocket {
        proxy_pass http://127.0.0.1:8444;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Update your `.env` to match:

```bash
FRONTEND_URL=https://factura.yourdomain.com
PUBLIC_API_BASE=https://factura.yourdomain.com/api
PUBLIC_CENTRIFUGO_WS=wss://factura.yourdomain.com/connection/websocket
CORS_ALLOW_ORIGIN=^https://factura\.yourdomain\.com$
```

### Caddy Example

```caddyfile
factura.yourdomain.com {
    handle /api/* {
        reverse_proxy localhost:8900
    }

    handle /connection/websocket {
        reverse_proxy localhost:8445
    }

    handle {
        reverse_proxy localhost:8901
    }
}
```

---

## Upgrading

To upgrade to the latest version:

```bash
docker compose pull
docker compose up -d
docker compose exec backend php bin/console doctrine:migrations:migrate --no-interaction
docker compose exec backend php bin/console cache:clear
```

---

## Backups

### Database

```bash
docker compose exec db mysqldump -u root -p storno > backup_$(date +%Y%m%d).sql
```

### Application Data

Back up the Docker volumes for persistent data:

```bash
# List volumes
docker volume ls | grep storno

# Backup database volume
docker run --rm -v storno_db_data:/data -v $(pwd):/backup alpine tar czf /backup/db_data.tar.gz /data

# Backup uploaded documents
docker run --rm -v storno_backend_var:/data -v $(pwd):/backup alpine tar czf /backup/backend_var.tar.gz /data
```

### Company-Level Backup

Storno.ro also supports per-company backup/restore through the API:

```bash
# Export company data
curl -X POST https://your-instance/api/v1/backup/export \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"

# Import company data
curl -X POST https://your-instance/api/v1/backup/import \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}" \
  -F "file=@backup.zip"
```

---

## Troubleshooting

### License validation fails

```bash
# Check license status
docker compose exec backend php bin/console app:license:sync

# Verify LICENSE_KEY is set
docker compose exec backend printenv LICENSE_KEY

# Test connectivity to SaaS
docker compose exec backend curl -s https://app.storno.ro/api/health
```

### Database connection refused

```bash
# Check if MySQL is healthy
docker compose ps db

# View MySQL logs
docker compose logs db
```

### WebSocket not connecting

Ensure `PUBLIC_CENTRIFUGO_WS` matches your public URL and that your reverse proxy forwards WebSocket upgrades correctly.

```bash
# Check Centrifugo health
docker compose exec centrifugo wget -qO- http://localhost:8900/health
```

### View application logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

