# KaoyanBuddy Backend

Spring Boot 后端，源码位于 `backend/src`。

## 启动

```bash
mvn spring-boot:run
```

默认端口为 `8080`。

本机 MySQL 未配置时，可使用 H2 本地开发库启动：

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

H2 数据文件位于 `backend/data/`，不会提交到 Git。

## 配置

复制 `.env.example`，设置 MySQL、JWT 和 DeepSeek 相关环境变量。未设置 DeepSeek Key 时，AI 问答接口会返回本地降级答复。

## API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/subjects`
- `GET/POST/PUT/DELETE /api/tasks`
- `PATCH /api/tasks/{id}/status`
- `POST /api/tasks/generate`
- `GET /api/dashboard/summary`
- `POST /api/ai/chat`

## 验证

依赖下载和测试会写入 Maven 本地缓存。执行前请先确认 C 盘可接受增量。

```bash
mvn test
```
