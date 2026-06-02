# KaoyanBuddy Backend

Spring Boot 后端，源码位于 `backend/src`。

## 启动

默认使用 MySQL：

```bash
mvn spring-boot:run
```

默认端口为 `8080`，健康检查为 `GET http://localhost:8080/api/health`。

本地默认数据库配置：

```text
DB_URL=jdbc:mysql://localhost:3306/kaoyan_buddy?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&createDatabaseIfNotExist=true
DB_USERNAME=root
DB_PASSWORD=123456
```

正式环境请用环境变量覆盖默认密码和 `JWT_SECRET`。

本机 MySQL 未配置或不想写入 MySQL 时，可使用 H2 本地开发库启动：

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

H2 数据文件位于 `backend/data/`，不会提交到 Git。

## 配置

复制 `.env.example` 可查看 MySQL、JWT、CORS 和 DeepSeek 相关环境变量。未设置 DeepSeek Key 时，AI 问答接口会返回本地降级答复。

## 当前验证状态

- 默认 MySQL profile 已启动成功。
- `GET /api/health` 返回 `UP`。
- 真实 API 已验证注册、当前用户、科目、任务完成、看板统计和 AI fallback。
- `mvn test` 已通过。

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

依赖下载和测试会写入 Maven 本地缓存。当前 Maven 本地仓库配置在 `D:\maven-repo`，但执行前仍需确认是否会增加 C 盘占用。

```bash
mvn test
```
