# Docker-заметки backend-модуля

Папка `backend/docker/` зарезервирована для backend-specific Docker artifacts.

## Текущее состояние

Основная локальная инфраструктура запускается из корневого `docker-compose.yml`.

Сейчас compose поднимает:

- PostgreSQL;
- Redis;
- optional MinIO profile;
- optional Ollama profile.

Backend и frontend на текущем этапе запускаются локально через Maven wrapper и Vite, без отдельных compose services.

## Planned

- production-oriented compose override;
- init scripts и seed data при необходимости;
- backend/frontend Dockerfile, если понадобится full-stack container setup;
- deployment notes после стабилизации API contract.

## Ссылка

- [Руководство разработчика](../../docs/README.DEV.md)
