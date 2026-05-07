# F1 Data Station

一个基于 Next.js 16 的 Formula 1 数据站，提供赛事数据、积分榜、赛程安排、车手/车队信息、F1 资讯和实时计时数据。

## 功能特性

- **积分榜** - 车手积分榜和车队积分榜更新
- **赛程表** - 当前赛季完整赛程安排和比赛周末信息
- **比赛成绩** - 每站比赛的正赛、排位赛和冲刺赛成绩
- **车手信息** - 当前赛季车手资料、积分统计和扩展信息
- **车队信息** - 当前赛季车队资料、积分统计和扩展信息
- **F1 资讯** - 汇总 Formula 1 RSS，支持 NewsAPI 备用源
- **实时数据** - 基于 F1 live timing static / OpenF1 的实时或近实时排名、圈速与遥测数据

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据源**:
  - Jolpica Ergast-compatible API：赛程、积分榜、比赛结果等
  - OpenF1 API：实时/近实时会话与车手数据
  - Formula 1 live timing static：官方实时计时静态数据
  - Formula 1 RSS：资讯默认来源
  - NewsAPI：可选备用资讯源
- **日期处理**: date-fns

## 环境要求

- Node.js 20+
- npm（仓库包含 `package-lock.json`，推荐使用 `npm ci`）

## 环境变量

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `NEWS_API_KEY` | 否 | NewsAPI.org API key。应用默认优先使用 Formula 1 RSS；当 RSS 不可用时，可使用该 key 作为备用资讯源。 |
| `NEXT_PUBLIC_SITE_URL` | 否 | 站点公开 URL，用于 SEO metadata 的 canonical / Open Graph 基础地址；未配置时本地构建使用 `http://localhost:3000`。 |

本地开发可创建 `.env.local`：

```bash
NEWS_API_KEY=your_newsapi_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 快速开始

### 安装依赖

```bash
npm ci
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 代码检查与测试

```bash
npm run lint
npm test
npm run test:news
```

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面与 Route Handlers
│   ├── page.tsx            # 首页
│   ├── schedule/           # 赛程页
│   ├── standings/          # 积分榜页
│   ├── drivers/            # 车手列表与详情页
│   ├── constructors/       # 车队列表与详情页
│   ├── race/               # 比赛详情页
│   ├── live/               # 实时数据页
│   ├── news/               # F1 资讯页
│   └── api/                # /api/live、/api/news
├── components/             # React 共享组件
├── lib/                    # 数据获取、翻译、资料映射和工具函数
│   ├── f1-api.ts           # Jolpica Ergast-compatible API 封装
│   ├── f1-live-timing-api.ts # F1 live timing / OpenF1 实时数据封装
│   ├── news-api.ts         # RSS / NewsAPI 资讯封装
│   └── openf1-api.ts       # OpenF1 数据封装
└── types/                  # TypeScript 类型定义
```

## 页面说明

### 首页 (`/`)
- 下一场比赛倒计时和信息
- 上站比赛成绩摘要
- 车手/车队积分榜摘要

### 赛程页 (`/schedule`)
- 当前赛季完整赛程列表
- 已完成/今日/即将进行的比赛分类
- 跳转到比赛详情

### 积分榜 (`/standings`)
- 完整车手积分榜（排名、胜场、积分）
- 完整车队积分榜（排名、胜场、积分）

### 车手页 (`/drivers`)
- 所有车手卡片网格展示
- 车手详情页（个人信息、积分统计、扩展资料）

### 车队页 (`/constructors`)
- 所有车队列表展示
- 车队详情页（团队信息、积分统计、扩展资料）

### 比赛详情 (`/race/[season]/[round]`)
- 比赛基本信息（赛道、日期、场次）
- 正赛、排位赛、冲刺赛结果
- 上一站/下一站导航

### 实时数据 (`/live`)
- 实时或近实时排名
- 圈速与比赛状态
- 车手遥测信息

### F1 资讯 (`/news`)
- Formula 1 RSS 资讯
- NewsAPI 备用资讯源

## API 与缓存说明

应用主要通过服务端函数和 Route Handlers 获取数据：

- `src/lib/f1-api.ts`：Jolpica Ergast-compatible API，使用 Next.js `fetch` 缓存按数据类型设置 `revalidate`。
- `src/lib/f1-live-timing-api.ts`：F1 live timing static 与 OpenF1 实时数据。
- `src/app/api/live/route.ts`：实时数据接口，使用短时间内存 Promise cache 合并请求，并返回 `Cache-Control: no-store, max-age=0`。
- `src/app/api/news/route.ts`：资讯接口，优先 RSS，必要时回退到 NewsAPI。

## 开发说明

- 使用 Next.js App Router 和 Server Components。
- 数据请求按数据类型设置缓存策略，实时数据使用更短刷新窗口。
- 支持响应式设计，适配移动端和桌面端。
- 使用 Tailwind CSS 进行样式管理。
- TypeScript 类型安全。

## 部署

### Vercel（推荐）

Vercel 会自动识别 Next.js 项目。建议配置：

- Install Command: `npm ci`
- Build Command: `npm run build`
- Node.js: 20+
- Environment Variables:
  - `NEWS_API_KEY`（可选）
  - `NEXT_PUBLIC_SITE_URL`（建议生产环境配置为真实站点地址）

也可以使用 Vercel CLI：

```bash
npm i -g vercel
vercel
```

### 自托管 Node.js

```bash
npm ci
npm run build
npm start
```

当前仓库未提供 Dockerfile，因此不包含可直接执行的 Docker 部署命令。如需 Docker 部署，请先补充 Dockerfile、`.dockerignore` 和对应运行环境变量说明。

## 致谢

- Jolpica Ergast-compatible API
- OpenF1
- Formula 1 live timing static
- Formula 1 RSS
- NewsAPI.org

## License

MIT
