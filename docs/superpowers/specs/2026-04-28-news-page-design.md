# 资讯页面设计

## 目标

为 F1.Data 增加「资讯」tab，让用户在站内查看 Formula 1 相关新闻摘要，并通过外链跳转到原文。

## 范围

- 导航栏新增「资讯」入口，路径为 `/news`。
- 新增 `/news` 页面，展示资讯标题、来源、发布时间、摘要和阅读原文链接。
- 新增 `/api/news` Route Handler 作为 NewsAPI.org 中转层。
- 使用环境变量 `NEWS_API_KEY` 配置 NewsAPI.org key。
- 首版不做搜索、分页、收藏、详情页或中文翻译。

## 架构

### `/api/news`

- 运行在服务端，读取 `process.env.NEWS_API_KEY`。
- 请求 NewsAPI.org 的 everything 搜索接口。
- 查询关键词使用 `("Formula 1" OR F1) AND racing`。
- 排序使用发布时间优先。
- 将外部返回规整为本站统一文章结构：
  - `title`
  - `description`
  - `url`
  - `source`
  - `publishedAt`
  - `imageUrl`
- API key 缺失、上游失败或返回异常时，返回稳定的 JSON 错误结构。

### `/news`

- 页面从本站 `/api/news` 获取资讯数据。
- 顶部展示中文标题和说明，正文使用响应式卡片网格。
- 文章卡片展示来源、时间、标题、摘要和「阅读原文」外链。
- 外链使用新标签页打开，并设置 `rel="noreferrer"`。

### 导航

- `src/components/Header.tsx` 的导航列表增加 `{ href: "/news", label: "资讯" }`。
- 使用现有 `isActivePath` 逻辑高亮 `/news` 及其子路径。

## 状态处理

- `NEWS_API_KEY` 未配置：页面显示中文提示，说明需要配置资讯 API key。
- 上游请求失败：页面显示中文错误状态，保留页面结构。
- 没有文章：页面显示「暂无资讯」空状态。
- 单篇文章缺少摘要或图片：卡片仍可渲染，省略缺失字段。

## 视觉方向

延续现有 F1.Data 风格：深浅主题变量、红色强调、圆角卡片、边框和 hover 状态。资讯页不引入全新的视觉系统，重点是与现有首页、赛程、积分榜保持一致。

## 测试与验证

- 使用单元或集成测试覆盖 NewsAPI 响应规整逻辑，至少包含正常文章、缺少字段和错误响应。
- 运行 lint。
- 启动本地页面并验证：导航出现「资讯」、页面能加载、文章卡片或错误状态能正确显示。
