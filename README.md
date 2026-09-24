# ENCORE · 全球演唱会规划智能体 V0.4

在现有功能上完成信息减法、百度地图与 Ticketmaster Discovery API 接入。对话默认使用通义千问并保留智谱切换；Ticketmaster 提供可用市场的真实演出场次，票档、交通、酒店和路线仍为 Mock，不支持真实预订。

## V0.4 精简界面与百度地图

- 首页初始状态只保留“下一站，想要去哪？”与 Agent 输入框。
- 页面移除眉题、说明段落、示例入口和重复提示，保留操作、数据、空状态及错误反馈。
- 背景、面板和卡片改用更高对比度；按钮统一使用更明显的液态磨砂高光、边缘和按压反馈。
- 演出页使用百度地图 JavaScript API GL 加载真实底图、缩放和演出城市标记；点击标记继续驱动场次筛选。
- 百度浏览器端 AK 由服务端配置接口提供给地图 SDK，并依赖百度控制台 Referer 白名单限制来源。AK 不写入仓库，但浏览器端地图 AK 本身会在网络请求中可见。

## V0.3 视觉与交互升级

- 建立独立的 `app/v03.css` 视觉层，统一奶油白、雾粉、浅紫和暖橙色彩，以及圆角、玻璃材质、阴影、间距、动效时长和缓动变量。V0.2 样式和业务组件均保留，便于后续继续迭代。
- 首页改为柔和渐变空间背景、悬浮任务输入条和叠放艺人卡片；焦点、Hover、Active、Disabled 均有可见反馈。
- Agent 工作台增加在线状态、消息层级和“查找演出 → 匹配交通 → 筛选酒店 → 生成行程”的阶段式反馈；手机端生成方案后，输入条固定在底部导航上方。
- 四张方案卡片使用场次、票档、行程票据和酒店四种不同层级与轮廓，保留替换、调整、锁定、预算和场馆入口。
- 演出页使用真实百度底图；城市标记和场次筛选联动，地图不可用时显示重试状态。
- 场次、任务、提示、设置、路线和场馆弹窗使用统一视觉语言；路线折线具备生成动画，场馆分区保留旋转、缩放、选择和 2D 降级。
- 桌面、平板、390px / 375px 手机宽度重新排版；移动端使用底部导航、单列卡片和安全区，修复横向溢出。支持 `prefers-reduced-motion`。

## 运行与验证

需要 Node.js >= 22.13。现有 React 19 / TypeScript / Vinext / Vite 项目，无重新初始化。

```sh
npm ci
npm run dev
# http://localhost:5173
npm run build
node node_modules/typescript/bin/tsc --noEmit
node scripts/check-domain.mjs
```

若 Windows npm 启动器路径异常，依赖安装后可使用 `node scripts/run-framework.mjs dev` / `node scripts/run-framework.mjs build`。

## 本轮新增

- 演出：9 座演示城市、3 位演示艺人、27 条场次；地区 / 城市 / 日期 / 艺人筛选、数量、空结果、加载 / 故障 / 重试。城市预览与列表联动；选场次回填主页，补问预算后保持所选日期。
- 地图：百度地图提供真实在线底图、缩放与城市标记；场次数据仍明确标为演示数据。
- 路线：主页“路线预览”读取当前场次、交通与酒店；展示到达点→酒店、酒店→场馆、散场→酒店、酒店→到达点，支持步行 / 公交 / 驾车、模拟里程 / 耗时 / 换乘、折线和地点聚焦。Mock 路线不是导航建议。
- 任务：保存、详情、恢复完整方案与锁定状态、四种状态、标记完成、二次确认删除。继续调整后再次保存更新原 ID，不重复创建。只有主动保存的方案持久化，未保存的对话和修改刷新后丢失。
- 提示：每个新任务生成五类明确标注的演示提醒；单条 / 全部已读、删除、确认清空、关联任务详情、未读数字。任务删除后原提示显示失效。
- 设置：中英文核心 UI、所在地、默认出发城市、CNY / USD / JPY、大陆 / 全球内容范围、3D 完整 / 简化 / 关闭、减少动效；独立持久化，确认恢复默认。默认语言按已保存选择、浏览器语言、英文顺序。
- 场馆：票档卡片打开结构化数据驱动的 CSS 3D 简化模型，舞台与分区有不同高度；按钮或拖动旋转、按钮缩放、分区点击、优先级切换、选中高亮、应用票档。失败或简化模式使用可操作的 2D 分区，关闭效果使用列表；锁定票档可比较但不可应用。
- 手机：底部导航、单列卡片、安全区、固定 Agent 输入、长弹窗内部滚动与关闭按钮；横屏低高度时输入改为文档流。

