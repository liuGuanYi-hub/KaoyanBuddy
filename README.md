# KaoyanBuddy

KaoyanBuddy 是一个考研规划助手，提供 AI 智能答疑、学习任务管理、科目管理和数据看板能力，目标是把备考过程拆成可跟踪、可复盘的日常任务流。

## 功能概览

- AI 智能答疑
- 每日学习任务生成与完成状态跟踪
- 学习时长、完成率和科目进度可视化
- 科目分类管理
- JWT 登录注册与用户认证

## 项目结构

```text
KaoyanBuddy/
├── backend/       # Spring Boot 后端
├── docs/          # 开发文档
├── frontend/      # React 前端
└── README.md
```

## 开发顺序

当前按前端优先推进：先完成 `frontend/` 页面体验和 Mock 数据闭环，再后续补齐后端接口、数据库、安全认证和联调。

详细计划见 [docs/frontend-first-plan.md](docs/frontend-first-plan.md)。

## 本地启动

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端默认地址为 `http://localhost:5173`。
当前前端默认启用 Mock 演示模式，不要求后端服务启动。切换真实后端时，在 `frontend/.env` 中设置 `VITE_USE_MOCK=false`。

### 后端

```bash
cd backend
mvn spring-boot:run
```

后端默认地址为 `http://localhost:8080`。
健康检查接口为 `GET http://localhost:8080/api/health`。

## 注意事项

依赖安装、构建和测试可能写入 `C:\Users\ZZD` 下的 npm/Maven 缓存。执行这些命令前，需要先确认预计 C 盘增量。
