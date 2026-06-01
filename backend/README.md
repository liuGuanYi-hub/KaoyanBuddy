# KaoyanBuddy Backend

Spring Boot 后端，源码位于 `backend/src`。

## 启动

```bash
mvn spring-boot:run
```

默认端口为 `8080`。

## 配置

复制 `.env.example`，设置 MySQL、JWT 和 DeepSeek 相关环境变量。未设置 DeepSeek Key 时，AI 问答接口会返回本地降级答复。

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/subjects`
- `GET/POST/PUT/DELETE /api/tasks`
- `PATCH /api/tasks/{id}/status`
- `POST /api/tasks/generate`
- `GET /api/dashboard/summary`
- `POST /api/ai/chat`
