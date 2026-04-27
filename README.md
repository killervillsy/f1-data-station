# F1 Data Station 🏎️

一个基于 Next.js 16 的 Formula 1 数据站，提供实时赛事数据、积分榜、赛程安排和车手/车队信息。

## 功能特性

- 📊 **积分榜** - 车手积分榜和车队积分榜实时更新
- 📅 **赛程表** - 当前赛季完整赛程安排
- 🏁 **比赛成绩** - 每站比赛的详细成绩和排名
- 👨‍✈️ **车手信息** - 所有车手的详细资料
- 🏎️ **车队信息** - 所有车队的详细资料
- 📡 **实时数据** - 实时比赛追踪（模拟数据）

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据源**: [Ergast F1 API](https://ergast.com/mrd/)
- **日期处理**: date-fns

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页
│   ├── schedule/          # 赛程页
│   ├── standings/         # 积分榜页
│   ├── drivers/           # 车手页
│   ├── constructors/      # 车队页
│   ├── race/              # 比赛详情页
│   └── live/              # 实时数据页
├── components/            # React 组件
│   ├── Header.tsx         # 顶部导航
│   └── Footer.tsx         # 底部信息
├── lib/                   # 工具函数
│   └── f1-api.ts          # F1 API 封装
└── types/                 # TypeScript 类型定义
    └── f1.ts              # F1 数据类型
```

## 页面说明

### 首页 (`/`)
- 下一场比赛倒计时和信息
- 上站比赛成绩摘要（前10名）
- 车手/车队积分榜前五名

### 赛程页 (`/schedule`)
- 当前赛季完整赛程列表
- 已完成/即将进行的比赛分类
- 跳转到比赛详情

### 积分榜 (`/standings`)
- 完整车手积分榜（排名、胜场、积分）
- 完整车队积分榜（排名、胜场、积分）

### 车手页 (`/drivers`)
- 所有车手卡片网格展示
- 车手详情页（个人信息、积分统计）

### 车队页 (`/constructors`)
- 所有车队列表展示
- 车队详情页（团队信息、积分统计）

### 比赛详情 (`/race/[season]/[round]`)
- 比赛基本信息（赛道、日期、圈数）
- 完整正赛成绩表
- 最快圈速信息

### 实时数据 (`/live`)
- 模拟实时比赛追踪
- 实时排名更新
- 圈速信息

## API 使用

应用使用 Ergast API 获取数据：

```typescript
// 获取当前赛季赛程
GET https://ergast.com/api/f1/current.json

// 获取车手积分榜
GET https://ergast.com/api/f1/current/driverStandings.json

// 获取比赛成绩
GET https://ergast.com/api/f1/{season}/{round}/results.json
```

## 开发说明

- 所有页面使用服务端渲染 (SSR)
- API 请求带有 5 分钟缓存 (`revalidate: 300`)
- 支持响应式设计，适配移动端
- 使用 Tailwind CSS 进行样式管理
- TypeScript 类型安全

## 部署

### Vercel（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### Docker

```bash
# 构建镜像
docker build -t f1-data-station .

# 运行容器
docker run -p 3000:3000 f1-data-station
```

## 致谢

- 数据来源: [Ergast Developer API](https://ergast.com/mrd/)

## License

MIT