## 推荐体验链路

演出 → 东京 → LUNA PARK → 规划这场演出 → 发送 → 回答“预算6000元” → 生成 2026-10-24 方案 → 场馆3D → 选择分区 → 应用到票档 → 锁定 → 保存方案 → 刷新 → 我的任务 → 继续调整 → 更新任务。

也保留原始输入“我想从上海去东京看某位正在巡演的歌手，最好周末，总预算6000元”及艺人追问、组合调整、超预算与重新规划。

## 结构 / Mock 数据

- `domain/plan.ts`：领域方案、预算、锁定、日期联动规则。
- `domain/workspace.ts`：任务 / 提示 / 设置类型与 Zod 校验。
- `services/agent.ts`：可替换 AgentService，当前规则型 Agent，不调用 LLM。
- `providers/mock.ts`：可替换场次、票档、行程、酒店 Provider；按演出所在地选择大陆 / 全球。
- `providers/catalog.ts`：城市、演示艺人、演示演出目录、通知模板、汇率、场馆结构数据；未配置 Ticketmaster 时作为降级数据。
- `services/ticketmaster.ts` 与 `app/api/events/route.ts`：服务端调用 Ticketmaster Discovery API，并把场次、场馆及坐标转换为统一演出数据。
- `providers/contracts.ts`：Event / Ticket / Travel / Hotel / Map / Route Provider 契约。
- `features/maps/BaiduConcertMap.tsx`：百度浏览器 SDK 加载、地图实例、城市标记、选择联动和失败重试。
- `app/api/map-config/route.ts`：只向浏览器返回百度地图所需的浏览器端 AK；生产域名必须加入 Referer 白名单。
- `providers/maps.ts`：路线预览仍使用 Mock 地点 / 路线。
- `features/home/Planner.tsx`：保持原布局的主页与联动工作台。
- `features/events`、`tasks`、`notices`、`settings`：新增页面。
- `features/venue/VenueView.tsx`：独立场馆内部 CSS 3D / 2D，与城市地图分离，无 Three.js 或外部 CDN。
- `features/maps/RoutePreview.tsx`：路线查询、地点和文字降级。
- `features/workspace/WorkspaceContext.tsx`：共享状态与持久化协调。
- `i18n/core.ts`：核心 UI 中英文；演示地名、场馆描述及历史对话不全部翻译。
- `app/globals.css`：V0.1 / V0.2 基础样式。
- `app/v03.css`：V0.3 设计变量、视觉覆盖、动效和响应式布局。

## 本地存储

localStorage key：`encore.workspace.v2`。结构：

```text
{ version: 2, revision, settings,
  tasks: [{ id, plan, messages, status, updatedAt }],
  notices: [{ id, taskId, kind, read, createdAt }] }
```

写入前校验结构；成功写入后更新界面，不在写入失败时假报保存成功。修订号检查可发现另一个页面的修改。读取失败保留原始数据，并展示“重新读取 / 重置本地数据”；重置需确认。浏览器清除站点数据会删除本地记录，无云端备份。UI 中金额按模拟汇率统一换算，领域模型和预算仍保存人民币。

## PWA 与离线

