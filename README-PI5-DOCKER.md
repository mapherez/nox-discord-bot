# Nox Discord Bot - Pi 5 Docker deployment files

## Files to copy into the repo

```txt
Dockerfile
.dockerignore
.github/workflows/docker-image.yml
```

## File to copy onto the Raspberry Pi

```txt
docker-compose.yml
.env.example
```

Rename `.env.example` to `.env` on the Pi and fill in your real tokens.

## Important production patch

Before building the Docker image, apply:

```bash
git apply patches/production-js-loaders.diff
```

Why: the current project loads command modules by looking for `.ts` files. After `npm run build`,
the runtime files are `.js` under `dist/`, so production Docker needs the loaders to accept `.js` too.

## Build image manually from GitHub

Go to:

```txt
GitHub → Actions → Build Docker image → Run workflow
```

Use:

```txt
tag: pi5
push_latest: true
```

This publishes:

```txt
ghcr.io/mapherez/nox-discord-bot:pi5
ghcr.io/mapherez/nox-discord-bot:latest
```

## On the Raspberry Pi 5

Create a folder:

```bash
mkdir -p ~/docker/nox-discord-bot
cd ~/docker/nox-discord-bot
```

Copy these files into it:

```txt
docker-compose.yml
.env
prefix-commands.json
```

Then run:

```bash
docker compose pull
docker compose up -d
docker compose logs -f
```

## Update later

```bash
cd ~/docker/nox-discord-bot
docker compose pull
docker compose up -d
```
