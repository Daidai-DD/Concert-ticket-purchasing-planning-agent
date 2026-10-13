# ENCORE · 全球演唱会规划智能体

ENCORE 是一个面向跨城市、跨国家观演场景的规划网页。用户可以用自然语言描述想看的演出，系统结合演出场次、票档、交通和酒店生成可调整方案，并在浏览器本地保存任务与设置。

当前版本用于产品验证。大模型、百度地图和 Ticketmaster 可通过环境变量接入；未配置或数据不可用时，部分页面会显示 Mock 数据或明确的降级状态。票价、交通、酒店和路线信息不构成真实预订或导航建议。

## 当前功能

- 自然语言对话与方案生成，支持通义千问和智谱模型。
- 场次、票档、行程、酒店四张联动卡片，以及替换、调整、锁定和预算计算。
- 演出筛选、艺人搜索、城市联动和百度地图标记。
- Ticketmaster Discovery API 场次接入与 Mock 场次降级。
- 场馆分区 3D/2D 预览、票档切换和区域选择。
- 本地任务、提示、用户设置、中英文核心界面及币种估算换算。
- 响应式桌面/手机布局和 PWA 基础离线外壳。

## 技术栈

- React 19、TypeScript
- Vinext、Vite、Next.js 兼容路由
- Tailwind CSS 4、shadcn/ui
- Zod、Drizzle ORM
- Cloudflare Workers/Wrangler 运行适配
- 百度地图 JavaScript API GL
- 通义千问、智谱、Ticketmaster Discovery API

## 本地运行

需要 Node.js `>= 22.13.0`。

```bash
npm ci
copy .dev.vars.example .dev.vars
npm run dev
```

浏览器打开 `http://localhost:5173/`。在 PowerShell、macOS 或 Linux 中，也可以用对应系统的复制命令创建 `.dev.vars`。

生产构建与完整发布前检查：

```bash
npm run build
npm run check
```

可单独运行：

```bash
npm run typecheck
npm run lint
npm test
```

## 环境变量

复制 `.dev.vars.example` 为 `.dev.vars`，再填写需要启用的服务。`.env.example` 提供相同的变量清单，便于其他部署平台识别。两个示例文件都不包含真实密钥。

| 变量 | 用途 | 必需 |
| --- | --- | --- |
| `QWEN_API_KEY` | 通义千问 API 密钥 | 启用千问时 |
| `QWEN_MODEL` | 千问模型 ID，例如 `qwen3.7-flash` | 启用千问时 |
| `QWEN_BASE_URL` | 百炼 OpenAI 兼容接口地址 | 启用千问时 |
| `ZHIPU_API_KEY` | 智谱 API 密钥 | 启用智谱时 |
| `ZHIPU_MODEL` | 智谱模型 ID，例如 `glm-4.7-flash` | 启用智谱时 |
| `BAIDU_MAP_AK` | 百度地图 JavaScript API 浏览器端 AK | 显示真实底图时 |
| `TICKETMASTER_API_KEY` | Ticketmaster Discovery API Consumer Key | 获取真实场次时 |

密钥只应写入本地 `.dev.vars` 或部署平台的加密环境变量。不要把密钥放进 `NEXT_PUBLIC_*`、`VITE_*` 变量或前端源码。百度地图浏览器端 AK 会出现在浏览器请求中，应在百度控制台设置严格的 Referer 白名单。

## 主要目录

```text
app/                 页面、布局和服务端 API 路由
features/            首页、演出、任务、提示、设置、地图和场馆模块
components/          通用 UI 与方案卡片
domain/              方案、预算、任务与设置领域规则
providers/           Provider 契约、Mock 数据、目录和路线实现
services/            大模型、Ticketmaster 与 Agent 服务
storage/             浏览器本地持久化逻辑
public/              PWA manifest、Service Worker、图标和离线页
scripts/             构建、安装和领域回归检查
```

Mock 演出、城市、艺人、票档与场馆结构主要位于 `providers/catalog.ts` 和 `providers/mock.ts`，Mock 路线位于 `providers/maps.ts`。

## 本地数据

任务、提示和设置保存在浏览器 `localStorage` 的 `encore.workspace.v2` 中。清除站点数据会删除这些内容，目前没有云端同步或备份。

## 产品展示

<img width="2864" height="1656" alt="image" src="https://github.com/user-attachments/assets/5528f495-6621-46b5-be95-8e8c9f643c1a" />
<img width="2864" height="1656" alt="image" src="https://github.com/user-attachments/assets/f727deeb-d8c8-483d-96b6-6e6579bcedbb" />
<img width="2832" height="1656" alt="image" src="https://github.com/user-attachments/assets/6b854c92-483e-4d52-8f78-508d56d3f4d7" />

## 已知限制

- Ticketmaster 覆盖范围和字段完整度取决于其开放数据；不可用时使用明确标注的演示数据。
- 大模型当前为非流式回复，并受服务商额度、地域和网络状态影响；公开服务仍需增加用户鉴权、限流和用量控制。
- 百度地图负责底图和城市标记，真实 POI、交通路线和实时导航尚未接入；页面中的路线为 Mock 数据。
- 票档、酒店、交通价格和汇率为演示估算，不支持购买、预订、支付或抢票。
- 场馆 3D 是结构化分区原型，不代表真实座位、距离或视线。
- 离线模式只能打开应用外壳并读取已保存在当前浏览器中的数据，不能生成新方案或查询在线数据。

## 发布前安全说明

`.gitignore` 已排除 `.env*`、`.dev.vars*`、依赖、缓存、日志、构建产物、Wrangler 状态和本地工具目录，同时仅允许提交 `.env.example` 与 `.dev.vars.example`。提交到 GitHub 前仍应检查 `git status`，确认没有手动强制加入过任何密钥文件。