- `public/manifest.webmanifest`：名称、standalone、主题色、192 / 512 PNG 图标。
- `features/pwa/PwaStatus.tsx`：Service Worker 注册、在线状态、支持时的安装按钮；不支持安装事件时提示使用浏览器菜单。
- `public/sw.js`：仅缓存自包含离线外壳和本地静态资源。导航优先网络，无法访问服务或非成功响应时降级到 `offline.html`。不缓存开发模块、RSC 或私密网络请求。
- `public/offline.html`、`offline.js`、`offline.css`：无框架依赖的离线查看器。直接读取同源的已保存任务和设置，可展开任务详情；只读，联网后回到主应用调整。
- 需要先联网访问一次完成缓存安装。安装依赖支持 PWA 的浏览器与 HTTPS，localhost 可用于本机开发；手机直接访问电脑 HTTP 局域网地址通常不满足安全上下文要求。此轮未发布 HTTPS 站点，也未进行实体手机系统级安装。
- 已实际关闭本地服务器并刷新验证：Service Worker 返回离线外壳，任务和设置可读；随后恢复服务器。

## 检查和已知限制

- 构建、TypeScript、ESLint（无错误，Provider 占位参数仍有未使用警告）、原有及新增领域回归检查：包括日期回填、锁定、预算、任务更新、持久化、损坏数据、写入失败、修订冲突、场馆 / 路线故障、汇率换算。
- 浏览器检查：演出→生成→3D/2D选票→保存→刷新→恢复→更新同任务；提示跳转；英文及美元设置刷新后保留；手机 360 / 390 宽度与横屏检查。控制台运行错误复核。
- 演示日期只有 2026-10-17 / 24 / 31。1 人、2 天 1 晚，费用不含餐饮、签证及购物。汇率固定为 1 CNY = 0.14 USD = 20 JPY，不是实时汇率。
- 百度地图底图已经接入；真实 POI、交通路线查询和导航尚未接入，Mock 路线不可用于实际旅行。
- 场馆 CSS 3D 为分区验证用的低保真模型，无真实座位数据或视线保证；未做设备性能基准测试。
- 通知为保存任务时生成的演示记录，没有后台监控、推送或自动价格变更。
- 开发服务器热更新偶尔需要完整刷新；已验证重启后的正常访问。构建会输出 Vinext 路由静态分类提示，不阻断构建。

## 后续接入位置（本轮不实施）

后续真实路线接入应新增独立的百度 RouteProvider，并在服务端保存 Web 服务 AK；网页浏览器 AK 仅负责地图展示。未来移动 App 导航单独使用对应原生 SDK，不复用网页示意路线冒充导航。

参考：[百度地图 JavaScript API](https://lbsyun.baidu.com/docs/jsapi?title=193)、[MDN PWA 安装](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)。

## 大模型接入

主页通过服务端 `/api/agent` 调用通义千问 `qwen3.7-flash` 或智谱 `glm-4.7-flash`，携带最近对话、方案与锁定状态。设置页可切换模型并查看配置状态。失败显示错误与重试，不自动回退为规则回复。原规则 Agent 仅保留用于回归检查。

本地将 `.dev.vars.example` 复制为 `.dev.vars`。千问填写 `QWEN_API_KEY`、`QWEN_MODEL` 和创建密钥时显示的 `QWEN_BASE_URL`；智谱使用 `ZHIPU_API_KEY` 和 `ZHIPU_MODEL`；Ticketmaster 使用 Consumer Key 填写 `TICKETMASTER_API_KEY`。密钥仅在服务端读取，文件已被 Git 忽略，禁止放入前端环境变量。GET `/api/agent` 只返回各模型服务是否配置及模型名称，GET `/api/events` 返回标准化后的演出数据。

接入位置：`services/zhipu.ts`（模型调用）、`services/agent-contract.ts`（结构校验）、`services/agent-plan.ts`（目录校验、卡片锁定与费用计算）、`services/remote-agent.ts`（网页请求）。模型无联网检索能力，真实艺人可以讨论但不会套用虚构演示卡片。价格仅由 Provider 提供。

验证：类型检查、构建及 `node scripts/check-domain.mjs`（含千问路由、模型结构、锁定、错误与未配置检查）。当前非流式回复，45秒服务端超时。千问免费额度通常有地域与有效期限制，以阿里云百炼控制台为准。当前接口适用于本地体验；公开部署前必须增加用户鉴权、按用户限流与用量控制，目前的单进程并发限制不能替代这些措施。
