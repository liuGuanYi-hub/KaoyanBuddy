# KaoyanBuddy 前端优先开发文档

## 1. 项目目标

KaoyanBuddy 先以“前端页面体验可完整演示”为第一阶段目标。前端需要在不依赖后端服务启动的情况下完成主要页面、交互流程、Mock 数据闭环和视觉打磨；后端接口、数据库、安全认证和真实 AI 联调放到后续阶段补齐。

当前阶段的交付重点：

- 页面可浏览：登录/注册、学习看板、任务管理、科目管理、AI 问答。
- 交互可演示：表单输入、任务生成、任务状态切换、科目维护、看板数据变化、AI 占位问答。
- 数据可替换：Mock 数据结构贴近后续真实 API，避免联调时大改页面。
- 后端不阻塞：前端阶段不要求 Spring Boot、MySQL 或 DeepSeek 可用。

## 2. 阶段拆分

### 阶段一：前端页面与 Mock 闭环

目标：把 `frontend/` 做成可独立运行的前端演示版本。

开发内容：

- 补齐页面状态：加载、空数据、错误、提交中、成功反馈。
- 补齐 Mock 数据层：通过统一 API 客户端切换 Mock 返回，不让页面直接依赖硬编码数据。
- 优化核心流程：注册/登录进入工作台，创建科目，创建任务，生成每日任务，切换任务完成状态，看板同步刷新。
- 打磨响应式布局：桌面端优先兼顾移动端，避免表格、按钮、长文本溢出。
- 保留真实 API 接口形状：Mock 方法名和字段名尽量与后端接口保持一致。

验收标准：

- 不启动后端也可以进入前端主要页面。
- 所有页面都有可演示数据，且可以通过 UI 产生状态变化。
- 浏览器刷新后可以保留必要的演示状态，或有明确的初始化 Mock 数据。
- 前端代码不直接散落 Mock 常量，统一从 Mock 服务或 API 客户端返回。

### 阶段二：前端体验打磨

目标：让前端从“能演示”提升到“像产品”。

开发内容：

- 看板：优化统计卡、趋势图、科目分布和近期任务摘要。
- 任务：增加筛选、状态切换、实际学习时长记录和快捷生成。
- 科目：增加颜色、分类、目标时长和进度呈现。
- AI 问答：展示真实/降级来源状态，支持连续对话的本地展示。
- 全局体验：统一按钮、输入框、消息提示、确认弹窗和错误文案。

验收标准：

- 用户能用 3-5 分钟完成一条完整学习规划流程演示。
- 页面在常见桌面宽度和移动宽度下无明显重叠、溢出或错位。
- 空数据、错误状态和长文本状态都有合理展示。

### 阶段三：后端接口后补与联调

目标：用真实后端替换 Mock，不改变主要前端页面行为。

开发内容：

- 认证接口：注册、登录、当前用户、JWT 过期处理。
- 科目接口：列表、新增、编辑、删除。
- 任务接口：列表筛选、新增、编辑、删除、状态更新、每日生成。
- 看板接口：任务总数、完成数、完成率、学习时长、每日趋势、科目分布。
- AI 接口：DeepSeek 可用时返回真实答复，未配置时返回 fallback 答复。

验收标准：

- 切换到真实 API 后，前端主要页面不需要改动组件结构。
- 用户数据按登录账号隔离。
- DeepSeek 未配置时 AI 问答仍可用，并明确返回 fallback 状态。

## 3. 前端页面清单

### 登录/注册

页面目标：

- 支持账号创建和登录。
- Mock 阶段可用任意符合格式的账号进入工作台。
- 登录后写入本地 token 或 Mock session。

关键状态：

- 登录中、注册中、用户名/密码为空、接口错误、token 过期。

### 学习看板

页面目标：

- 展示当前学习任务总览。
- 展示完成率、计划时长、实际时长和科目进度。
- 展示近 7 天学习趋势。

关键状态：

