# Docker-заметки backend-модуля

Папка `backend/docker/` зарезервирована для backend-specific Docker artifacts.

## Текущее состояние

Основная локальная инфраструктура запускается из корневого `docker-compose.yml`.

Сейчас compose поднимает весь стек:

- PostgreSQL;
- Redis;
- Backend (Spring Boot, multi-stage Dockerfile);
- Frontend (nginx, multi-stage Dockerfile);
- optional MinIO profile;
- optional Ollama profile.

Быстрый старт: `docker compose up -d --build`. Детали — в `docs/DEPLOYMENT.md`.

## Done

- ✅ Backend Dockerfile (multi-stage Maven + JRE 21)
- ✅ Frontend Dockerfile (multi-stage pnpm + nginx)
- ✅ Frontend nginx.conf with SPA fallback and API reverse proxy
- ✅ docker-compose.yml updated with backend and frontend services
- ✅ .env.docker.example for full-stack Docker deployment
- ✅ docs/DEPLOYMENT.md with deployment guide

## Ссылка

- [Руководство разработчика](../../docs/README.DEV.md)
