# Docker deployment

## Prerequisites and configuration

Install Docker Engine with the Compose plugin. Create the external volume and a local configuration file, then replace `backend` with the Docker service name of the related API:

```sh
docker volume create kitchen-management-config
cp config/kitchen-management.env.example config/kitchen-management.env
```

`config/kitchen-management.env` is intentionally ignored by Git. It configures the REST API and SockJS endpoint; this static frontend has no database, upload, or persistent application logs. The external `kitchen-management-config` volume only holds the generated runtime configuration.

## Build and standalone start

```sh
docker compose build
docker compose up -d
docker compose logs -f kitchen-management
```

Open `http://localhost:${KITCHEN_MANAGEMENT_PORT:-8080}`. The container runs Nginx as the unprivileged `nginx` user on port 8080. Its entrypoint creates the runtime configuration in the mounted external volume, assigning only that directory to `nginx`.

## Shared stack integration

Create the shared network once, then merge or use `compose.stack.example.yaml` in the parent stack. It deliberately has no `build` directive.

```sh
docker network create musicfest-shared
docker compose -f compose.stack.example.yaml up -d
```

Set `API_HOST` and `WEBSOCKET_ENDPOINT` to the internal Docker service name, for example `backend` and `http://backend:8080/ws`. Do not use `localhost` or `127.0.0.1` for container-to-container traffic.

## Diagnostics and data lifecycle

```sh
KITCHEN_MANAGEMENT_ENV_FILE=./config/kitchen-management.env.example docker compose config
docker compose ps
docker compose logs --tail=100 kitchen-management
docker exec $(docker compose ps -q kitchen-management) nginx -t
docker volume inspect kitchen-management-config
```

To stop only this service, run `docker compose down`. To back up its mutable runtime configuration, archive the volume contents:

```sh
docker run --rm -v kitchen-management-config:/data -v "$PWD":/backup alpine:3.20 \
  tar czf /backup/kitchen-management-config-backup.tar.gz -C /data .
```

Remove application data only when intended:

```sh
docker compose down
docker volume rm kitchen-management-config
```

## Offline image transfer

Build and tag a release with an immutable version, then create a compressed archive and checksum:

```sh
docker build -t kitchen-management:1.0.0 .
docker save kitchen-management:1.0.0 | gzip > kitchen-management-1.0.0.tar.gz
shasum -a 256 kitchen-management-1.0.0.tar.gz > kitchen-management-1.0.0.tar.gz.sha256
```

On the target host, verify and load it with `docker load`:

```sh
shasum -a 256 -c kitchen-management-1.0.0.tar.gz.sha256
gzip -dc kitchen-management-1.0.0.tar.gz | docker load
```