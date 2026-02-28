---
title: System Requirements
description: Minimum and recommended hardware and software requirements for self-hosted Storno.ro deployments.
---

# System Requirements

Hardware and software requirements for running Storno.ro on your own infrastructure.

## Software Requirements

### Docker Deployment (Recommended)

| Component | Version |
|-----------|---------|
| Docker | 24.0+ |
| Docker Compose | 2.20+ |

All other dependencies are included in the Docker images.

### Manual Deployment

| Component | Version | Notes |
|-----------|---------|-------|
| PHP | 8.2+ | FPM recommended |
| MySQL | 8.0+ | `utf8mb4` charset |
| Redis | 7.0+ | Cache, queues, and rate limiting |
| Node.js | 20+ | Frontend SSR |
| Nginx | 1.24+ | Reverse proxy |
| Java JRE | 17+ | UBL XML validation and digital signatures |
| Centrifugo | 5.x | Real-time WebSocket server |

### Required PHP Extensions

`pdo_mysql`, `intl`, `opcache`, `zip`, `gd` (with freetype + JPEG), `mbstring`, `bcmath`, `sockets`, `redis`, `apcu`, `ctype`, `iconv`

---

## Hardware Requirements

### Minimum (Small Team, < 5 users)

| Resource | Specification |
|----------|---------------|
| CPU | 2 vCPUs |
| RAM | 4 GB |
| Disk | 20 GB SSD |
| Network | 10 Mbps |

Suitable for small businesses with up to 500 invoices/month.

### Recommended (Medium Team, 5–25 users)

| Resource | Specification |
|----------|---------------|
| CPU | 4 vCPUs |
| RAM | 8 GB |
| Disk | 50 GB SSD |
| Network | 100 Mbps |

Suitable for businesses with multiple companies and thousands of invoices/month.

### Production (Large Team, 25+ users)

| Resource | Specification |
|----------|---------------|
| CPU | 8+ vCPUs |
| RAM | 16+ GB |
| Disk | 100+ GB SSD |
| Network | 100+ Mbps |

For high-volume deployments. Consider separating the database onto its own server.

---

## Resource Allocation (Kubernetes)

If deploying with Helm/Kubernetes, the recommended resource limits per pod:

| Pod | CPU Request | CPU Limit | Memory Request | Memory Limit | Storage |
|-----|-------------|-----------|----------------|--------------|---------|
| Backend (PHP) | 250m | 1000m | 256 Mi | 1 Gi | 12 Gi |
| Frontend (Node) | 100m | 500m | 128 Mi | 512 Mi | — |
| MySQL | 250m | 1000m | 512 Mi | 2 Gi | 10 Gi |
| Redis | 50m | 200m | 64 Mi | 256 Mi | 2 Gi |
| Centrifugo | 50m | 500m | 64 Mi | 256 Mi | 1 Gi |

---

## Disk Space Considerations

- **Database**: Grows with invoice volume. ~1 GB per 50,000 invoices (including line items, payments, audit logs).
- **File storage**: PDF and XML files are stored on disk or S3. ~50 KB per invoice (PDF + XML). 100,000 invoices ≈ 5 GB.
- **Logs**: Application and Nginx logs. Configure log rotation to prevent disk exhaustion.
- **Backups**: Plan for at least 2x your data size if storing backups locally.

{% callout type="note" %}
For production deployments, use S3-compatible object storage for files instead of local disk. This simplifies backups and allows horizontal scaling.
{% /callout %}

---

## Network Requirements

| Service | Port | Protocol | Direction |
|---------|------|----------|-----------|
| HTTPS | 443 | TCP | Inbound |
| MySQL | 3306 | TCP | Internal only |
| Redis | 6379 | TCP | Internal only |
| Centrifugo WS | 8444 | TCP | Internal (proxied via 443) |
| SMTP | 587 | TCP | Outbound |
| ANAF API | 443 | TCP | Outbound to `api.anaf.ro` |
| License validation | 443 | TCP | Outbound to `api.storno.ro` |
| S3 storage | 443 | TCP | Outbound to your S3 provider |

{% callout type="warning" %}
The backend must have outbound HTTPS access to `api.anaf.ro` for e-Factura integration and to `api.storno.ro` for license validation.
{% /callout %}

---

## Supported Platforms

Storno.ro Docker images are built for `linux/amd64`. Tested on:

- Ubuntu 22.04 / 24.04
- Debian 12
- Amazon Linux 2023
- Alpine Linux (container-native)

Cloud providers: AWS (EC2, ECS, EKS), Google Cloud (GCE, GKE), Azure (VM, AKS), DigitalOcean, Hetzner, OVH.