- 无任务数据、只有未完成任务、全部完成、长科目名称、多科目颜色。

### 任务管理

页面目标：

- 创建、编辑、删除任务。
- 按日期、状态、科目筛选任务。
- 一键生成当日学习任务。
- 快捷切换任务完成状态并记录实际时长。

关键状态：

- 无科目时引导生成或创建科目。
- 任务为空时展示空状态。
- 删除任务前二次确认。

### 科目管理

页面目标：

- 创建、编辑、删除科目。
- 设置科目分类、颜色和目标学习小时。
- 为任务和看板提供统一科目来源。

关键状态：

- 科目为空、科目被任务引用、颜色选择、目标时长非法。

### AI 问答

页面目标：

- 支持输入问题并追加对话消息。
- Mock 阶段返回本地规划建议。
- 真实后端阶段展示 `fallback` 状态。

关键状态：

- 空输入、发送中、接口错误、fallback 答复、长文本答复。

## 4. Mock 数据契约

Mock 数据层应通过前端 API 客户端暴露，页面只调用统一方法，不直接判断当前是 Mock 还是真实 API。

### 用户

```ts
type User = {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
};
```

### 科目

```ts
type Subject = {
  id: number;
  name: string;
  category: string;
  color: string;
  targetHours: number;
  createdAt?: string;
};
```

### 任务

```ts
type StudyTask = {
  id: number;
  subject: Subject;
  title: string;
  description?: string;
  taskDate: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  plannedMinutes: number;
  actualMinutes: number;
  completedAt?: string | null;
  createdAt?: string;
};
```

### 看板

```ts
type DashboardSummary = {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  plannedMinutes: number;
  actualMinutes: number;
  subjects: Array<{
    subjectId: number;
    subjectName: string;
    color: string;
    totalTasks: number;
    completedTasks: number;
    plannedMinutes: number;
    actualMinutes: number;
  }>;
  days: Array<{
    date: string;
    totalTasks: number;
    completedTasks: number;
    actualMinutes: number;
  }>;
};
```

### AI

```ts
type AiChatResponse = {
  answer: string;
  fallback: boolean;
};
```

## 5. 后端后补清单

后端阶段只补接口和服务能力，不规划单独的后台管理页面。

接口范围：

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/subjects`
- `GET/POST/PUT/DELETE /api/tasks`
- `PATCH /api/tasks/{id}/status`
- `POST /api/tasks/generate`
- `GET /api/dashboard/summary`
- `POST /api/ai/chat`

后端能力：

- JWT 登录认证和过期处理。
- 用户数据隔离。
- MySQL 持久化。
- 统一异常响应。
- DeepSeek 可配置接入。
- DeepSeek 未配置或不可用时返回 fallback。

## 6. 验收标准

### 文档验收

- 本文档明确阶段、页面、Mock 契约、后端后补范围和验收标准。
- README 只保留项目说明、结构和启动入口，不承载详细阶段计划。

### 前端阶段验收

- 不启动后端即可完成主要页面浏览。
- 登录、科目、任务、看板、AI 问答流程均可用 Mock 数据演示。
- 页面状态完整，不出现明显空白、死按钮或无解释错误。
- Mock 数据结构与后续 API 返回结构一致或高度接近。

### 后端阶段验收

- 真实 API 替换 Mock 后，前端组件不需要重写。
- 注册登录、科目、任务、看板、AI fallback 行为保持一致。
- 后端测试覆盖认证、用户隔离、任务状态、看板统计和 AI fallback。

## 7. 执行约束

- 任何会增加 `C:\Users\ZZD` 缓存的操作，例如 `npm install`、`npm run build`、`mvn test`、Maven 依赖下载、前端依赖下载，执行前必须先列出预计 C 盘增量并等待确认。
- 不删除用户数据。
- 重大修改前先说明影响范围和风险。
- 如果后续使用 Git 提交，commit 信息必须使用中文。
