# KaoyanBuddy Frontend

React + Vite 前端，源码位于 `frontend/src`。

## 启动

```bash
npm install
npm run dev
```

默认开发端口为 `5173`。如需修改 API 地址，复制 `.env.example` 为 `.env`，然后设置：

```text
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK=true
```

## Mock 优先开发

当前前端默认启用 Mock 模式，不依赖后端即可演示登录、科目、任务、看板和 AI 问答流程。演示数据保存在浏览器 `localStorage` 中。

切换真实后端：

```text
VITE_USE_MOCK=false
```

本机真实联调推荐 `frontend/.env`：

```text
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK=false
```

## 页面

- 登录/注册
- 学习看板
- 任务管理
- 科目管理
- AI 问答
