# ChanCMS 内容管理系统

ChanCMS 是一款基于 **Node.js (Express 5)**、**MySQL/SQLite**、**Vue 3** 研发的高质量实用型 CMS 系统。轻量、灵活、稳定、高性能、易扩展，让开发更简单。

> 🌟 开发友好，推崇 JS 优先。适合全栈开发者，独立而高效、优雅的代码、极致的性能、稳定的生产实践，灵活强大。

---

## ✨ 系统特色

- **自研框架** — 基于 [ChanJS](https://www.npmjs.com/package/chanjs) 轻量级 MVC 框架，遵循约定优于配置理念，支持多实例、模块化、插件化
- **SEO 优化** — 静/动态 URL 灵活切换、拼音导航、自定义 TDK，提升搜索引擎友好度
- **安全可靠** — Knex.js 参数化查询防 SQL 注入、接口权限校验、XSS 防护、bcrypt 密码加密、JWT 身份认证、请求频率限制
- **灵活配置** — 系统配置在线管理，无需重启；碎片功能支持零碎文案动态配置
- **高扩展性** — 扩展模型 + 动态字段，可自动生成数据表，满足各类定制化需求
- **模块化设计** — 各业务模块相互独立，按需加载，易于维护和升级
- **无头 CMS** — 为多端（微信小程序、App、H5）提供标准化 RESTful API 接口
- **双编辑器** — 内置富文本（TinyMCE）和 Markdown 双编辑器，满足不同内容创作需求
- **多语言** — 内置 i18n 国际化支持，轻松搭建多语言网站
- **会员系统** — 完整的会员注册登录、社交登录（微信）、会员中心、收藏评论、浏览历史
- **内容采集** — 自定义采集规则，快速聚合内容
- **多模板引擎** — 基于 art-template 模板引擎，支持多模板切换，轻松更换网站皮肤

---

## 🚧 功能介绍

### 系统管理（Base）
| 功能 | 说明 |
|------|------|
| 用户管理 | 系统用户创建、权限分配 |
| 角色管理 | 角色配置、菜单与按钮权限 |
| 菜单管理 | 系统菜单树、功能导航 |
| 系统配置 | 参数配置（邮箱/微信/上传等），在线修改即时生效 |
| 系统公告 | 公告发布、通知管理 |
| 操作日志 | 用户操作记录、登录审计、IP 地理信息 |

### 内容管理（CMS）
| 功能 | 说明 |
|------|------|
| 站点管理 | 网站信息、SEO 配置、模板切换、多站点 |
| 栏目管理 | 无限级分类、拼音路径、导航管理 |
| 文章管理 | 文章发布/编辑（富文本 & Markdown）、属性设置、缩略图 |
| 标签管理 | 标签分类、标签统计 |
| 轮播图管理 | 多组轮播图配置 |
| 碎片管理 | 广告、文案、公司信息等零碎内容 |
| 友情链接 | 外部链接分类管理 |
| 在线留言 | 访客留言、回复管理 |

### 扩展功能（Plus）
| 功能 | 说明 |
|------|------|
| 扩展模型 | 自定义模型、动态表单生成 |
| 扩展字段 | 字段配置、类型设置（文本/图片/富文本等） |
| 文章采集 | 规则配置、定时自动采集 |
| 模板编辑 | 在线修改模板文件 |
| OSS 管理 | 上传资源管理，支持图片、视频、压缩包等 |

### 会员系统（Member）
| 功能 | 说明 |
|------|------|
| 注册登录 | 邮箱注册、账号密码登录、验证码 |
| 社交登录 | 微信扫码登录、微信公众号授权 |
| 会员中心 | 个人信息管理、密码修改、头像上传 |
| 收藏功能 | 文章收藏、收藏管理 |
| 评论功能 | 文章评论、评论管理 |
| 浏览历史 | 用户浏览记录 |

### 其他模块
| 模块 | 功能 |
|------|------|
| **Proxy** | 代理客户端，用于前后端分离部署代理 |
| **WeChat** | 微信授权登录、扫码登录、分享 JS-SDK |
| **OSS** | 文件上传（本地/七牛云/阿里云 OSS/腾讯云 COS） |
| **VIP** | 代码高亮文件生成 |
| **Book** | 电子书模块（分类、书籍、章节管理） |

---

## ⛱️ 软件环境

- **Node.js** v22.18.0+
- **npm** v10+
- **MySQL** v5.7.26+（也支持 SQLite，用于开发/测试）

---

## 🛠 技术栈

### 后端核心技术

| 技术 | 版本 | 说明 |
|------|------|------|
| **Node.js** | v22.18.0+ | JavaScript 运行时 |
| **ChanJS** | ^2.7.10 | 自研轻量级 MVC 框架（基于 Express 5） |
| **Express** | 5.x | Web 框架（ChanJS 内置） |
| **Knex.js** | ^3.2.10 | SQL 查询构建器（ChanJS 内置） |
| **MySQL2** | ^3.22.3 | MySQL 数据库驱动 |
| **art-template** | ^4.13.4 | 服务端模板引擎 |
| **Pino** | ^9.x | 高性能结构化日志 |
| **Zod** | ^4.4.3 | Schema 校验，保障数据安全 |
| **JWT** | ^9.0.2 | JSON Web Token 身份认证 |
| **Bcrypt** | ^6.0.0 | 密码加密 |
| **Node-Cron** | ^3.0.3 | 定时任务调度 |
| **i18next** | ^24.2.3 | 国际化支持 |
| **Nodemailer** | ^7.0.6 | 邮件发送 |
| **XSS** | ^1.0.15 | XSS 攻击防护 |
| **svg-captcha** | ^1.4.0 | 图形验证码 |
| **Multer** | ^2.0.2 | 文件上传处理 |
| **IP2Region** | ^2.3.0 | IP 地理定位 |
| **DayJS** | ^1.11.13 | 轻量级日期处理 |

### 云存储支持

| 服务 | SDK |
|------|-----|
| 七牛云 | `qiniu` ^7.14.0 |
| 阿里云 OSS | `ali-oss` ^6.23.0 |
| 腾讯云 COS | `cos-nodejs-sdk-v5` ^2.14.6 |

### 前端技术

| 技术 | 说明 |
|------|------|
| **Vue 3** | 后台管理界面（独立项目：ChanCMS-admin-vip） |
| **Element Plus** | 后台 UI 组件库 |
| **TailwindCSS** | 前台模板样式框架 |
| **TinySlider2 / Swiper** | 轮播组件 |
| **Lucide** | 图标库 |

---

## 📁 项目架构

```
chanCMS-vip/
├── app.js                 # 应用入口
├── package.json           # 项目配置
├── .env.dev               # 开发环境变量
├── .env.prd               # 生产环境变量
├── app/
│   ├── common/            # 公共业务逻辑（分页、文件上传、数据解析等）
│   ├── helper/            # 工具函数
│   ├── middleware/         # 全局中间件
│   ├── modules/           # 业务模块（MVC）
│   │   ├── base/          # 系统管理模块
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── middleware/
│   │   │   ├── validator/
│   │   │   └── router.js
│   │   ├── cms/           # 内容管理模块
│   │   ├── member/        # 会员模块
│   │   ├── web/           # 网站前台模块
│   │   ├── oss/           # 文件存储模块
│   │   ├── proxy/         # 代理模块
│   │   ├── wechat/        # 微信模块
│   │   ├── book/          # 电子书模块
│   │   └── vip/           # VIP 功能模块
│   └── plugin/            # 插件目录（可选）
├── view/                  # 模板文件
│   ├── default/           # 默认模板
│   ├── blince/            # 企业官网模板（液压行业）
│   ├── daily/             # 日报类模板
│   └── hdg/               # 传统文化类模板
├── config/                # 框架配置
├── public/                # 静态资源
│   ├── admin/             # 后台管理 SPA 构建产物
│   ├── member/            # 会员中心 SPA 构建产物
│   └── uploads/           # 上传文件
└── data/
    └── init.sql           # 数据库初始化脚本
```

### 模块 MVC 结构

每个业务模块遵循统一模式：

```
module/
├── controller/    # 控制器 - 请求处理
├── service/       # 服务层 - 业务逻辑
├── model/         # 数据模型（可选）
├── middleware/    # 模块中间件（可选）
├── validator/     # 请求校验（可选）
└── router.js     # 路由配置
```

---

## 🧩 ChanJS 框架简介

ChanJS 是 ChanCMS 的底层框架，基于 Express 5 纯 JS 研发，提供以下核心能力：

| 能力 | 说明 |
|------|------|
| **Chan 应用类** | 多实例支持，持有独立配置、数据库连接、路径注册表 |
| **Controller / Service / Repository** | 经典三层架构，自动注入 app 实例 |
| **Knex 数据库** | 内置 Knex 查询构建器，支持 MySQL / SQLite |
| **art-template 模板** | 服务端渲染模板引擎 |
| **Pino 日志** | 高性能结构化日志，支持多级别、HTTP 请求日志 |
| **Zod 校验** | `validate` / `validateAll` 中间件，请求参数校验 |
| **JWT 认证** | token 签发、验证、吊销 |
| **频率限制** | `createRateLimitMiddleware` 接口限流 |
| **XSS 防护** | `filterXSS` 富文本安全过滤 |
| **错误体系** | 13 种业务错误类（AuthError / NotFoundError / ValidationError 等） |
| **统一响应** | `success` / `fail` 统一响应格式，标准化业务状态码 |
| **事件总线** | `EventBus` 发布订阅，支持模块间解耦 |
| **定时任务** | `Task` 基于 cron 的定时任务调度 |
| **国际化** | `initLang` i18n 多语言支持 |
| **缓存** | 内存缓存 / Redis 缓存（可选） |
| **路径安全** | 内置路径穿越防护，白名单目录校验 |

---

## ⚡ 快速开始

### 1. 克隆项目

```bash
git clone https://gitee.com/chancms/ChanCMS.git
cd ChanCMS
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置数据库

编辑 `.env.dev` 文件，配置数据库连接信息：

```env
DB_USER=root
DB_PASS=your_password
DB_DATABASE=chancms
DB_HOST=localhost
DB_PORT=3306
```

然后导入初始化 SQL：

```bash
mysql -u root -p < data/init.sql
```

### 4. 启动开发服务

```bash
npm run dev
```

服务将运行在 `http://localhost:3000`

### 5. 访问后台

- 后台地址：`http://localhost:3000/admin`
- 默认账号：`chancms`
- 默认密码：`chancms.top`

---

## 📦 项目脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式（热重载，加载 `.env.dev`） |
| `npm run local:prd` | 本地生产模式测试（加载 `.env.prd`） |
| `npm run prd` | PM2 生产部署 |
| `npm run seed` | 数据填充脚本 |

---

## 👵 开发文档

- **官网**：<https://www.chancms.top>
- **开发文档**：<https://www.chancms.top/docs/index.html>
- **演示站**：<https://vip.chancms.top>
- **视频教程**：<https://space.bilibili.com/1885628820>

---

## 🗂 相关项目

| 项目 | 说明 | 仓库 |
|------|------|------|
| **ChanCMS-admin-vip** | 后台管理前端（Vue 3 + Element Plus） | [Gitee](https://gitee.com/chancms/ChanCMS-admin-vip) |
| **ChanCMS-user-vip** | 会员中心前端（Vue 3） | [Gitee](https://gitee.com/chancms/ChanCMS-user-vip) |
| **ChanJS** | 底层 MVC 框架 | [Gitee](https://gitee.com/chancms/Chanjs) · [npm](https://www.npmjs.com/package/chanjs) |

---

## 💻 案例展示

- [南充市顺庆区妇幼保健院](https://www.sqqfy.cn)
- [国际科技创新中心](https://cms.gongxudj.com)
- [福建华膜](https://www.huamocj.com)
- [广东数智云科](http://ifckj.com)
- [前行者 EWEADN](https://www.eweadn.cn)
- [北京辉达科技](http://www.huidaep.com)
- [北京诺丰科技](http://www.novontrade.com)
- [北京智慧城市供需对接平台](https://gongxudj.com)
- [上海昂翊信息](http://www.angyi-iot.com)
- [广东天波股份](https://sec.telpo.cn)
- [广东 HANSA 中国](http://www.hansa-asia.com)
- [萌狮换电](http://www.51mshd.com)
- [南京玄武中等专业学校](http://xxtyxy.aiwx.org.cn)
- [武汉微科智汇](http://www.whwkzh.cn)
- [浙江金卡实业](http://zjjksy.com)
- [浙江华宇科技](http://www.kinka.net.cn)
- [西安圣豆电子](https://www.sundaytek.com)
- [石家庄诺德房产](https://www.nuodefangchan.com)
- [山西蝌蚪云](https://kd-yun.top)
- [海南省海洋经济发展与资源保护研究院](https://hnimer.org.cn)
- [粤港澳大湾区教育创新协会](https://hk.bossyun.com)
- [香港日报](http://www.hongkongdaily.net)
- [国际健康健美长寿论坛](http://www.internationjms.cn)
- [世界大健康运动联盟](http://www.worldhealthgames.com)
- [世界气功网](http://www.shijieqigong.com)
- [香港大湾区](https://hk.bossyun.com)
- [七弈国象](https://doc.7yi.link)
- [有道 IT 官网](http://www.wmjtyd.net)

---

## ❤️ 项目关注

- **Gitee**：<https://gitee.com/chancms/ChanCMS>（实时更新）
- **GitHub**：<https://github.com/chancms/ChanCMS>（备份更新）

如果喜欢我们的项目，请点个 Star ⭐

---

## 👴 项目交流

微信群交流请联系微信：`yanyutao2014`

纯技术交流，广告党勿扰，谢谢合作！

---

## 管理后台截图

![login.png](https://pic1.imgdb.cn/item/69a94658a1838fcbddfc776d.png)
![dashboard.png](https://pic1.imgdb.cn/item/69a94657a1838fcbddfc776b.png)
![siteinfo.png](https://pic1.imgdb.cn/item/69a946c8a1838fcbddfc7798.png)
![category.png](https://pic1.imgdb.cn/item/69a94656a1838fcbddfc7768.png)
![article.png](https://pic1.imgdb.cn/item/69a94657a1838fcbddfc776a.png)
![menu.png](https://pic1.imgdb.cn/item/69a94657a1838fcbddfc7769.png)
![oss.png](https://pic1.imgdb.cn/item/69a94655a1838fcbddfc7767.png)
![template.png](https://pic1.imgdb.cn/item/69a946c8a1838fcbddfc776a.png)
![use.png](https://pic1.imgdb.cn/item/69a946c8a1838fcbddfc7799.png)

---

## 许可证

本项目采用 [Apache License 2.0](LICENSE) 许可证。

## 警告

- 禁止用于任何非法商业用途或其他任何违法或不道德的行为。
- 不当使用本项目中的代码或资源而导致的任何直接或间接损失，项目维护者及贡献者概不负责。
- 请尊重法律和道德规范，合理合法地使用本项目的资源。