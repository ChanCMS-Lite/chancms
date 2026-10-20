/*
 Navicat Premium Dump SQL

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50723 (5.7.23)
 Source Host           : localhost:3306
 Source Schema         : chancms_lite

 Target Server Type    : MySQL
 Target Server Version : 50723 (5.7.23)
 File Encoding         : 65001

 Date: 08/10/2026 15:03:37
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for cms_article
-- ----------------------------
DROP TABLE IF EXISTS `cms_article`;
CREATE TABLE `cms_article` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cid` int(11) NOT NULL COMMENT '栏目id',
  `mid` int(11) DEFAULT NULL COMMENT '所属模型ID',
  `ext_data` json DEFAULT NULL COMMENT '扩展字段值（cms_field 渲染结果）',
  `subCid` varchar(255) DEFAULT NULL COMMENT '其它栏目id',
  `title` varchar(255) NOT NULL COMMENT '标题',
  `shortTitle` varchar(255) DEFAULT NULL COMMENT '短标题',
  `tagId` varchar(255) DEFAULT NULL COMMENT '标签id',
  `attr` varchar(255) DEFAULT NULL COMMENT '1头条 2推荐 3轮播 4热门',
  `articleView` varchar(100) DEFAULT NULL COMMENT '详情页模板',
  `source` varchar(255) DEFAULT NULL COMMENT '来源',
  `description` varchar(255) DEFAULT NULL COMMENT '文章简述',
  `img` varchar(255) DEFAULT NULL COMMENT '缩略图',
  `editorType` varchar(50) DEFAULT 'rich' COMMENT '编辑器类型: rich 富文本, md Markdown',
  `content` longtext NOT NULL COMMENT '文章内容',
  `status` tinyint(2) DEFAULT '0' COMMENT '0 发布 1 不发布',
  `pv` int(10) DEFAULT '0' COMMENT '浏览量',
  `link` varchar(255) DEFAULT NULL COMMENT '外链',
  `allowScript` tinyint(1) DEFAULT '0' COMMENT '1运行 0不允许执行js',
  `user_id` int(11) DEFAULT NULL COMMENT '发布者用户ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `code` json DEFAULT NULL COMMENT '扩展字段数据（模型自定义字段，存储 meta_data）',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `cid` (`cid`) USING BTREE,
  KEY `idx_user_id` (`user_id`),
  KEY `idx_article_title` (`title`),
  FULLTEXT KEY `ft_title` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='文章表';

-- ----------------------------
-- Records of cms_article
-- ----------------------------
BEGIN;
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (1, 11, 0, NULL, '', 'ChanCMS内容管理系统', '', '2,4,10', 'top', '', '', 'ChanCMS是一款基于Node、Express、MySQL、Vue3研发的高质量实用型CMS系统。轻量、灵活、稳定、高性能、易扩展，让开发更简单。', '', 'rich', '<p>ChanCMS是一款基于Node、Express、MySQL、Vue3研发的高质量实用型CMS系统。轻量、灵活、稳定、高性能、易扩展，让开发更简单。</p>\n<ul>\n<li>自研。基于自研chanjs轻量级mvc框架实现，轻量、灵活、稳定、高性能、可持续。</li>\n<li>SEO。专注于<code>seo</code>,伪静态<code>html</code>和拼音导航，灵活设置关键词和描述。</li>\n<li>安全。基于<code>knex</code>,高防<code>sql</code>注入，接口权限校验，为安全提供保障。</li>\n<li>灵活。碎片功能，支持零碎文案配置，方便各类灵活文案配置。</li>\n<li>高扩展。支持扩展模型，字段配置，可动态生成表，超强扩展。</li>\n<li>模块化。一切模块相互独立，互不干扰。</li>\n<li>插件化。灵活开发，支持完整功能模块。</li>\n<li>无头cms，为多端提供接口支持。</li>\n</ul>', 0, 151, '', 0, 2, '2024-09-13 14:49:28', '2026-09-27 02:11:31', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (2, 13, 1, '{\"pics\": [{\"url\": \"/public/cover/01.jpg\", \"description\": \"朝阳下的主峰\"}, {\"url\": \"/public/cover/04.jpg\", \"description\": \"山脚针叶林\"}, {\"url\": \"/public/cover/06.jpg\", \"description\": \"高山湖泊倒影\"}, {\"url\": \"/public/cover/09.jpg\", \"description\": \"远山草甸\"}], \"location\": \"四川·稻城\", \"shot_time\": \"2026-07-18 06:20:00\", \"photographer\": \"陈岩\"}', '', '雪山晨光：高原山脉摄影集', '', 'recommend', '', '', '', '', '/public/cover/01.jpg', 'rich', '<p style=\"text-align: center;\"><img src=\"/public/cover/01.jpg\" alt=\"朝阳下的主峰\" title=\"朝阳下的主峰\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/04.jpg\" alt=\"山脚针叶林\" title=\"山脚针叶林\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/06.jpg\" alt=\"高山湖泊倒影\" title=\"高山湖泊倒影\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/09.jpg\" alt=\"远山草甸\" title=\"远山草甸\" style=\"max-width: 100%;\"></p>', 0, 163, '', 0, NULL, '2026-07-18 06:20:00', '2026-09-27 02:11:35', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (3, 4, 2, '{\"quality\": \"1080P\", \"duration\": 734, \"video_url\": \"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4\", \"video_cover\": \"/public/cover/03.jpg\"}', '', 'ChanCMS 产品宣传片', '', 'recommend', '', '', '', '', '/public/cover/03.jpg', 'rich', '<p>一分钟了解 ChanCMS：轻量、灵活、稳定、高性能的内容管理系统。</p><p>视频源为公开测试样片，仅作演示用途。</p>', 0, 426, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 0, NULL, '2026-08-20 10:00:00', '2026-09-27 02:11:35', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (4, 7, NULL, NULL, '', 'ChanCMS简介', '', '2', '', '', '', 'ChanCMS简介', '', 'rich', '<p><strong>ChanCMS内容管理系统1</strong></p>\n<p>ChanCMS是一款基于Node、Express、MySQL、Vue3研发的高质量实用型CMS系统。轻量、灵活、稳定、高性能、易扩展，让开发更简单。</p>\n<p><strong>系统特色</strong></p>\n<p>自研。基于自研chanjs轻量级mvc框架实现，轻量、灵活、稳定、高性能、可持续。</p>\n<p>SEO。专注于seo,伪静态html和拼音导航，灵活设置关键词和描述。</p>\n<p>安全。基于knex,高防sql注入，接口权限校验，为安全提供保障。</p>\n<p>灵活。碎片功能，支持零碎文案配置，方便各类灵活文案配置。</p>\n<p>高扩展。支持扩展模型，字段配置，可动态生成表，超强扩展。</p>\n<p>模块化。一切模块相互独立，互不干扰。</p>\n<p>插件化。灵活开发，支持完整功能模块。</p>\n<p>无头cms，为多端提供接口支持。</p>\n<p><strong>软件架构</strong></p>\n<p>后台管理FE</p>\n<pre><code>vue3\nvue-router\npina\nelement-plus\nvite4\ntinymce</code></pre>\n<p>服务端技术栈</p>\n<pre><code>nodejs v20.16.0+\nexpress 4.18+\nmysql v5.7.26\nknex (sql操作)\nart-tempate v4.13.2+\npm2 v5.2.2\njwt\npm2 (prd)\nnodemon (dev)</code></pre>', 0, 392, '', 0, 2, '2024-09-13 15:06:30', '2026-09-27 02:11:31', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (5, 15, 1, '{\"pics\": [{\"url\": \"/public/cover/02.jpg\", \"description\": \"黄昏海岸\"}, {\"url\": \"/public/cover/03.jpg\", \"description\": \"远眺城市\"}, {\"url\": \"/public/cover/10.jpg\", \"description\": \"夜色港湾\"}], \"location\": \"福建·霞浦\", \"shot_time\": \"2026-06-02 18:40:00\", \"photographer\": \"林小满\"}', '', '海岸线之旅：礁石与浪花', '', '', '', '', '', '', '/public/cover/02.jpg', 'rich', '<p style=\"text-align: center;\"><img src=\"/public/cover/02.jpg\" alt=\"黄昏海岸\" title=\"黄昏海岸\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/03.jpg\" alt=\"远眺城市\" title=\"远眺城市\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/10.jpg\" alt=\"夜色港湾\" title=\"夜色港湾\" style=\"max-width: 100%;\"></p>', 0, 132, '', 0, NULL, '2026-06-02 18:40:00', '2026-09-13 01:15:26', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (6, 14, 1, '{\"pics\": [{\"url\": \"/public/cover/03.jpg\", \"description\": \"暮色楼群\"}, {\"url\": \"/public/cover/10.jpg\", \"description\": \"霓虹夜色\"}, {\"url\": \"/public/cover/02.jpg\", \"description\": \"海湾远景\"}, {\"url\": \"/public/cover/06.jpg\", \"description\": \"湖畔倒影\"}], \"location\": \"上海·陆家嘴\", \"shot_time\": \"2026-05-21 19:05:00\", \"photographer\": \"王瀚\"}', '', '城市天际线：玻璃与光', '', '', '', '', '', '', '/public/cover/03.jpg', 'rich', '<p style=\"text-align: center;\"><img src=\"/public/cover/03.jpg\" alt=\"暮色楼群\" title=\"暮色楼群\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/10.jpg\" alt=\"霓虹夜色\" title=\"霓虹夜色\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/02.jpg\" alt=\"海湾远景\" title=\"海湾远景\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/06.jpg\" alt=\"湖畔倒影\" title=\"湖畔倒影\" style=\"max-width: 100%;\"></p>', 0, 98, '', 0, NULL, '2026-05-21 19:05:00', '2026-09-13 01:15:26', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (7, 15, 1, '{\"pics\": [{\"url\": \"/public/cover/04.jpg\", \"description\": \"晨雾松林\"}, {\"url\": \"/public/cover/06.jpg\", \"description\": \"湖边秋色\"}, {\"url\": \"/public/cover/08.jpg\", \"description\": \"花田晨光\"}], \"location\": \"云南·香格里拉\", \"shot_time\": \"2026-08-09 05:50:00\", \"photographer\": \"苏芮\"}', '', '迷雾森林：晨光与松涛', '', '', '', '', '', '', '/public/cover/04.jpg', 'rich', '<p style=\"text-align: center;\"><img src=\"/public/cover/04.jpg\" alt=\"晨雾松林\" title=\"晨雾松林\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/06.jpg\" alt=\"湖边秋色\" title=\"湖边秋色\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/08.jpg\" alt=\"花田晨光\" title=\"花田晨光\" style=\"max-width: 100%;\"></p>', 0, 96, '', 0, NULL, '2026-08-09 05:50:00', '2026-09-27 02:11:34', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (8, 15, 1, '{\"pics\": [{\"url\": \"/public/cover/05.jpg\", \"description\": \"沙漠驼队\"}, {\"url\": \"/public/cover/01.jpg\", \"description\": \"远山夕照\"}, {\"url\": \"/public/cover/09.jpg\", \"description\": \"荒原草甸\"}], \"location\": \"甘肃·敦煌\", \"shot_time\": \"2026-04-15 17:30:00\", \"photographer\": \"陈岩\"}', '', '大漠孤烟：沙海驼影', '', '', '', '', '', '', '/public/cover/05.jpg', 'rich', '<p style=\"text-align: center;\"><img src=\"/public/cover/05.jpg\" alt=\"沙漠驼队\" title=\"沙漠驼队\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/01.jpg\" alt=\"远山夕照\" title=\"远山夕照\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/09.jpg\" alt=\"荒原草甸\" title=\"荒原草甸\" style=\"max-width: 100%;\"></p>', 0, 77, '', 0, NULL, '2026-04-15 17:30:00', '2026-09-14 10:46:48', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (9, 12, NULL, NULL, '', 'Node.js技术专题', '', '1', '', '', '', '深入探索Node.js核心技术、异步编程、框架应用等内容', '/public/cover/08.jpg', 'rich', '<h2>Node.js技术专题介绍</h2><p>Node.js是一个基于Chrome V8引擎的JavaScript运行时环境，它使得JavaScript可以脱离浏览器在服务器端运行。</p><h3>核心特性</h3><ul><li>非阻塞I/O模型</li><li>事件驱动架构</li><li>单线程但高效</li><li>跨平台支持</li></ul><h3>应用场景</h3><p>实时应用、API服务、命令行工具、微服务等</p>', 0, 97, '', 0, NULL, '2024-10-01 02:00:00', '2026-09-13 01:15:26', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (10, 12, NULL, NULL, '', 'Vue3框架专题', '', '1', '', '', '', '全面解析Vue3的Composition API、响应式原理、性能优化等', '/public/cover/09.jpg', 'rich', '<h2>Vue3框架专题</h2><p>Vue3是Vue.js的最新版本，带来了许多令人兴奋的新特性和改进。</p><h3>主要特性</h3><ul><li>Composition API</li><li>更好的TypeScript支持</li><li>性能提升</li><li>更小的包体积</li></ul><h3>核心概念</h3><p>响应式系统、组件化、虚拟DOM、模板语法等</p>', 0, 96, '', 0, NULL, '2024-10-02 06:30:00', '2026-09-13 01:15:26', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (11, 12, NULL, NULL, '', '数据库优化专题1', '', '1', '', '', '', 'MySQL性能优化、索引设计、SQL调优等实战技巧', '/public/cover/10.jpg', 'rich', '<h2>数据库优化专题</h2><p>数据库性能优化是后端开发中的重要环节，直接影响系统性能。</p><h3>优化策略</h3><ul><li>索引优化</li><li>查询优化</li><li>表结构设计</li><li>缓存策略</li></ul><h3>实战经验</h3><p>从慢查询分析到索引优化，全面提升数据库性能</p>', 0, 167, '', 0, NULL, '2024-10-03 01:15:00', '2026-09-13 01:15:26', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (12, 8, NULL, NULL, '', 'js测试', '', '4', '', '', '', '', '', 'rich', '<p><strong>江湖人</strong></p>\n<pre><code class=\"language-language\">  alert(123)\n</code></pre>\n<h1>你看我是谁<img src=\"//img.chancms.top/image/2026/05/31/1780238734653.jpg\" width=\"1106\" height=\"488\" alt=\"\"></h1>\n<p>我也不知道你是谁，但是呢我就是想测试一下啊</p>\n<p>\n<script type=\"text/javascript\">alert(123)</script>\n</p>\n<h2>你好</h2>\n<p><img src=\"http://localhost:3000/public/uploads/default/image/2026/05/30/1780130544223.jpg\" width=\"520\" height=\"693\" alt=\"\"></p>', 0, 97, '', 1, 2, '2026-05-30 03:07:52', '2026-09-13 00:29:35', '{\"aigeo\": {\"title\": \"ChanCMS\"}, \"title\": \"go to school\", \"goods_attr\": {\"name\": \"ChanCMS vip视频教程\", \"time\": \"一个月\", \"price\": \"399\"}}');
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (13, 11, 1, '{\"price\": \"1999\", \"sales\": \"128\", \"specs\": [{\"name\": \"版本\", \"options\": [\"标准版\", \"专业版\", \"旗舰版\"]}], \"stock\": \"999\", \"video\": null, \"images\": [\"/public/cover/04.jpg\", \"https://images.unsplash.com/photo-1505635552518-3448ff116af3?w=640&h=360&fit=crop\"], \"params\": [{\"label\": \"授权类型\", \"value\": \"企业永久授权\"}, {\"label\": \"适用版本\", \"value\": \"v2.7.x\"}, {\"label\": \"技术支持\", \"value\": \"1 年\"}, {\"label\": \"部署方式\", \"value\": \"私有化/云\"}], \"costPrice\": \"899\", \"productNo\": \"CCMS-2026-PRO\", \"originalPrice\": \"2999\", \"recommend_goods\": [], \"recommend_article\": []}', '', 'ChanCMS 企业授权版', 'ChanCMS Pro', '', '', '', 'ChanCMS', 'ChanCMS 企业永久授权版，含全部内容模型与技术支持，私有化部署无忧。', '/public/cover/04.jpg', 'rich', '<p>ChanCMS 是一款基于 Node.js 的内容管理系统，内置文章、图片、视频、商品、专题等多种内容模型。</p><p>企业授权版提供完整源码、私有化部署支持与 1 年技术服务，适合有一定定制需求的中大型站点。</p>', 0, 168, '', 0, 1, '2026-08-13 21:34:29', '2026-09-15 13:55:30', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (15, 1008, NULL, NULL, NULL, '隐私政策', '隐私政策', '', '', '', '', '隐私政策 - ChanCMS演示站', '', 'rich', '<p>我们重视您的隐私。本站仅在提供服务所必需的范围内收集和使用信息（如浏览器 Cookie、访问日志），不会向任何第三方出售您的个人数据。</p><p>如需删除与您相关的数据，请通过站点公示的联系方式与我们取得联系，我们将在核实后及时处理。</p>', 0, 110, NULL, 0, NULL, '2026-09-12 10:44:08', '2026-09-27 02:11:37', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (16, 1009, NULL, NULL, NULL, '使用协议', '使用协议', '', '', '', '', '使用协议 - ChanCMS演示站', '', 'rich', '<p>访问或使用本站即表示您已阅读并同意本协议。本站内容（含文字、图片、资料）仅供学习交流使用，未经许可请勿用于商业用途。</p><p>用户在使用本站过程中应遵守所在地区法律法规，不得利用本站从事任何违法活动。</p>', 0, 98, NULL, 0, NULL, '2026-09-12 10:44:08', '2026-09-27 02:11:37', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (17, 1010, NULL, NULL, NULL, '联系方式', '联系方式', '', '', '', '', '联系方式 - ChanCMS演示站', '', 'rich', '<p>如有任何问题或合作意向，欢迎通过以下方式联系：</p><ul><li>邮箱：example@example.com</li><li>工作时间：周一至周五 9:00 - 18:00</li></ul><p>我们会在收到消息后尽快回复。</p>', 0, 85, NULL, 0, NULL, '2026-09-12 10:44:08', '2026-09-27 02:11:32', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (20, 15, 1, '{\"pics\": [{\"url\": \"/public/cover/07.jpg\", \"description\": \"水乡石桥\"}, {\"url\": \"/public/cover/08.jpg\", \"description\": \"花田环绕\"}, {\"url\": \"/public/cover/02.jpg\", \"description\": \"水岸黄昏\"}], \"location\": \"浙江·乌镇\", \"shot_time\": \"2026-03-28 08:15:00\", \"photographer\": \"林小满\"}', NULL, '江南水乡：小桥流水人家', '2', 'recommend', '', NULL, '', '', '/public/cover/07.jpg', 'rich', '<p style=\"text-align: center;\"><img src=\"/public/cover/07.jpg\" alt=\"水乡石桥\" title=\"水乡石桥\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/08.jpg\" alt=\"花田环绕\" title=\"花田环绕\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/02.jpg\" alt=\"水岸黄昏\" title=\"水岸黄昏\" style=\"max-width: 100%;\"></p>', 0, 143, '', 0, 1, '2026-03-28 08:15:00', '2026-09-13 01:15:26', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (21, 13, 1, '{\"pics\": [{\"url\": \"/public/cover/06.jpg\", \"description\": \"湖畔秋色\"}, {\"url\": \"/public/cover/04.jpg\", \"description\": \"雾中山林\"}, {\"url\": \"/public/cover/01.jpg\", \"description\": \"雪山远景\"}], \"location\": \"新疆·喀纳斯\", \"shot_time\": \"2026-09-01 07:10:00\", \"photographer\": \"苏芮\"}', NULL, '高山湖泊：秋色倒影', '2', '', '', NULL, '', '', '/public/cover/06.jpg', 'rich', '<p style=\"text-align: center;\"><img src=\"/public/cover/06.jpg\" alt=\"湖畔秋色\" title=\"湖畔秋色\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/04.jpg\" alt=\"雾中山林\" title=\"雾中山林\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/01.jpg\" alt=\"雪山远景\" title=\"雪山远景\" style=\"max-width: 100%;\"></p>', 0, 75, '', 0, 1, '2026-09-01 07:10:00', '2026-09-27 02:11:32', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (22, 13, 1, '{\"pics\": [{\"url\": \"/public/cover/09.jpg\", \"description\": \"夏日草原\"}, {\"url\": \"/public/cover/01.jpg\", \"description\": \"山脉晨光\"}, {\"url\": \"/public/cover/08.jpg\", \"description\": \"紫色花海\"}], \"location\": \"内蒙古·呼伦贝尔\", \"shot_time\": \"2026-07-05 09:30:00\", \"photographer\": \"王瀚\"}', NULL, '草原牧歌：野花与远山', '2', '', '', NULL, '', '', '/public/cover/09.jpg', 'rich', '<p style=\"text-align: center;\"><img src=\"/public/cover/09.jpg\" alt=\"夏日草原\" title=\"夏日草原\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/01.jpg\" alt=\"山脉晨光\" title=\"山脉晨光\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/08.jpg\" alt=\"紫色花海\" title=\"紫色花海\" style=\"max-width: 100%;\"></p>', 0, 60, '', 0, 1, '2026-07-05 09:30:00', '2026-09-27 02:11:35', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (23, 14, 1, '{\"pics\": [{\"url\": \"/public/cover/10.jpg\", \"description\": \"城市光轨\"}, {\"url\": \"/public/cover/03.jpg\", \"description\": \"暮色天际线\"}, {\"url\": \"/public/cover/02.jpg\", \"description\": \"海湾夜色\"}], \"location\": \"重庆·洪崖洞\", \"shot_time\": \"2026-08-22 20:45:00\", \"photographer\": \"陈岩\"}', NULL, '夜色都市：光轨与霓虹', '2', '', '', NULL, '', '', '/public/cover/10.jpg', 'rich', '<p style=\"text-align: center;\"><img src=\"/public/cover/10.jpg\" alt=\"城市光轨\" title=\"城市光轨\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/03.jpg\" alt=\"暮色天际线\" title=\"暮色天际线\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/02.jpg\" alt=\"海湾夜色\" title=\"海湾夜色\" style=\"max-width: 100%;\"></p>', 0, 123, '', 0, 1, '2026-08-22 20:45:00', '2026-09-27 02:11:34', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (24, 13, 1, '{\"pics\": [{\"url\": \"/public/cover/08.jpg\", \"description\": \"薰衣草花田\"}, {\"url\": \"/public/cover/09.jpg\", \"description\": \"野花草原\"}, {\"url\": \"/public/cover/04.jpg\", \"description\": \"晨雾林间\"}], \"location\": \"法国·普罗旺斯\", \"shot_time\": \"2026-06-18 05:40:00\", \"photographer\": \"林小满\"}', NULL, '花田物语：紫色晨雾', '2', '', '', NULL, '', '', '/public/cover/08.jpg', 'rich', '<p style=\"text-align: center;\"><img src=\"/public/cover/08.jpg\" alt=\"薰衣草花田\" title=\"薰衣草花田\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/09.jpg\" alt=\"野花草原\" title=\"野花草原\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/04.jpg\" alt=\"晨雾林间\" title=\"晨雾林间\" style=\"max-width: 100%;\"></p>', 0, 91, '', 0, 1, '2026-06-18 05:40:00', '2026-09-13 01:15:26', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (25, 13, 1, '{\"pics\": [{\"url\": \"/public/cover/06.jpg\", \"description\": \"秋叶湖畔\"}, {\"url\": \"/public/cover/01.jpg\", \"description\": \"冬季雪峰\"}, {\"url\": \"/public/cover/04.jpg\", \"description\": \"春日新绿\"}, {\"url\": \"/public/cover/09.jpg\", \"description\": \"夏末草甸\"}], \"location\": \"青海·茶卡\", \"shot_time\": \"2026-02-14 10:20:00\", \"photographer\": \"苏芮\"}', NULL, '山水相依：湖泊四季', '2', '', '', NULL, '', '', '/public/cover/06.jpg', 'rich', '<p style=\"text-align: center;\"><img src=\"/public/cover/06.jpg\" alt=\"秋叶湖畔\" title=\"秋叶湖畔\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/01.jpg\" alt=\"冬季雪峰\" title=\"冬季雪峰\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/04.jpg\" alt=\"春日新绿\" title=\"春日新绿\" style=\"max-width: 100%;\"></p>\n<p style=\"text-align: center;\"><img src=\"/public/cover/09.jpg\" alt=\"夏末草甸\" title=\"夏末草甸\" style=\"max-width: 100%;\"></p>', 0, 69, '', 0, 1, '2026-02-14 10:20:00', '2026-09-13 01:15:26', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (26, 4, 2, '{\"quality\": \"1080P\", \"duration\": 596, \"video_url\": \"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4\", \"video_cover\": \"/public/cover/01.jpg\"}', NULL, 'Open Movie：Big Buck Bunny', '2', '', '', NULL, '', '', '/public/cover/01.jpg', 'rich', '<p> blender 基金会开源动画短片，测试播放器与清晰度切换的样片。</p><p>视频源为公开测试样片，仅作演示用途。</p>', 0, 390, '', 0, 1, '2026-08-20 10:00:00', '2026-09-27 02:11:35', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (27, 4, 2, '{\"quality\": \"1080P\", \"duration\": 653, \"video_url\": \"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4\", \"video_cover\": \"/public/cover/10.jpg\"}', NULL, 'Open Movie：Elephants Dream', '2', '', '', NULL, '', '', '/public/cover/10.jpg', 'rich', '<p>全球第一部开源电影，512 节点渲染农场产出的经典之作。</p><p>视频源为公开测试样片，仅作演示用途。</p>', 0, 247, '', 0, 1, '2026-08-20 10:00:00', '2026-09-27 02:11:36', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (28, 4, 2, '{\"quality\": \"720P\", \"duration\": 15, \"video_url\": \"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4\", \"video_cover\": \"/public/cover/05.jpg\"}', NULL, 'For Bigger Blazes：Chromecast 广告样片', '2', '', '', NULL, '', '', '/public/cover/05.jpg', 'rich', '<p>15 秒短视频样片，适合测试秒开体验与封面抽帧。</p><p>视频源为公开测试样片，仅作演示用途。</p>', 0, 178, '', 0, 1, '2026-08-20 10:00:00', '2026-09-27 02:11:36', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (29, 4, 2, '{\"quality\": \"4K\", \"duration\": 888, \"video_url\": \"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4\", \"video_cover\": \"/public/cover/04.jpg\"}', NULL, 'Open Movie：Sintel', '2', '', '', NULL, '', '', '/public/cover/04.jpg', 'rich', '<p> blender 开源动画《Sintel》，完整版 888 秒 4K 母带转码样片。</p><p>视频源为公开测试样片，仅作演示用途。</p>', 0, 304, '', 0, 1, '2026-08-20 10:00:00', '2026-09-27 02:11:36', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (30, 12, NULL, NULL, NULL, 'ChanJS 框架架构解析：轻量 MVC 的设计哲学', '2,4', '', '', NULL, '', '', '/public/cover/01.jpg', 'rich', '<p>剖析 ChanJS 框架的加载器、路由、仓库三层设计，理解约定优于配置的工程实践。</p><p>剖析 ChanJS 框架的加载器、路由、仓库三层设计，理解约定优于配置的工程实践。。本文由 ChanCMS 演示站自动生成，用于展示内容模型与模板渲染能力。</p>', 0, 76, '', 0, 1, '2026-08-25 09:00:00', '2026-09-27 02:11:32', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (31, 12, NULL, NULL, NULL, 'Knex.js 在 CMS 中的最佳实践：查询构建与防注入', '2,4', '', '', NULL, '', '', '/public/cover/02.jpg', 'rich', '<p>从链式查询到参数绑定，详解 Knex 如何兼顾开发效率与 SQL 安全。</p><p>从链式查询到参数绑定，详解 Knex 如何兼顾开发效率与 SQL 安全。。本文由 ChanCMS 演示站自动生成，用于展示内容模型与模板渲染能力。</p>', 0, 75, '', 0, 1, '2026-08-25 09:00:00', '2026-09-27 02:11:33', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (32, 12, NULL, NULL, NULL, 'art-template 模板引擎实战：从变量到子模板复用', '2,4', '', '', NULL, '', '', '/public/cover/03.jpg', 'rich', '<p>标准语法、流程控制、子模板 include 与布局继承的完整使用指南。</p><p>标准语法、流程控制、子模板 include 与布局继承的完整使用指南。。本文由 ChanCMS 演示站自动生成，用于展示内容模型与模板渲染能力。</p>', 0, 76, '', 0, 1, '2026-08-25 09:00:00', '2026-09-27 02:11:33', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (33, 12, NULL, NULL, NULL, 'Node.js 图片上传与处理：本地存储方案设计', '2,4', '', '', NULL, '', '', '/public/cover/04.jpg', 'rich', '<p>基于 multer 的上传管线、目录分片策略与防盗链实践。</p><p>基于 multer 的上传管线、目录分片策略与防盗链实践。。本文由 ChanCMS 演示站自动生成，用于展示内容模型与模板渲染能力。</p>', 0, 76, '', 0, 1, '2026-08-25 09:00:00', '2026-09-27 02:11:33', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (34, 12, NULL, NULL, NULL, 'SEO 伪静态设计：拼音路径与 canonical 规范', '2,4', '', '', NULL, '', '', '/public/cover/05.jpg', 'rich', '<p>栏目拼音化路径、文章静态地址与站点权重分配的落地方案。</p><p>栏目拼音化路径、文章静态地址与站点权重分配的落地方案。。本文由 ChanCMS 演示站自动生成，用于展示内容模型与模板渲染能力。</p>', 0, 78, '', 0, 1, '2026-08-25 09:00:00', '2026-09-27 02:11:33', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (35, 12, NULL, NULL, NULL, 'CMS 内容模型设计：字段字典与动态表单', '2,4', '', '', NULL, '', '', '/public/cover/06.jpg', 'rich', '<p>用 cms_model + cms_field 驱动后台动态表单，图集、视频、商品一次配齐。</p><p>用 cms_model + cms_field 驱动后台动态表单，图集、视频、商品一次配齐。。本文由 ChanCMS 演示站自动生成，用于展示内容模型与模板渲染能力。</p>', 0, 77, '', 0, 1, '2026-08-25 09:00:00', '2026-09-27 02:11:36', NULL);
INSERT INTO `cms_article` (`id`, `cid`, `mid`, `ext_data`, `subCid`, `title`, `shortTitle`, `tagId`, `attr`, `articleView`, `source`, `description`, `img`, `editorType`, `content`, `status`, `pv`, `link`, `allowScript`, `user_id`, `created_at`, `updated_at`, `code`) VALUES (36, 12, NULL, NULL, NULL, '服务端渲染与静态化：ChanCMS 的性能优化之路', '2,4', '', '', NULL, '', '', '/public/cover/07.jpg', 'rich', '<p>模板缓存、页面静态化与 CDN 分发的三层加速体系。</p><p>模板缓存、页面静态化与 CDN 分发的三层加速体系。。本文由 ChanCMS 演示站自动生成，用于展示内容模型与模板渲染能力。</p>', 0, 79, '', 0, 1, '2026-08-25 09:00:00', '2026-09-27 02:11:37', NULL);
COMMIT;

-- ----------------------------
-- Table structure for cms_article_ext_index
-- ----------------------------
DROP TABLE IF EXISTS `cms_article_ext_index`;
CREATE TABLE `cms_article_ext_index` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL COMMENT '文章ID',
  `field_name` varchar(100) NOT NULL COMMENT '字段名称',
  `field_value` varchar(500) DEFAULT NULL COMMENT '字段值（文本索引）',
  `field_value_num` decimal(15,4) DEFAULT NULL COMMENT '数值索引',
  `field_value_date` datetime DEFAULT NULL COMMENT '日期索引',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_article_field` (`article_id`,`field_name`),
  KEY `idx_field_value` (`field_name`,`field_value`),
  KEY `idx_field_value_num` (`field_name`,`field_value_num`),
  KEY `idx_field_value_date` (`field_name`,`field_value_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章字段值索引表（用于搜索和排序）';

-- ----------------------------
-- Records of cms_article_ext_index
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for cms_articletag
-- ----------------------------
DROP TABLE IF EXISTS `cms_articletag`;
CREATE TABLE `cms_articletag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `aid` int(11) DEFAULT NULL COMMENT '文章id',
  `tid` int(11) DEFAULT NULL COMMENT '标签id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_aid_tid` (`aid`,`tid`),
  KEY `aid` (`aid`) USING BTREE,
  KEY `tid` (`tid`) USING BTREE,
  KEY `idx_tid_aid` (`tid`,`aid`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='文章-标签表';

-- ----------------------------
-- Records of cms_articletag
-- ----------------------------
BEGIN;
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (28, 1, 2);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (29, 1, 4);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (30, 1, 10);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (23, 2, 1);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (8, 2, 2);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (9, 2, 4);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (10, 2, 10);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (11, 3, 2);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (12, 3, 4);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (13, 3, 10);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (24, 5, 1);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (15, 5, 4);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (14, 5, 6);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (25, 6, 1);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (17, 6, 4);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (16, 6, 5);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (26, 7, 1);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (19, 7, 4);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (18, 7, 5);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (27, 8, 1);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (21, 8, 4);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (20, 8, 5);
INSERT INTO `cms_articletag` (`id`, `aid`, `tid`) VALUES (22, 12, 4);
COMMIT;

-- ----------------------------
-- Table structure for cms_category
-- ----------------------------
DROP TABLE IF EXISTS `cms_category`;
CREATE TABLE `cms_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '栏目id',
  `pid` int(11) NOT NULL DEFAULT '0' COMMENT '父级栏目',
  `is_dir` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1=目录容器(无自身页面,访问跳转第一个子栏目) 0=普通栏目',
  `seoTitle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'seo标题',
  `seoKeywords` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'seo关键字',
  `seoDescription` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'seo描述',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '栏目名称',
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '栏目图片',
  `aigeo` json DEFAULT NULL COMMENT 'AI SEO',
  `pinyin` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '栏目标识',
  `path` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '栏目路径',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '栏目描述',
  `type` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '0 栏目 1 页面',
  `content_type` varchar(20) NOT NULL DEFAULT 'article' COMMENT '内容类型: article=文章类 / product=商品类（根栏目声明，子孙继承）',
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '网址',
  `orderBy` tinyint(2) DEFAULT '0' COMMENT '排序',
  `target` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '打开方式 0 当前页面打开 1 新页面打开',
  `status` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '0 显示 1隐藏',
  `mid` int(11) NOT NULL DEFAULT '0' COMMENT '模型id（指向 cms_model.id，与文章一致）',
  `ext_data` json DEFAULT NULL COMMENT '扩展字段值（栏目走 mid 后的字段值，键值对）',
  `page_mid` int(11) NOT NULL DEFAULT '0' COMMENT '页面模型id（栏目自身页面渲染用，区别于 mid 的内容模型）',
  `page_ext_data` json DEFAULT NULL COMMENT '页面扩展字段值（栏目页面走 page_mid 后的字段值）',
  `listView` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'list.html' COMMENT '列表页模板',
  `articleView` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'article.html' COMMENT '详情页模板',
  `dataConfig` json DEFAULT NULL COMMENT '栏目数据配置',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1013 DEFAULT CHARSET=utf8mb4 COMMENT='seed';

-- ----------------------------
-- Records of cms_category
-- ----------------------------
BEGIN;
INSERT INTO `cms_category` (`id`, `pid`, `is_dir`, `seoTitle`, `seoKeywords`, `seoDescription`, `name`, `image`, `aigeo`, `pinyin`, `path`, `description`, `type`, `content_type`, `url`, `orderBy`, `target`, `status`, `mid`, `ext_data`, `page_mid`, `page_ext_data`, `listView`, `articleView`, `dataConfig`, `created_at`, `updated_at`) VALUES (1, 0, 0, NULL, NULL, NULL, '首页', NULL, '{}', 'home', '/home', '', '1', 'article', '', 1, '0', '0', 0, '{\"mid\": 3, \"banner\": \"x\"}', 0, '{}', 'index.html', 'index.html', NULL, '2026-09-13 00:01:34', '2026-09-27 02:09:17');
INSERT INTO `cms_category` (`id`, `pid`, `is_dir`, `seoTitle`, `seoKeywords`, `seoDescription`, `name`, `image`, `aigeo`, `pinyin`, `path`, `description`, `type`, `content_type`, `url`, `orderBy`, `target`, `status`, `mid`, `ext_data`, `page_mid`, `page_ext_data`, `listView`, `articleView`, `dataConfig`, `created_at`, `updated_at`) VALUES (2, 0, 0, '', '', '', '文章', '/public/uploads/default/image/2026/05/30/1780145287649.jpg', '{\"title\": \"goods\"}', 'art3', '/art3', '', '0', 'article', '', 2, '0', '0', 0, NULL, 0, NULL, 'list.html', 'article.html', NULL, '2024-01-01 00:00:00', '2026-09-27 02:09:17');
INSERT INTO `cms_category` (`id`, `pid`, `is_dir`, `seoTitle`, `seoKeywords`, `seoDescription`, `name`, `image`, `aigeo`, `pinyin`, `path`, `description`, `type`, `content_type`, `url`, `orderBy`, `target`, `status`, `mid`, `ext_data`, `page_mid`, `page_ext_data`, `listView`, `articleView`, `dataConfig`, `created_at`, `updated_at`) VALUES (3, 0, 0, '', '', '', '图片', NULL, '{\"tags\": [\"开源\", \"高性能\", \"模块化\"], \"title\": \"AI标题\", \"entity\": \"ChanCMS\", \"keywords\": [\"CMS\", \"NodeCMS\", \"企业建站\"], \"priority\": 1, \"description\": \"AI描述\"}', 'pics', '/pics', '', '0', 'image', '', 3, '0', '0', 1, NULL, 0, NULL, 'pic.html', 'pic-detail.html', NULL, '2024-01-01 00:00:00', '2026-09-27 02:09:17');
INSERT INTO `cms_category` (`id`, `pid`, `is_dir`, `seoTitle`, `seoKeywords`, `seoDescription`, `name`, `image`, `aigeo`, `pinyin`, `path`, `description`, `type`, `content_type`, `url`, `orderBy`, `target`, `status`, `mid`, `ext_data`, `page_mid`, `page_ext_data`, `listView`, `articleView`, `dataConfig`, `created_at`, `updated_at`) VALUES (4, 0, 0, '', '', '', '视频', NULL, NULL, 'video', '/video', '', '0', 'video', '', 4, '0', '0', 2, NULL, 0, NULL, 'video-list.html', 'video-detail.html', NULL, '2024-01-01 00:00:00', '2026-09-27 02:09:17');
INSERT INTO `cms_category` (`id`, `pid`, `is_dir`, `seoTitle`, `seoKeywords`, `seoDescription`, `name`, `image`, `aigeo`, `pinyin`, `path`, `description`, `type`, `content_type`, `url`, `orderBy`, `target`, `status`, `mid`, `ext_data`, `page_mid`, `page_ext_data`, `listView`, `articleView`, `dataConfig`, `created_at`, `updated_at`) VALUES (6, 0, 0, '', '', '', '专题', '/public/uploads/default/image/2026/05/30/1780154877095.jpg', NULL, 'topic', '/about/topic', '', '1', 'special', '/special.html', 6, '0', '0', 0, NULL, 0, NULL, 'list.html', 'special.html', NULL, '2024-01-01 00:00:00', '2026-09-27 02:09:17');
INSERT INTO `cms_category` (`id`, `pid`, `is_dir`, `seoTitle`, `seoKeywords`, `seoDescription`, `name`, `image`, `aigeo`, `pinyin`, `path`, `description`, `type`, `content_type`, `url`, `orderBy`, `target`, `status`, `mid`, `ext_data`, `page_mid`, `page_ext_data`, `listView`, `articleView`, `dataConfig`, `created_at`, `updated_at`) VALUES (7, 0, 0, '', '', '', '关于', NULL, NULL, 'about', '/about', '', '1', 'page', '', 10, '0', '0', 0, NULL, 0, NULL, 'list.html', 'page.html', NULL, '2024-01-01 00:00:00', '2026-09-27 02:09:17');
INSERT INTO `cms_category` (`id`, `pid`, `is_dir`, `seoTitle`, `seoKeywords`, `seoDescription`, `name`, `image`, `aigeo`, `pinyin`, `path`, `description`, `type`, `content_type`, `url`, `orderBy`, `target`, `status`, `mid`, `ext_data`, `page_mid`, `page_ext_data`, `listView`, `articleView`, `dataConfig`, `created_at`, `updated_at`) VALUES (8, 2, 0, '', '', '', '文档', '', '{\"title\": \"seo\"}', 'doc-8', '/art2/doc', '', '0', 'article', '', 0, '0', '0', 0, '{}', 0, '{}', 'list.html', 'article.html', '{}', '2024-01-01 00:00:00', '2026-09-27 02:09:40');
INSERT INTO `cms_category` (`id`, `pid`, `is_dir`, `seoTitle`, `seoKeywords`, `seoDescription`, `name`, `image`, `aigeo`, `pinyin`, `path`, `description`, `type`, `content_type`, `url`, `orderBy`, `target`, `status`, `mid`, `ext_data`, `page_mid`, `page_ext_data`, `listView`, `articleView`, `dataConfig`, `created_at`, `updated_at`) VALUES (9, 7, 0, '', '', '', '作者', NULL, NULL, 'zuozhe', '/about/zuozhe', '', '1', 'page', '', 0, '0', '0', 0, NULL, 0, NULL, 'list.html', 'page.html', NULL, '2024-01-01 00:00:00', '2026-09-27 02:09:17');
INSERT INTO `cms_category` (`id`, `pid`, `is_dir`, `seoTitle`, `seoKeywords`, `seoDescription`, `name`, `image`, `aigeo`, `pinyin`, `path`, `description`, `type`, `content_type`, `url`, `orderBy`, `target`, `status`, `mid`, `ext_data`, `page_mid`, `page_ext_data`, `listView`, `articleView`, `dataConfig`, `created_at`, `updated_at`) VALUES (11, 2, 0, '', '', '', '产品动态', NULL, '{}', 'release', '/art3/release', 'ChanCMS 产品更新与发布动态', '0', 'article', '', 1, '0', '0', 0, NULL, 0, NULL, 'list.html', 'article.html', NULL, '2024-01-01 00:00:00', '2026-09-27 02:09:17');
INSERT INTO `cms_category` (`id`, `pid`, `is_dir`, `seoTitle`, `seoKeywords`, `seoDescription`, `name`, `image`, `aigeo`, `pinyin`, `path`, `description`, `type`, `content_type`, `url`, `orderBy`, `target`, `status`, `mid`, `ext_data`, `page_mid`, `page_ext_data`, `listView`, `articleView`, `dataConfig`, `created_at`, `updated_at`) VALUES (12, 2, 0, '', '', '', '技术分享', NULL, '{}', 'dev', '/art3/dev', '前端与 Node.js 技术实践分享', '0', 'article', '', 2, '0', '0', 0, NULL, 0, NULL, 'list.html', 'article.html', NULL, '2024-01-01 00:00:00', '2026-09-27 02:09:17');
INSERT INTO `cms_category` (`id`, `pid`, `is_dir`, `seoTitle`, `seoKeywords`, `seoDescription`, `name`, `image`, `aigeo`, `pinyin`, `path`, `description`, `type`, `content_type`, `url`, `orderBy`, `target`, `status`, `mid`, `ext_data`, `page_mid`, `page_ext_data`, `listView`, `articleView`, `dataConfig`, `created_at`, `updated_at`) VALUES (13, 3, 0, '', '', '', '风光摄影', NULL, '{}', 'landscape', '/pics/landscape', '山川湖海，自然风光摄影集', '0', 'article', '', 1, '0', '0', 1, NULL, 0, NULL, 'pic.html', 'pic-detail.html', NULL, '2024-01-01 00:00:00', '2026-09-27 02:09:17');
INSERT INTO `cms_category` (`id`, `pid`, `is_dir`, `seoTitle`, `seoKeywords`, `seoDescription`, `name`, `image`, `aigeo`, `pinyin`, `path`, `description`, `type`, `content_type`, `url`, `orderBy`, `target`, `status`, `mid`, `ext_data`, `page_mid`, `page_ext_data`, `listView`, `articleView`, `dataConfig`, `created_at`, `updated_at`) VALUES (14, 3, 0, '', '', '', '城市影像', NULL, '{}', 'cityshot', '/pics/cityshot', '城市建筑与都市夜色影像', '0', 'article', '', 2, '0', '0', 1, NULL, 0, NULL, 'pic.html', 'pic-detail.html', NULL, '2024-01-01 00:00:00', '2026-09-27 02:09:17');
INSERT INTO `cms_category` (`id`, `pid`, `is_dir`, `seoTitle`, `seoKeywords`, `seoDescription`, `name`, `image`, `aigeo`, `pinyin`, `path`, `description`, `type`, `content_type`, `url`, `orderBy`, `target`, `status`, `mid`, `ext_data`, `page_mid`, `page_ext_data`, `listView`, `articleView`, `dataConfig`, `created_at`, `updated_at`) VALUES (15, 3, 0, '', '', '', '人文纪实', NULL, '{}', 'documan', '/pics/documan', '人文风情与旅途纪实图集', '0', 'article', '', 3, '0', '0', 1, NULL, 0, NULL, 'pic.html', 'pic-detail.html', NULL, '2024-01-01 00:00:00', '2026-09-27 02:09:17');
INSERT INTO `cms_category` (`id`, `pid`, `is_dir`, `seoTitle`, `seoKeywords`, `seoDescription`, `name`, `image`, `aigeo`, `pinyin`, `path`, `description`, `type`, `content_type`, `url`, `orderBy`, `target`, `status`, `mid`, `ext_data`, `page_mid`, `page_ext_data`, `listView`, `articleView`, `dataConfig`, `created_at`, `updated_at`) VALUES (1008, 0, 0, NULL, NULL, NULL, '隐私政策', NULL, NULL, 'privacy', '/privacy', '', '1', 'page', '', 11, '0', '0', 0, NULL, 0, NULL, 'list.html', 'page-simple.html', NULL, '2026-09-12 10:43:22', '2026-09-27 02:09:17');
INSERT INTO `cms_category` (`id`, `pid`, `is_dir`, `seoTitle`, `seoKeywords`, `seoDescription`, `name`, `image`, `aigeo`, `pinyin`, `path`, `description`, `type`, `content_type`, `url`, `orderBy`, `target`, `status`, `mid`, `ext_data`, `page_mid`, `page_ext_data`, `listView`, `articleView`, `dataConfig`, `created_at`, `updated_at`) VALUES (1009, 0, 0, NULL, NULL, NULL, '使用协议', NULL, NULL, 'terms', '/terms', '', '1', 'page', '', 12, '0', '0', 0, NULL, 0, NULL, 'list.html', 'page-simple.html', NULL, '2026-09-12 10:43:22', '2026-09-27 02:09:17');
INSERT INTO `cms_category` (`id`, `pid`, `is_dir`, `seoTitle`, `seoKeywords`, `seoDescription`, `name`, `image`, `aigeo`, `pinyin`, `path`, `description`, `type`, `content_type`, `url`, `orderBy`, `target`, `status`, `mid`, `ext_data`, `page_mid`, `page_ext_data`, `listView`, `articleView`, `dataConfig`, `created_at`, `updated_at`) VALUES (1010, 0, 0, NULL, NULL, NULL, '联系方式', NULL, NULL, 'contact', '/contact', '', '1', 'page', '', 13, '0', '0', 0, NULL, 0, NULL, 'list.html', 'page-simple.html', NULL, '2026-09-12 10:43:22', '2026-09-27 02:09:17');
INSERT INTO `cms_category` (`id`, `pid`, `is_dir`, `seoTitle`, `seoKeywords`, `seoDescription`, `name`, `image`, `aigeo`, `pinyin`, `path`, `description`, `type`, `content_type`, `url`, `orderBy`, `target`, `status`, `mid`, `ext_data`, `page_mid`, `page_ext_data`, `listView`, `articleView`, `dataConfig`, `created_at`, `updated_at`) VALUES (1012, 0, 0, NULL, NULL, NULL, '企业名录', NULL, '{}', 'enterprise', '/enterprise', '', '1', 'article', '/enterprise.html', 9, '0', '0', 0, NULL, 0, NULL, 'enterprise-list.html', 'enterprise-detail.html', NULL, '2026-09-26 00:00:00', '2026-09-27 02:09:17');
COMMIT;

-- ----------------------------
-- Table structure for cms_field
-- ----------------------------
DROP TABLE IF EXISTS `cms_field`;
CREATE TABLE `cms_field` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mid` int(11) DEFAULT NULL COMMENT '模型id',
  `field_label` varchar(100) DEFAULT NULL COMMENT '字段标签（中文，替代cname）',
  `field_name` varchar(100) DEFAULT NULL COMMENT '字段名称（英文，替代ename）',
  `type` enum('text','textarea','select','radio','checkbox','datetime','number','image','images','file','files','richtext','json','array','color','location','relation','group','code','table') DEFAULT NULL COMMENT '字段类型',
  `field_config` json DEFAULT NULL COMMENT '字段配置（placeholder、options、maxLength等）',
  `is_required` tinyint(1) DEFAULT '0' COMMENT '是否必填：0-否 1-是',
  `is_searchable` tinyint(1) DEFAULT '0' COMMENT '是否可搜索：0-否 1-是',
  `is_listable` tinyint(1) DEFAULT '1' COMMENT '是否在列表显示：0-否 1-是',
  `is_sortable` tinyint(1) DEFAULT '0' COMMENT '是否可排序：0-否 1-是',
  `sort_order` int(11) DEFAULT '0' COMMENT '字段排序（数字越小越靠前）',
  `group_name` varchar(100) DEFAULT '基本信息' COMMENT '字段分组（基本信息、SEO设置、扩展信息）',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `model_id` (`mid`) USING BTREE,
  KEY `idx_field_type` (`type`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_mid` (`mid`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='字段字典';

-- ----------------------------
-- Records of cms_field
-- ----------------------------
BEGIN;
INSERT INTO `cms_field` (`id`, `mid`, `field_label`, `field_name`, `type`, `field_config`, `is_required`, `is_searchable`, `is_listable`, `is_sortable`, `sort_order`, `group_name`) VALUES (1, 1, '图集图片', 'pics', 'images', '{\"maxCount\": 30, \"placeholder\": \"上传图集图片，第一张为封面\"}', 1, 0, 0, 0, 1, '图集内容');
INSERT INTO `cms_field` (`id`, `mid`, `field_label`, `field_name`, `type`, `field_config`, `is_required`, `is_searchable`, `is_listable`, `is_sortable`, `sort_order`, `group_name`) VALUES (2, 1, '摄影师', 'photographer', 'text', '{}', 0, 1, 1, 0, 2, '图集内容');
INSERT INTO `cms_field` (`id`, `mid`, `field_label`, `field_name`, `type`, `field_config`, `is_required`, `is_searchable`, `is_listable`, `is_sortable`, `sort_order`, `group_name`) VALUES (3, 1, '拍摄时间', 'shot_time', 'datetime', '{}', 0, 0, 1, 0, 3, '图集内容');
INSERT INTO `cms_field` (`id`, `mid`, `field_label`, `field_name`, `type`, `field_config`, `is_required`, `is_searchable`, `is_listable`, `is_sortable`, `sort_order`, `group_name`) VALUES (4, 1, '拍摄地点', 'location', 'text', '{}', 0, 1, 1, 0, 4, '图集内容');
INSERT INTO `cms_field` (`id`, `mid`, `field_label`, `field_name`, `type`, `field_config`, `is_required`, `is_searchable`, `is_listable`, `is_sortable`, `sort_order`, `group_name`) VALUES (5, 2, '视频地址', 'video_url', 'text', '{\"placeholder\": \"支持本站 /uploads/ 路径或外链 mp4 地址\"}', 1, 0, 0, 0, 1, '视频信息');
INSERT INTO `cms_field` (`id`, `mid`, `field_label`, `field_name`, `type`, `field_config`, `is_required`, `is_searchable`, `is_listable`, `is_sortable`, `sort_order`, `group_name`) VALUES (6, 2, '视频封面', 'video_cover', 'image', '{}', 0, 0, 0, 0, 2, '视频信息');
INSERT INTO `cms_field` (`id`, `mid`, `field_label`, `field_name`, `type`, `field_config`, `is_required`, `is_searchable`, `is_listable`, `is_sortable`, `sort_order`, `group_name`) VALUES (7, 2, '时长（秒）', 'duration', 'number', '{\"max\": 86400, \"min\": 0}', 0, 0, 1, 0, 3, '视频信息');
INSERT INTO `cms_field` (`id`, `mid`, `field_label`, `field_name`, `type`, `field_config`, `is_required`, `is_searchable`, `is_listable`, `is_sortable`, `sort_order`, `group_name`) VALUES (8, 2, '清晰度', 'quality', 'select', '{\"options\": [{\"label\": \"流畅 360P\", \"value\": \"360P\"}, {\"label\": \"标清 480P\", \"value\": \"480P\"}, {\"label\": \"高清 720P\", \"value\": \"720P\"}, {\"label\": \"全高清 1080P\", \"value\": \"1080P\"}, {\"label\": \"超高清 4K\", \"value\": \"4K\"}]}', 0, 0, 1, 0, 4, '视频信息');
COMMIT;

-- ----------------------------
-- Table structure for cms_frag
-- ----------------------------
DROP TABLE IF EXISTS `cms_frag`;
CREATE TABLE `cms_frag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT '' COMMENT '名称',
  `mark` varchar(50) DEFAULT NULL COMMENT '标识',
  `content` longtext COMMENT '内容',
  `type` tinytext COMMENT '类型 1 富文本 2 文本框',
  `mid` int(11) DEFAULT NULL COMMENT '模型id（指向 cms_model.id，碎片支持模型选择）',
  `ext_data` json DEFAULT NULL COMMENT '扩展字段值（碎片走 mid 后的字段值，键值对）',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `cid` int(11) DEFAULT NULL COMMENT '归属栏目：NULL=全局，否则绑定栏目(含子孙可见)',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='碎片';

-- ----------------------------
-- Records of cms_frag
-- ----------------------------
BEGIN;
INSERT INTO `cms_frag` (`id`, `name`, `mark`, `content`, `type`, `mid`, `ext_data`, `created_at`, `updated_at`, `cid`) VALUES (1, '首页介绍', 'home_intro', '<p><span style=\"font-size: 14px;\">ChanCMS是一款基于Node、Express、MySQL、Vue3研发的高质量实用型CMS系统。轻量、灵活、稳定、高性能、易扩展，让开发更简单。</span></p>', '1', NULL, NULL, '2024-09-13 14:53:33', '2026-09-12 12:01:02', NULL);
INSERT INTO `cms_frag` (`id`, `name`, `mark`, `content`, `type`, `mid`, `ext_data`, `created_at`, `updated_at`, `cid`) VALUES (2, 'PowerBy', 'PowerBy', '<p style=\"text-align: center;\">Powder By <a href=\"http://www.chancms.top\" target=\"_blank\" rel=\"noopener\">ChanCMS v3.0.14</a></p>', '1', NULL, NULL, '2024-09-27 03:00:03', '2025-02-12 14:13:21', NULL);
INSERT INTO `cms_frag` (`id`, `name`, `mark`, `content`, `type`, `mid`, `ext_data`, `created_at`, `updated_at`, `cid`) VALUES (3, '测试使用', 'test1', '<p>欢迎使用ChanCMS系统1</p>', '1', NULL, NULL, '2026-02-26 01:30:27', '2026-03-08 04:59:36', NULL);
COMMIT;

-- ----------------------------
-- Table structure for cms_friendlink
-- ----------------------------
DROP TABLE IF EXISTS `cms_friendlink`;
CREATE TABLE `cms_friendlink` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL COMMENT '链接名称',
  `link` varchar(255) DEFAULT NULL COMMENT '链接地址',
  `logo` varchar(500) DEFAULT '' COMMENT 'logo 图片（非必填）',
  `orderBy` tinyint(255) DEFAULT '0' COMMENT '排序',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `mid` int(11) DEFAULT NULL COMMENT '所属模型ID',
  `ext_data` json DEFAULT NULL COMMENT '扩展字段值',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='友情链接';

-- ----------------------------
-- Records of cms_friendlink
-- ----------------------------
BEGIN;
INSERT INTO `cms_friendlink` (`id`, `title`, `link`, `logo`, `orderBy`, `created_at`, `updated_at`, `mid`, `ext_data`) VALUES (1, 'ChanCMS官网', 'https://www.chancms.top', '', 0, '2024-10-02 06:12:45', '2024-10-02 06:12:45', NULL, NULL);
COMMIT;

-- ----------------------------
-- Table structure for cms_message
-- ----------------------------
DROP TABLE IF EXISTS `cms_message`;
CREATE TABLE `cms_message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('1','2','3','4') DEFAULT NULL COMMENT '留言分类 1->咨询 2->建议 3->投诉 4->其它',
  `title` varchar(255) DEFAULT NULL COMMENT '留言标题',
  `name` varchar(100) DEFAULT NULL COMMENT '姓名',
  `tel` varchar(50) DEFAULT NULL COMMENT '电话',
  `wechat` varchar(50) DEFAULT NULL COMMENT '微信',
  `company` varchar(100) DEFAULT NULL COMMENT '公司名称',
  `content` varchar(500) DEFAULT NULL COMMENT '留言内容',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `mid` int(11) DEFAULT NULL COMMENT '所属模型ID',
  `ext_data` json DEFAULT NULL COMMENT '扩展字段值',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='留言';

-- ----------------------------
-- Records of cms_message
-- ----------------------------
BEGIN;
INSERT INTO `cms_message` (`id`, `type`, `title`, `name`, `tel`, `wechat`, `company`, `content`, `email`, `created_at`, `updated_at`, `mid`, `ext_data`) VALUES (1, '1', '1', '1111', '1', '1', '1', '1', NULL, '2025-04-02 07:47:25', '2025-04-02 07:47:25', NULL, NULL);
INSERT INTO `cms_message` (`id`, `type`, `title`, `name`, `tel`, `wechat`, `company`, `content`, `email`, `created_at`, `updated_at`, `mid`, `ext_data`) VALUES (2, '2', '112', '12', '13366826071', '', '', '1212', NULL, '2026-02-26 01:36:02', '2026-02-26 01:36:02', NULL, NULL);
INSERT INTO `cms_message` (`id`, `type`, `title`, `name`, `tel`, `wechat`, `company`, `content`, `email`, `created_at`, `updated_at`, `mid`, `ext_data`) VALUES (3, NULL, NULL, '邮件格式验证', '13800000000', NULL, 'ChanCMS', '【测试】留言邮件归属地格式验证（来源：省市 · IP），请忽略', 'format-check@test.com', '2026-09-22 11:46:44', '2026-09-22 11:46:44', NULL, NULL);
INSERT INTO `cms_message` (`id`, `type`, `title`, `name`, `tel`, `wechat`, `company`, `content`, `email`, `created_at`, `updated_at`, `mid`, `ext_data`) VALUES (4, NULL, NULL, '归属地验证', '13800000000', NULL, 'ChanCMS', '【测试】IP后拼接归属地格式验证，请忽略', 'region-check@test.com', '2026-09-22 11:51:54', '2026-09-22 11:51:54', NULL, NULL);
COMMIT;

-- ----------------------------
-- Table structure for cms_model
-- ----------------------------
DROP TABLE IF EXISTS `cms_model`;
CREATE TABLE `cms_model` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `model` varchar(50) DEFAULT NULL COMMENT '模型名称（中文）',
  `model_code` varchar(50) DEFAULT NULL COMMENT '模型编码（英文标识）',
  `status` varchar(1) DEFAULT '1' COMMENT '1->开启 0->关闭',
  `remark` varchar(50) DEFAULT NULL COMMENT '备注',
  `description` text COMMENT '模型描述',
  `icon` varchar(100) DEFAULT NULL COMMENT '模型图标',
  `category` varchar(50) DEFAULT 'content' COMMENT '模型分类：content/product/download/gallery',
  `settings` json DEFAULT NULL COMMENT '模型配置（列表字段、搜索字段等）',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `idx_model_code` (`model_code`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='模型字典';

-- ----------------------------
-- Records of cms_model
-- ----------------------------
BEGIN;
INSERT INTO `cms_model` (`id`, `model`, `model_code`, `status`, `remark`, `description`, `icon`, `category`, `settings`) VALUES (1, '图片模型', 'picture', '1', '图集内容模型：多图、摄影师、拍摄时间、拍摄地点', '适用于图集、摄影、相册类内容', 'Picture', NULL, NULL);
INSERT INTO `cms_model` (`id`, `model`, `model_code`, `status`, `remark`, `description`, `icon`, `category`, `settings`) VALUES (2, '视频模型', 'video', '1', '视频内容模型：视频地址、封面、时长、清晰度', '适用于视频、影像、宣传片类内容', 'Video', NULL, NULL);
COMMIT;

-- ----------------------------
-- Table structure for cms_site
-- ----------------------------
DROP TABLE IF EXISTS `cms_site`;
CREATE TABLE `cms_site` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '站点id',
  `name` varchar(20) DEFAULT NULL COMMENT '网站名称',
  `logo` varchar(500) DEFAULT NULL COMMENT '网站logo',
  `domain` varchar(30) DEFAULT NULL COMMENT '网站域名',
  `tel` varchar(20) DEFAULT '' COMMENT '联系电话',
  `email` varchar(50) DEFAULT NULL COMMENT '邮箱',
  `address` varchar(255) DEFAULT '' COMMENT '单位地址',
  `icp` varchar(100) DEFAULT NULL COMMENT 'ICP备案号',
  `copyright` varchar(255) DEFAULT '' COMMENT '底部版权文字',
  `code` varchar(255) DEFAULT NULL COMMENT '站点统计代码',
  `json` text COMMENT '万能配置',
  `title` varchar(50) DEFAULT NULL COMMENT '页面标题',
  `keywords` varchar(100) DEFAULT NULL COMMENT '页面关键词',
  `description` varchar(255) DEFAULT NULL COMMENT '页面描述',
  `template` varchar(50) DEFAULT 'default' COMMENT 'view模板名称',
  `status` tinyint(1) DEFAULT '1' COMMENT '站点状态 1正常 0关闭',
  `close_tips` varchar(500) DEFAULT '' COMMENT '站点关闭提示语',
  `uploadWay` char(1) DEFAULT '1' COMMENT '上传方式 1->普通 2->七牛云 3->阿里云OSS 4->腾讯云COS',
  `ext_data` json DEFAULT NULL COMMENT '扩展字段JSON',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COMMENT='seed';

-- ----------------------------
-- Records of cms_site
-- ----------------------------
BEGIN;
INSERT INTO `cms_site` (`id`, `name`, `logo`, `domain`, `tel`, `email`, `address`, `icp`, `copyright`, `code`, `json`, `title`, `keywords`, `description`, `template`, `status`, `close_tips`, `uploadWay`, `ext_data`, `created_at`, `updated_at`) VALUES (1, 'ChanCMS演示站', '/view/default/static/img/logo.png', 'www.chancms.top', '', '867528315@qq.com', '', '皖ICP备2024030927号-1', '', '', '', 'ChanCMS演示站', 'ChanCMS演示站', 'ChanCMS是一款基于Express和MySQL研发的高质量实用型CMS管理系统。它具备多种类型网站开发，易扩展、基于模块化和插件化开发模式，适用于商用企业级程序开发。', 'default', 1, '小帅哥休息了', '3', '{\"aigeo\": {}}', NULL, '2026-09-16 14:48:23');
COMMIT;

-- ----------------------------
-- Table structure for cms_slide
-- ----------------------------
DROP TABLE IF EXISTS `cms_slide`;
CREATE TABLE `cms_slide` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '标题',
  `imgUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '轮播图',
  `linkUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '轮播链接',
  `content` text COLLATE utf8mb4_unicode_ci COMMENT '轮播文案',
  `mark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `sort` tinyint(2) DEFAULT '0' COMMENT '排序',
  `status` tinyint(2) DEFAULT '0' COMMENT '0 发布 1 不发布',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `mid` int(11) DEFAULT NULL COMMENT '所属模型ID',
  `ext_data` json DEFAULT NULL COMMENT '扩展字段值',
  `cid` int(11) DEFAULT NULL COMMENT '归属栏目：NULL=全局，否则绑定栏目(含子孙可见)',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='轮播图';

-- ----------------------------
-- Records of cms_slide
-- ----------------------------
BEGIN;
INSERT INTO `cms_slide` (`id`, `title`, `imgUrl`, `linkUrl`, `content`, `mark`, `sort`, `status`, `created_at`, `updated_at`, `mid`, `ext_data`, `cid`) VALUES (1, '测试轮播图1', '/public/cover/01.jpg', '', '<h2 class=\"text-4xl font-bold mb-4\">环保科技引领未来</h2>\n<p class=\"text-xl mb-6\">专业的环保解决方案提供商</p>\n<p><a href=\"about.html\" class=\"bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300\">联系我们</a></p>', NULL, NULL, 0, '2024-09-17 02:52:05', '2026-09-13 13:15:02', NULL, NULL, NULL);
INSERT INTO `cms_slide` (`id`, `title`, `imgUrl`, `linkUrl`, `content`, `mark`, `sort`, `status`, `created_at`, `updated_at`, `mid`, `ext_data`, `cid`) VALUES (2, '测试轮播图2', '/public/cover/03.jpg', '', NULL, NULL, NULL, 0, '2025-07-05 12:51:11', '2026-09-13 13:15:02', NULL, NULL, NULL);
INSERT INTO `cms_slide` (`id`, `title`, `imgUrl`, `linkUrl`, `content`, `mark`, `sort`, `status`, `created_at`, `updated_at`, `mid`, `ext_data`, `cid`) VALUES (3, '测试轮播图3', '/public/cover/04.jpg', '', '<p>是否211</p>', NULL, 0, 0, '2026-02-25 12:23:57', '2026-09-13 13:15:02', NULL, NULL, NULL);
COMMIT;

-- ----------------------------
-- Table structure for cms_tag
-- ----------------------------
DROP TABLE IF EXISTS `cms_tag`;
CREATE TABLE `cms_tag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(10) DEFAULT NULL COMMENT '标签名称',
  `path` varchar(255) DEFAULT '' COMMENT '标识',
  `count` int(11) DEFAULT '0' COMMENT '引用次数',
  `cid` int(11) DEFAULT '0' COMMENT '所属分类id，0表示全局',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_cid` (`cid`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='标签';

-- ----------------------------
-- Records of cms_tag
-- ----------------------------
BEGIN;
INSERT INTO `cms_tag` (`id`, `name`, `path`, `count`, `cid`) VALUES (1, '图片', 'pic', 5, 0);
INSERT INTO `cms_tag` (`id`, `name`, `path`, `count`, `cid`) VALUES (2, 'chancms', 'chancms', 3, 0);
INSERT INTO `cms_tag` (`id`, `name`, `path`, `count`, `cid`) VALUES (4, '教程', 'tutorial', 8, 0);
INSERT INTO `cms_tag` (`id`, `name`, `path`, `count`, `cid`) VALUES (5, 'AIGC', 'aigc', 3, 0);
INSERT INTO `cms_tag` (`id`, `name`, `path`, `count`, `cid`) VALUES (6, '风景', 'scenery', 1, 0);
INSERT INTO `cms_tag` (`id`, `name`, `path`, `count`, `cid`) VALUES (7, '液压', 'hydraulic', 0, 0);
INSERT INTO `cms_tag` (`id`, `name`, `path`, `count`, `cid`) VALUES (8, '工程机械', 'machinery', 0, 0);
INSERT INTO `cms_tag` (`id`, `name`, `path`, `count`, `cid`) VALUES (9, '视频', 'video', 0, 0);
INSERT INTO `cms_tag` (`id`, `name`, `path`, `count`, `cid`) VALUES (10, 'SEO', 'seo', 3, 0);
COMMIT;

-- ----------------------------
-- Table structure for member
-- ----------------------------
DROP TABLE IF EXISTS `member`;
CREATE TABLE `member` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '会员id',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户名',
  `nickname` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '会员昵称',
  `password` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '密码',
  `sex` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '性别（0-未知 1-男 2-女 ）',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '邮箱',
  `wechat` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '微信',
  `phone` varchar(11) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '电话号码',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '头像',
  `status` varchar(1) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '状态 1-启用 2-关闭',
  `login_ip` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '登录ip',
  `loginDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后一次登录时间',
  `pwd_updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后一次修改密码时间',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '注册日期',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `username` (`username`) USING BTREE,
  UNIQUE KEY `member_email` (`email`) USING BTREE,
  KEY `status` (`status`) USING BTREE,
  KEY `loginDate` (`loginDate`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='会员表(核心)';

-- ----------------------------
-- Records of member
-- ----------------------------
BEGIN;
INSERT INTO `member` (`id`, `username`, `nickname`, `password`, `sex`, `email`, `wechat`, `phone`, `avatar`, `status`, `login_ip`, `loginDate`, `pwd_updated_at`, `created_at`, `updated_at`, `remark`) VALUES (1, 'zhangyong', NULL, '$2b$12$7nPtIZ9upiEUiRftPipqmOX7mi1/QCfvbmyJ9YStHzZGUgCkVngqG', '0', 'zhangyong_1430@163.com', NULL, NULL, NULL, '1', NULL, '2026-07-26 16:04:41', '2026-07-26 16:04:41', '2025-09-12 01:47:00', '2026-07-26 16:04:41', NULL);
INSERT INTO `member` (`id`, `username`, `nickname`, `password`, `sex`, `email`, `wechat`, `phone`, `avatar`, `status`, `login_ip`, `loginDate`, `pwd_updated_at`, `created_at`, `updated_at`, `remark`) VALUES (2, 'yanyutao1', NULL, '$2b$12$pQ1uUgg9ySD93fxtFPoJl.GHduP/6djp2xuc22Ni1xs/zWSjV/opO', '0', '8675283151@qq.com', NULL, NULL, NULL, '1', NULL, '2026-07-26 16:04:41', '2026-07-26 16:04:41', '2025-09-12 03:31:44', '2026-07-26 16:04:41', NULL);
INSERT INTO `member` (`id`, `username`, `nickname`, `password`, `sex`, `email`, `wechat`, `phone`, `avatar`, `status`, `login_ip`, `loginDate`, `pwd_updated_at`, `created_at`, `updated_at`, `remark`) VALUES (3, 'yanyutao2023', NULL, '$2b$12$oXfmsnZLyxzq.199E9VA3O1YSpK1Xz6CWvvmoHGi48AdFM3uXZ2aK', '0', 'yanyutao2023@163.com', NULL, NULL, NULL, '1', NULL, '2026-07-26 16:04:41', '2026-07-26 16:04:41', '2025-09-26 05:37:10', '2026-07-26 16:04:41', NULL);
INSERT INTO `member` (`id`, `username`, `nickname`, `password`, `sex`, `email`, `wechat`, `phone`, `avatar`, `status`, `login_ip`, `loginDate`, `pwd_updated_at`, `created_at`, `updated_at`, `remark`) VALUES (4, 'wx_mhkokn1l_9707', 'wx_yhWv4k', NULL, '0', NULL, NULL, NULL, '', '1', '122.96.14.142', '2025-11-23 14:36:17', '2025-11-23 14:36:17', '2025-11-04 14:45:07', '2025-11-23 14:36:17', NULL);
INSERT INTO `member` (`id`, `username`, `nickname`, `password`, `sex`, `email`, `wechat`, `phone`, `avatar`, `status`, `login_ip`, `loginDate`, `pwd_updated_at`, `created_at`, `updated_at`, `remark`) VALUES (5, 'wx_mhobaf5h_c623', 'wx__qkAYw', NULL, '0', NULL, NULL, NULL, '', '1', '58.16.130.22', '2025-11-07 03:44:20', '2025-11-07 03:44:20', '2025-11-07 03:44:20', '2025-11-07 03:44:20', NULL);
INSERT INTO `member` (`id`, `username`, `nickname`, `password`, `sex`, `email`, `wechat`, `phone`, `avatar`, `status`, `login_ip`, `loginDate`, `pwd_updated_at`, `created_at`, `updated_at`, `remark`) VALUES (6, 'wx_mhobaydr_9c3a', 'wx_UHpbe8', NULL, '0', NULL, NULL, NULL, '', '1', '113.88.92.176', '2025-11-07 03:44:44', '2025-11-07 03:44:44', '2025-11-07 03:44:45', '2025-11-07 03:44:45', NULL);
INSERT INTO `member` (`id`, `username`, `nickname`, `password`, `sex`, `email`, `wechat`, `phone`, `avatar`, `status`, `login_ip`, `loginDate`, `pwd_updated_at`, `created_at`, `updated_at`, `remark`) VALUES (7, 'wx_mhobba0a_eacf', 'wx_k__DF4', NULL, '0', NULL, NULL, NULL, '', '1', '116.21.134.33', '2025-11-07 03:45:00', '2025-11-07 03:45:00', '2025-11-07 03:45:00', '2025-11-07 03:45:00', NULL);
INSERT INTO `member` (`id`, `username`, `nickname`, `password`, `sex`, `email`, `wechat`, `phone`, `avatar`, `status`, `login_ip`, `loginDate`, `pwd_updated_at`, `created_at`, `updated_at`, `remark`) VALUES (8, 'wx_mhobq4hi_82ed', 'wx_rQePXk', NULL, '0', NULL, NULL, NULL, '', '1', '20.222.140.205', '2025-11-07 03:56:32', '2025-11-07 03:56:32', '2025-11-07 03:56:33', '2025-11-07 03:56:33', NULL);
INSERT INTO `member` (`id`, `username`, `nickname`, `password`, `sex`, `email`, `wechat`, `phone`, `avatar`, `status`, `login_ip`, `loginDate`, `pwd_updated_at`, `created_at`, `updated_at`, `remark`) VALUES (9, 'wx_mhoe1uf0_abe9', 'wx_Fh-2a8', NULL, '0', NULL, NULL, NULL, '', '1', '111.204.255.130', '2025-11-07 05:01:38', '2025-11-07 05:01:38', '2025-11-07 05:01:39', '2025-11-07 05:01:39', NULL);
INSERT INTO `member` (`id`, `username`, `nickname`, `password`, `sex`, `email`, `wechat`, `phone`, `avatar`, `status`, `login_ip`, `loginDate`, `pwd_updated_at`, `created_at`, `updated_at`, `remark`) VALUES (10, 'wx_mhshtv4c_f4e9', 'wx_GPsJ_Q', NULL, '0', NULL, NULL, NULL, '', '1', '223.160.208.3', '2025-11-10 01:58:29', '2025-11-10 01:58:29', '2025-11-10 01:58:30', '2025-11-10 01:58:30', NULL);
INSERT INTO `member` (`id`, `username`, `nickname`, `password`, `sex`, `email`, `wechat`, `phone`, `avatar`, `status`, `login_ip`, `loginDate`, `pwd_updated_at`, `created_at`, `updated_at`, `remark`) VALUES (11, 'setvet', NULL, '$2b$12$DBETVWNW48wcpnNL1nZgYeDzT0x0Aag6BtNJmbL5ed9gxKhQ2VFZ.', '0', '424052164@qq.com', NULL, NULL, NULL, '1', NULL, '2026-07-26 16:04:41', '2026-07-26 16:04:41', '2025-11-22 08:00:43', '2026-07-26 16:04:41', NULL);
INSERT INTO `member` (`id`, `username`, `nickname`, `password`, `sex`, `email`, `wechat`, `phone`, `avatar`, `status`, `login_ip`, `loginDate`, `pwd_updated_at`, `created_at`, `updated_at`, `remark`) VALUES (12, 'yanyutao', 'yanyutao', '$2b$12$/KQw.ajsHGkxfI/xnYmGJuaFeu2oxpcHEPgDn68MVd3A4iQ6w3CE2', '0', '867528315@qq.com', 'v', '13366826071', NULL, '1', NULL, '2026-08-03 01:41:13', '2026-08-03 01:41:13', '2026-02-26 09:42:56', '2026-08-03 01:41:13', NULL);
COMMIT;

-- ----------------------------
-- Table structure for member_comment
-- ----------------------------
DROP TABLE IF EXISTS `member_comment`;
CREATE TABLE `member_comment` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `member_id` int(11) NOT NULL COMMENT '会员ID',
  `article_id` int(11) NOT NULL COMMENT '文章ID',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评论内容',
  `status` varchar(1) COLLATE utf8mb4_unicode_ci DEFAULT '2' COMMENT '审核状态 1-待审核 2-已通过 3-已拒绝',
  `audit_time` datetime DEFAULT NULL COMMENT '审核时间',
  `audit_user_id` int(11) DEFAULT NULL COMMENT '审核人ID',
  `audit_remark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '审核备注',
  `parent_id` int(11) DEFAULT NULL COMMENT '父评论ID（用于回复功能）',
  `reply_to_member_id` int(11) DEFAULT NULL COMMENT '回复的会员ID',
  `like_count` int(11) DEFAULT '0' COMMENT '点赞数',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `member_id` (`member_id`) USING BTREE,
  KEY `article_id` (`article_id`) USING BTREE,
  KEY `status` (`status`) USING BTREE,
  KEY `parent_id` (`parent_id`) USING BTREE,
  KEY `created_at` (`created_at`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='会员评论表';

-- ----------------------------
-- Records of member_comment
-- ----------------------------
BEGIN;
INSERT INTO `member_comment` (`id`, `member_id`, `article_id`, `content`, `status`, `audit_time`, `audit_user_id`, `audit_remark`, `parent_id`, `reply_to_member_id`, `like_count`, `created_at`, `updated_at`) VALUES (1, 12, 1, '我去', '2', NULL, NULL, NULL, NULL, NULL, 1, '2026-03-20 07:13:06', '2026-08-03 01:39:35');
INSERT INTO `member_comment` (`id`, `member_id`, `article_id`, `content`, `status`, `audit_time`, `audit_user_id`, `audit_remark`, `parent_id`, `reply_to_member_id`, `like_count`, `created_at`, `updated_at`) VALUES (2, 12, 6, '[微笑]', '2', NULL, NULL, NULL, NULL, NULL, 0, '2026-08-02 15:53:21', '2026-08-02 15:53:21');
INSERT INTO `member_comment` (`id`, `member_id`, `article_id`, `content`, `status`, `audit_time`, `audit_user_id`, `audit_remark`, `parent_id`, `reply_to_member_id`, `like_count`, `created_at`, `updated_at`) VALUES (3, 12, 1, '123', '2', NULL, NULL, NULL, 1, 12, 0, '2026-08-02 16:04:26', '2026-08-02 16:04:26');
COMMIT;

-- ----------------------------
-- Table structure for member_comment_like
-- ----------------------------
DROP TABLE IF EXISTS `member_comment_like`;
CREATE TABLE `member_comment_like` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '点赞ID',
  `comment_id` int(11) NOT NULL COMMENT '评论ID',
  `member_id` int(11) NOT NULL COMMENT '会员ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_comment_member` (`comment_id`,`member_id`) USING BTREE,
  KEY `comment_id` (`comment_id`) USING BTREE,
  KEY `member_id` (`member_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='评论点赞表';

-- ----------------------------
-- Records of member_comment_like
-- ----------------------------
BEGIN;
INSERT INTO `member_comment_like` (`id`, `comment_id`, `member_id`, `created_at`) VALUES (1, 1, 12, '2026-08-03 01:39:36');
COMMIT;

-- ----------------------------
-- Table structure for member_favorite
-- ----------------------------
DROP TABLE IF EXISTS `member_favorite`;
CREATE TABLE `member_favorite` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `member_id` int(11) NOT NULL COMMENT '会员ID',
  `article_id` int(11) NOT NULL COMMENT '文章ID',
  `article_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '文章标题（冗余字段）',
  `article_cover` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '文章封面（冗余字段）',
  `article_summary` text COLLATE utf8mb4_unicode_ci COMMENT '文章摘要（冗余字段）',
  `article_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '文章URL',
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'article' COMMENT '内容类型',
  `category_id` int(11) NOT NULL DEFAULT '0' COMMENT '栏目ID',
  `category_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '栏目名称',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_member_item` (`member_id`,`article_id`,`type`),
  KEY `member_id` (`member_id`) USING BTREE,
  KEY `article_id` (`article_id`) USING BTREE,
  KEY `created_at` (`created_at`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='会员收藏表';

-- ----------------------------
-- Records of member_favorite
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for member_reading_record
-- ----------------------------
DROP TABLE IF EXISTS `member_reading_record`;
CREATE TABLE `member_reading_record` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `article_id` int(11) NOT NULL,
  `read_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `member_id` (`member_id`) USING BTREE,
  KEY `article_id` (`article_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='阅读记录表';

-- ----------------------------
-- Records of member_reading_record
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for member_verification_codes
-- ----------------------------
DROP TABLE IF EXISTS `member_verification_codes`;
CREATE TABLE `member_verification_codes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `email` varchar(255) NOT NULL COMMENT '邮箱地址',
  `code` char(6) NOT NULL COMMENT '6位验证码',
  `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '1-未使用\r\n2-已使用 3-已过期',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `expires_at` datetime DEFAULT NULL COMMENT '过期时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `udx_email_scene` (`email`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of member_verification_codes
-- ----------------------------
BEGIN;
INSERT INTO `member_verification_codes` (`id`, `email`, `code`, `status`, `created_at`, `updated_at`, `expires_at`) VALUES (1, '867528315@qq.com', '830567', 3, '2026-08-06 16:32:28', '2026-09-16 21:57:16', '2026-08-06 16:37:28');
INSERT INTO `member_verification_codes` (`id`, `email`, `code`, `status`, `created_at`, `updated_at`, `expires_at`) VALUES (2, 'test_reg_001@qq.com', '1234', 2, '2026-07-27 06:23:25', '2026-07-27 06:23:24', '2026-07-27 06:28:25');
INSERT INTO `member_verification_codes` (`id`, `email`, `code`, `status`, `created_at`, `updated_at`, `expires_at`) VALUES (3, 't_future@qq.com', '111111', 2, '2026-08-01 06:55:45', '2026-08-01 06:55:52', '2026-08-01 07:00:45');
INSERT INTO `member_verification_codes` (`id`, `email`, `code`, `status`, `created_at`, `updated_at`, `expires_at`) VALUES (4, 't_past@qq.com', '222222', 2, '2026-08-01 06:55:45', '2026-08-01 06:55:52', '2026-08-01 06:50:45');
COMMIT;

-- ----------------------------
-- Table structure for sys_config
-- ----------------------------
DROP TABLE IF EXISTS `sys_config`;
CREATE TABLE `sys_config` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type_code` varchar(50) NOT NULL COMMENT '关联配置类型',
  `config_key` varchar(100) NOT NULL COMMENT '配置键',
  `config_value` text NOT NULL COMMENT '配置值',
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '开启（1 开启 2 关闭）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `is_system` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否系统内置（1=不可删除，仅可修改）',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_type_key` (`type_code`,`config_key`) USING BTREE,
  KEY `sys_config_ibfk_1` (`type_code`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=9422 DEFAULT CHARSET=utf8mb4 COMMENT='seed';

-- ----------------------------
-- Records of sys_config
-- ----------------------------
BEGIN;
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (1, 'wechat_minip', 'appid', '231', '1', '2026-09-19 20:35:09', '2026-09-12 22:08:44', '小程序appId', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (2, 'wechat_minip', 'secret', '23', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (3, 'qiniu_oss', 'accessKey', 'jorys47SU0y4tOtDlens3giLwSHcRBCbBNseFrii', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (4, 'qiniu_oss', 'secretKey', 'iGsGGwdHAvP1zma80YQClXklnVUjvMU4HJrUUnIe', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (5, 'qiniu_oss', 'bucket', 'hongkongdaily', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (6, 'cms_config', 'uploadWay', '1', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (7, 'qiniu_oss', 'domain', 'img.shijieqigong.com', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', NULL, 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (8, 'cms_data', 'init', '{\n  \"tag\": {\n    \"method\": \"tag\",\n    \"params\": {\n      \"pageSize\": 10\n    }\n  },\n  \"frag\": {\n    \"method\": \"frag\",\n    \"params\": {\n      \"pageSize\": 50\n    }\n  },\n  \"site\": {\n    \"method\": \"site\"\n  },\n  \"category\": {\n    \"method\": \"category\"\n  },\n  \"friendlink\": {\n    \"method\": \"friendLink\",\n    \"params\": {\n      \"pageSize\": 10\n    }\n  }\n}', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '模板全局数据', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (9, 'cms_data', 'home', '{\n  \"banner\": {\n    \"method\": \"bannerSlide\",\n    \"show\": true\n  },\n  \"slide\": {\n    \"method\": \"getArticleList\",\n    \"params\": {\n      \"start\": 0,\n      \"len\": 1,\n      \"attr\": [\n        \"3\"\n      ]\n    },\n    \"show\": true\n  },\n  \"top\": {\n    \"method\": \"getArticleList\",\n    \"params\": {\n      \"start\": 0,\n      \"len\": 1,\n      \"attr\": [\n        \"top\"\n      ],\n      \"type\": 1\n    },\n    \"show\": true\n  },\n  \"news\": {\n    \"method\": \"getArticleList\",\n    \"params\": {\n      \"start\": 0,\n      \"len\": 3,\n      \"excludeAttr\": [\n        \"1\"\n      ]\n    },\n    \"show\": true\n  },\n  \"article\": {\n    \"method\": \"getArticleListByCids\",\n    \"params\": {\n      \"cid\": [],\n      \"len\": 5,\n      \"toplen\": 1,\n      \"attr\": [\n        \"1\",\n        \"2\"\n      ]\n    },\n    \"show\": true\n  },\n  \"imgs\": {\n    \"method\": \"getNewImgList\",\n    \"params\": {\n      \"len\": 8\n    },\n    \"show\": true\n  },\n  \"recommend\": {\n    \"method\": \"getArticleList\",\n    \"params\": {\n      \"start\": 0,\n      \"len\": 10,\n      \"attr\": [\n        \"2\"\n      ]\n    },\n    \"show\": true\n  },\n  \"hot\": {\n    \"method\": \"getArticlePvList\",\n    \"show\": true\n  },\n  \"recommendImgs\": {\n    \"method\": \"getNewImgList\",\n    \"params\": {\n      \"len\": 10,\n      \"id\": \"\",\n      \"attr\": [\n        \"2\"\n      ]\n    },\n    \"show\": true\n  },\n  \"friendlink\": {\n    \"method\": \"friendLink\",\n    \"params\": {\n      \"pageSize\": 10\n    },\n    \"show\": true\n  }\n}', '1', '2026-09-19 20:35:09', '2026-09-27 02:10:32', '模板首页数据', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (10, 'cms_data', 'list', '{\n  \"articleList\": {\n    \"method\": \"list\",\n    \"params\": {\n      \"pageSize\": 10\n    }\n  },\n  \"recommend\": {\n    \"method\": \"getArticleListByCid\",\n    \"params\": {\n      \"len\": 5,\n      \"attr\": [\n        \"2\"\n      ]\n    },\n    \"show\": true\n  },\n  \"tags\": {\n    \"method\": \"getTagList\"\n  },\n  \"hot\": {\n    \"method\": \"getArticlePvList\",\n    \"params\": {\n      \"len\": 10\n    },\n    \"show\": true\n  },\n  \"imgs\": {\n    \"method\": \"getNewImgList\",\n    \"params\": {\n      \"len\": 5\n    },\n    \"show\": true\n  }\n}', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '模板列表数据', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (11, 'cms_data', 'article', '{\n  \"videos\": {\n    \"method\": \"getArticleListByCid\",\n    \"params\": {\n      \"cid\": 4,\n      \"pageSize\": 5\n    }\n  },\n  \"pics\": {\n    \"method\": \"getArticleListByCid\",\n    \"params\": {\n      \"cid\": 3,\n      \"pageSize\": 10\n    }\n  },\n  \"news\": {\n    \"method\": \"getArticleListByCid\",\n    \"params\": {\n      \"len\": 10\n    }\n  },\n  \"hot\": {\n    \"method\": \"getArticlePvList\",\n    \"params\": {\n      \"len\": 10\n    },\n    \"show\": true\n  },\n  \"imgs\": {\n    \"method\": \"getNewImgList\",\n    \"params\": {\n      \"len\": 5\n    }\n  },\n  \"tags\": {\n    \"method\": \"fetchTagsByArticleId\",\n    \"params\": {\n      \"len\": 5\n    }\n  },\n  \"count\": {\n    \"method\": \"count\"\n  },\n  \"pre\": {\n    \"method\": \"prev\"\n  },\n  \"next\": {\n    \"method\": \"next\"\n  }\n}', '1', '2026-09-19 20:35:09', '2026-09-12 10:44:29', '模板详情数据', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (12, 'cms_data', 'page', '{\r\n  \"page\": {\r\n    \"method\": \"list\",\r\n    \"params\": {\r\n      \"pageSize\": 10\r\n    }\r\n  }\r\n}', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '模板单页数据', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (13, 'cms_data', 'search', '{\"search\":{\"method\":\"search\",\"params\":{\"pageSize\":10}}}', '1', '2026-09-19 20:35:09', '2026-09-27 02:34:48', '模板搜索列表数据', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (14, 'cms_data', 'tags', '{\r\n  \"tags\": {\r\n    \"method\": \"tags\",\r\n    \"params\": {\r\n      \"pageSize\": 10\r\n    }\r\n  }\r\n}', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '模板tag列表数据', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (16, 'upload_config', 'imgSize', '0.5', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '图片（含Logo/封面）上传大小上限（MB，支持小数 0.5=512KB）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (17, 'upload_config', 'fileSize', '10', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '通用文件上传大小上限（MB，PDF/压缩包/字体/文本等均按此项）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (18, 'upload_config', 'videoSize', '20', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '视频上传大小上限（MB）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (20, 'upload_config', 'musicSize', '5', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '音频上传大小上限（MB）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (27, 'comment_config', 'minLength', '1', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '评论最小字数', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (28, 'comment_config', 'maxLength', '50', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '评论最大字数', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (29, 'comment_config', 'maxLinks', '0', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '单条评论最大链接数', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (30, 'comment_config', 'spamInterval', '60', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '刷屏防护时间窗口（秒）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (31, 'comment_config', 'spamLimit', '3', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '刷屏防护窗口内最大评论数', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (32, 'comment_config', 'sensitiveWords', 'cao,操,woqu,习近平,党\n微信,wx,WeChat,QQ,加群,拉人,进群,私聊,私信,联系方式,电话,手机号,微信号,QQ号,二维码,链接,网址,www,http,https,.com,.cn,.net,.vip,推广,广告,代理,加盟,招商,刷单,返利,红包,福利,免费送,低价,代购,微商,引流,涨粉,点赞,关注,投票,傻逼,傻比,智障,脑残,废物,垃圾,去死,滚蛋,操,cao,mb,ma,sb操你妈,妈的,草泥马,cnm,nm,狗东西,贱人,杂种,畜生,傻逼玩意,傻缺,二逼,2b,煞笔,窝囊废,神经病,脑子有病,智障儿,脑瘫,去死吧,滚远点,妈的批,mp,狗娘养的,不要脸,无耻,下贱,傻逼货,赌博,博彩,六合彩,彩票,棋牌,打鱼,上分,下分,提现,充值,色情,黄片,约炮,嫖娼,卖淫,裸聊,偷拍,毒品,大麻,冰毒,枪支,弹药,管制刀具,诈骗,洗钱,传销,邪教,涉政,敏感,反社会,恐怖,暴力,杀人,放火,爆炸,毒品交易,微❤,微芯,薇信,wei信,W信,微X,Ⅴ信,+v,党,政府,国家,公安,国际,习近平,江泽民,胡景涛', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '敏感词列表（逗号分隔）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (33, 'comment_config', 'enableSensitiveFilter', '1', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '是否启用敏感词过滤', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (34, 'comment_config', 'enableXSSFilter', '1', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '是否启用XSS过滤', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (35, 'comment_config', 'enableLinkFilter', '1', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '是否启用链接限制', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (36, 'aliyun_oss', 'aliyun_region', 'oss-cn-beijing', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '地域，如 oss-cn-hangzhou', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (37, 'aliyun_oss', 'aliyun_accessKeyId', 'your-access-key-id', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', 'AccessKey ID', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (38, 'aliyun_oss', 'aliyun_accessKeySecret', 'your-access-key-secret', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', 'AccessKey Secret', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (39, 'aliyun_oss', 'aliyun_bucket', 'hongkongdaily', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', 'Bucket名称', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (40, 'aliyun_oss', 'aliyun_domain', 'img.chancms.top', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '自定义域名或Bucket域名', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (41, 'email_config', 'HOST', 'smtp.qq.com', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', 'SMTP 主机', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (42, 'email_config', 'PORT', '465', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', 'SMTP 端口', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (43, 'email_config', 'SECURE', 'true', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '是否使用 TLS（587 端口 STARTTLS 为 true）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (44, 'email_config', 'USER', '867528315@qq.com', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '发信账号', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (45, 'email_config', 'PASS', 'zdzxzvjxenxhbfeb', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '发信密码/授权码', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (46, 'email_config', 'FROM', 'BLINCE官网 <867528315@qq.com>', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '发件人', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (47, 'email_config', 'TO', '[\"867528315@qq.com\"]', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '默认收件人', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (48, 'wechat_config', 'mp_appid', 'wxaf8aee79415ec787', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '微信公众号 AppID', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (49, 'wechat_config', 'mp_appsecret', '92749a37f37f0da0a262a082322cf99', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '微信公众号 AppSecret', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (50, 'wechat_config', 'mp_redirect_uri', 'https://vip.chancms.top', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '公众号回调域名', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (51, 'wechat_config', 'mp_token', '123', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '公众号后台 Token', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (52, 'wechat_config', 'open_appid', 'wx07961cce0b8d4c55', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '微信开放平台 AppID（PC 扫码登录）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (53, 'wechat_config', 'open_appsecret', 'd124b3193e782c8e5d283fb3e4fd4b19', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '微信开放平台 AppSecret', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (54, 'wechat_config', 'minip_appid', 'your-miniprogram-appid', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '微信小程序 AppID', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (55, 'wechat_config', 'minip_appsecret', 'your-miniprogram-appsecret', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '微信小程序 AppSecret', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (56, 'rate_limit_config', 'all', '{\"search\":{\"max\":30,\"windowMs\":\"1m\",\"message\":\"搜索访问过于频繁，请稍后再试\"},\"verifyCode\":{\"max\":20,\"windowMs\":\"5m\"},\"sendEmail\":{\"intervalMs\":60000,\"maxPerIpPerDay\":20},\"message\":{\"maxPerIpPerDay\":100,\"maxPerFpPerDay\":50},\"loginFail\":{\"maxFail\":5,\"lockMs\":3600000}}', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '接口限流（global 不入库，跟随 env dev/prd）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (57, 'upload_allow_config', 'all', '[\"image/jpeg\",\"image/png\",\"image/gif\",\"image/webp\",\"video/mp4\",\"video/quicktime\",\"video/x-msvideo\",\"video/x-matroska\",\"application/pdf\",\"audio/mpeg\",\"audio/wav\",\"audio/ogg\",\"audio/x-m4a\",\"text/css\",\"font/ttf\",\"font/otf\",\"font/woff\",\"font/woff2\",\"application/x-font-ttf\",\"application/x-font-otf\",\"application/font-woff\",\"application/font-woff2\",\"application/zip\",\"application/x-zip-compressed\",\"application/x-rar-compressed\",\"application/x-7z-compressed\",\"application/x-tar\",\"application/gzip\",\"text/plain\"]', '1', '2026-09-19 20:35:09', '2026-09-16 19:41:32', '上传文件 MIME 白名单（JSON 数组）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (58, 'page_config', 'PAGE_SIZE', '20', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '全局默认每页条数', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (59, 'page_config', 'LIMIT_MAX', '300', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '分页最大条数上限', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (60, 'security_config', 'BCRYPT_SALT', '12', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', 'bcrypt 盐轮数（cost factor）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (61, 'upload_config', 'uploadDir', 'uploads', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '上传根目录（位于 public/ 下，不含斜杠与 ..）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (62, 'tencent_oss', 'tencent_secretId', 'your-secret-id', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', 'SecretId', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (63, 'tencent_oss', 'tencent_secretKey', 'your-secret-key', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', 'SecretKey', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (64, 'tencent_oss', 'tencent_bucket', 'blince-1388819226', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', 'Bucket名称', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (65, 'tencent_oss', 'tencent_region', 'ap-guangzhou', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '地域，如 ap-guangzhou', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (66, 'tencent_oss', 'tencent_domain', '', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '自定义域名（可选，为空时使用默认 Bucket 域名）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (67, 'email_config', 'SUBJECT_REG', '注册验证码', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '注册邮件主题（sys_config 可改）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (68, 'email_config', 'SUBJECT_RESET', '修改密码验证码', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '修改密码邮件主题（sys_config 可改）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (69, 'email_config', 'SUBJECT_MESSAGE', '收到新网站留言', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '留言通知邮件主题（sys_config 可改）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (70, 'email_config', 'TEMPLATE_REG', '<!DOCTYPE html><html lang=\"zh-CN\"><head><meta charset=\"UTF-8\"><style>body{font-family:Arial,\"Microsoft YaHei\",sans-serif;background:#f1f5f9;padding:32px 16px}.card{max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;color:#0f172a}.hd{padding:28px 36px 16px}.hd h1{font-size:20px;margin:0 0 6px}.hd p{font-size:14px;color:#64748b;margin:0}.wrap{padding:8px 36px 28px;color:#334155;font-size:15px;line-height:1.8}.code{margin:22px 0;text-align:center;font-size:28px;font-weight:700;letter-spacing:4px;color:#2563eb}.ft{padding:14px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8}</style></head><body><div class=\"card\"><div class=\"hd\"><h1>账户注册验证</h1><p>欢迎加入 {{APP_NAME}}，请完成邮箱校验</p></div><div class=\"wrap\"><div>您的注册验证码如下：</div><div class=\"code\">{{CODE}}</div><div>请在 <b>{{MIN}} 分钟</b> 内填写验证码完成注册校验。如非本人操作请忽略本邮件。</div></div><div class=\"ft\">© {{APP_NAME}} 保留所有权利</div></div></body></html>', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '注册验证码邮件模板（占位符：{{CODE}} {{MIN}} {{APP_NAME}}）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (71, 'email_config', 'TEMPLATE_RESET', '<!DOCTYPE html><html lang=\"zh-CN\"><head><meta charset=\"UTF-8\"><style>body{font-family:Arial,\"Microsoft YaHei\",sans-serif;background:#f1f5f9;padding:32px 16px}.card{max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;color:#0f172a}.hd{padding:28px 36px 16px}.hd h1{font-size:20px;margin:0 0 6px}.hd p{font-size:14px;color:#64748b;margin:0}.wrap{padding:8px 36px 28px;color:#334155;font-size:15px;line-height:1.8}.code{margin:22px 0;text-align:center;font-size:28px;font-weight:700;letter-spacing:4px;color:#2563eb}.ft{padding:14px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8}</style></head><body><div class=\"card\"><div class=\"hd\"><h1>账户密码重置</h1><p>来自 {{APP_NAME}} 的账户安全验证码</p></div><div class=\"wrap\"><div>请使用下方验证码完成身份校验：</div><div class=\"code\">{{CODE}}</div><div>验证码有效期 <b>{{MIN}} 分钟</b>，过期需重新发起。如非本人操作请忽略本邮件。</div></div><div class=\"ft\">© {{APP_NAME}} 保留所有权利</div></div></body></html>', '1', '2026-09-19 20:35:09', '2026-09-19 20:35:09', '重置密码邮件模板（占位符：{{CODE}} {{MIN}} {{APP_NAME}}）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (72, 'email_config', 'TEMPLATE_MESSAGE', '<!DOCTYPE html><html lang=\"zh-CN\"><head><meta charset=\"UTF-8\"><style>body{font-family:Arial,\"Microsoft YaHei\",sans-serif;background:#f1f5f9;padding:32px 16px}.card{max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;color:#0f172a}.hd{padding:28px 36px 16px}.hd h1{font-size:20px;margin:0 0 6px}.hd p{font-size:14px;color:#64748b;margin:0}.wrap{padding:8px 36px 24px;color:#334155;font-size:14px;line-height:1.8}.field{margin:6px 0}.field b{color:#0f172a}.content{margin-top:16px;background:#f8fafc;border-left:3px solid #3b82f6;border-radius:6px;padding:14px 16px;white-space:pre-wrap;word-break:break-word}.btn{display:block;text-align:center;margin:20px 36px;padding:13px;border-radius:8px;background:#165DFF;color:#fff;text-decoration:none;font-weight:500}.ft{padding:14px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8}</style></head><body><div class=\"card\"><div class=\"hd\"><h1>收到新网站留言</h1><p>客户通过在线留言提交了一条信息，建议24小时内联系</p></div><div class=\"wrap\"><div class=\"field\"><b>姓名：</b>{{NAME}}</div><div class=\"field\"><b>公司：</b>{{COMPANY}}</div><div class=\"field\"><b>电话：</b>{{TEL}}</div><div class=\"field\"><b>邮箱：</b>{{EMAIL}}</div><div class=\"content\">{{CONTENT}}</div><div class=\"field\" style=\"margin-top:12px;color:#94a3b8;font-size:12px\">提交时间：{{TIME}}　来源IP：{{IP}} {{REGION}}</div></div><a class=\"btn\" href=\"{{ADMIN_LINK}}\">前往后台查看留言</a><div class=\"ft\">本邮件由系统自动发出，请勿直接回复 · © {{APP_NAME}}</div></div></body></html>', '1', '2026-09-19 20:35:09', '2026-09-22 11:51:12', '留言通知邮件模板（占位符：{{NAME}} {{COMPANY}} {{TEL}} {{EMAIL}} {{CONTENT}} {{TIME}} {{IP}} {{ADMIN_LINK}} {{APP_NAME}}）', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (9417, 'qiniu_oss', 'corsOrigin', '*', '1', '2026-09-16 06:54:49', '2026-09-16 06:54:49', '前端直传允许的来源（CORS），多个用逗号分隔；* 表示不限制', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (9418, 'aliyun_oss', 'corsOrigin', '*', '1', '2026-09-16 06:54:49', '2026-09-16 06:54:49', '前端直传允许的来源（CORS），多个用逗号分隔；* 表示不限制', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (9419, 'tencent_oss', 'corsOrigin', '*', '1', '2026-09-16 06:54:49', '2026-09-16 06:54:49', '前端直传允许的来源（CORS），多个用逗号分隔；* 表示不限制', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (9420, 'cors_config', 'ORIGIN', '*', '1', '2026-09-16 20:06:30', '2026-09-16 20:09:39', '后台API跨域白名单（base/cms/oss/stat 等所有接口）：* 全放行，或逗号分隔域名（如 https://admin.xxx.com,https://api.xxx.com）；独立域名前端调接口时才需要配，同域/代理访问用不到。保存后即时生效；携带 Cookie 的跨域还需 env CORS_ORIGIN 同步设白名单。注意：OSS 直传 bucket 的 CORS 在各 oss 分组的 corsOrigin，与此无关', 1);
INSERT INTO `sys_config` (`id`, `type_code`, `config_key`, `config_value`, `status`, `created_at`, `updated_at`, `remark`, `is_system`) VALUES (9421, 'cache_config', 'CACHE', 'true', '1', '2026-09-16 20:06:30', '2026-09-16 20:09:39', '前台页面数据缓存总开关（true/false）：控制站点信息/栏目/碎片等模板全局数据与首页/专题等前台查询结果是否走内存缓存；false 后每次请求实时查库（调试模板/改数据不显示时可先关）。不影响后台接口、模板文件与限流，保存后即时生效', 1);
COMMIT;

-- ----------------------------
-- Table structure for sys_config_type
-- ----------------------------
DROP TABLE IF EXISTS `sys_config_type`;
CREATE TABLE `sys_config_type` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `type_code` varchar(50) NOT NULL COMMENT '类型标识（如 qiniu, wechat_mini）',
  `type_name` varchar(50) NOT NULL COMMENT '类型名称（如七牛云存储、微信小程序）',
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `is_system` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否系统内置（1=不可删除，仅可修改）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `type_code` (`type_code`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COMMENT='seed';

-- ----------------------------
-- Records of sys_config_type
-- ----------------------------
BEGIN;
INSERT INTO `sys_config_type` (`id`, `type_code`, `type_name`, `status`, `remark`, `is_system`, `created_at`, `updated_at`) VALUES (1, 'wechat_minip', '微信小程序', '1', '微信小程序登录appId appkey', 1, '2026-09-19 20:35:09', '2026-09-19 20:35:09');
INSERT INTO `sys_config_type` (`id`, `type_code`, `type_name`, `status`, `remark`, `is_system`, `created_at`, `updated_at`) VALUES (2, 'qiniu_oss', '七牛云配置', '1', '七牛云oss配置', 1, '2026-09-19 20:35:09', '2026-09-19 20:35:09');
INSERT INTO `sys_config_type` (`id`, `type_code`, `type_name`, `status`, `remark`, `is_system`, `created_at`, `updated_at`) VALUES (3, 'cms_config', '应用设置', '1', '站点常用配置', 1, '2026-09-19 20:35:09', '2026-09-19 20:35:09');
INSERT INTO `sys_config_type` (`id`, `type_code`, `type_name`, `status`, `remark`, `is_system`, `created_at`, `updated_at`) VALUES (4, 'cms_data', '模板数据', '1', '页面模板接口配置数据', 1, '2026-09-19 20:35:09', '2026-09-19 20:35:09');
INSERT INTO `sys_config_type` (`id`, `type_code`, `type_name`, `status`, `remark`, `is_system`, `created_at`, `updated_at`) VALUES (5, 'upload_config', '上传配置', '1', '上传大小限制，单位 MB（支持小数，0.5=512KB）', 1, '2026-09-19 20:35:09', '2026-09-19 20:35:09');
INSERT INTO `sys_config_type` (`id`, `type_code`, `type_name`, `status`, `remark`, `is_system`, `created_at`, `updated_at`) VALUES (6, 'comment_config', '评论安全配置', '1', '用户评论安全防护配置', 1, '2026-09-19 20:35:09', '2026-09-19 20:35:09');
INSERT INTO `sys_config_type` (`id`, `type_code`, `type_name`, `status`, `remark`, `is_system`, `created_at`, `updated_at`) VALUES (7, 'aliyun_oss', '阿里云OSS配置', '1', '阿里云OSS对象存储配置', 1, '2026-09-19 20:35:09', '2026-09-19 20:35:09');
INSERT INTO `sys_config_type` (`id`, `type_code`, `type_name`, `status`, `remark`, `is_system`, `created_at`, `updated_at`) VALUES (8, 'email_config', '邮件配置', '1', 'SMTP 发信配置（库内明文，列表接口已脱敏）', 1, '2026-09-19 20:35:09', '2026-09-19 20:35:09');
INSERT INTO `sys_config_type` (`id`, `type_code`, `type_name`, `status`, `remark`, `is_system`, `created_at`, `updated_at`) VALUES (9, 'wechat_config', '微信配置', '1', '公众号/开放平台/小程序', 1, '2026-09-19 20:35:09', '2026-09-19 20:35:09');
INSERT INTO `sys_config_type` (`id`, `type_code`, `type_name`, `status`, `remark`, `is_system`, `created_at`, `updated_at`) VALUES (10, 'page_config', '分页默认值', '1', '全局分页默认条数/上限', 1, '2026-09-19 20:35:09', '2026-09-19 20:35:09');
INSERT INTO `sys_config_type` (`id`, `type_code`, `type_name`, `status`, `remark`, `is_system`, `created_at`, `updated_at`) VALUES (11, 'security_config', '安全配置', '1', 'bcrypt 盐轮数等安全参数', 1, '2026-09-19 20:35:09', '2026-09-19 20:35:09');
INSERT INTO `sys_config_type` (`id`, `type_code`, `type_name`, `status`, `remark`, `is_system`, `created_at`, `updated_at`) VALUES (12, 'rate_limit_config', '接口限流配置', '1', '各业务接口频次/限流阈值（JSON）', 1, '2026-09-19 20:35:09', '2026-09-19 20:35:09');
INSERT INTO `sys_config_type` (`id`, `type_code`, `type_name`, `status`, `remark`, `is_system`, `created_at`, `updated_at`) VALUES (13, 'upload_allow_config', '上传类型白名单', '1', '允许上传的文件 MIME 类型（JSON 数组）', 1, '2026-09-19 20:35:09', '2026-09-19 20:35:09');
INSERT INTO `sys_config_type` (`id`, `type_code`, `type_name`, `status`, `remark`, `is_system`, `created_at`, `updated_at`) VALUES (14, 'tencent_oss', '腾讯云COS配置', '1', '腾讯云COS对象存储配置', 1, '2026-09-19 20:35:09', '2026-09-19 20:35:09');
COMMIT;

-- ----------------------------
-- Table structure for sys_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_menu`;
CREATE TABLE `sys_menu` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `pid` int(11) DEFAULT '0' COMMENT '父菜单ID',
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '菜单名称',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '路由名称',
  `order_num` int(4) DEFAULT '0' COMMENT '显示顺序',
  `path` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '路由地址',
  `component` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '组件路径',
  `icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '菜单图标',
  `query` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '路由参数',
  `perms` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '权限标识',
  `type` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '菜单类型（M目录 C菜单 F按钮）',
  `is_frame` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '2' COMMENT '是否为外链（1是 2否）',
  `is_cache` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '2' COMMENT '是否缓存（1缓存 2不缓存）',
  `is_show` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '1' COMMENT '是否显示（1显示 2隐藏）',
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '菜单状态（1开启 2停用）',
  `create_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '创建者',
  `created_at` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '更新者',
  `updated_at` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=209 DEFAULT CHARSET=utf8mb4 COMMENT='seed';

-- ----------------------------
-- Records of sys_menu
-- ----------------------------
BEGIN;
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (1, 0, '网站信息', 'dashboard', 0, '/dashboard', '@/views/base/dashboard/index.vue', 'DataLine', NULL, '', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (2, 0, '站点管理', '', 0, '/site', '', 'Monitor', NULL, '', 'M', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (3, 2, '站点设置', 'siteinfo', 0, '/siteinfo', '@/views/cms/site/index.vue', '', NULL, 'cms:site:info', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (4, 0, '内容管理', '', 0, '/content', '', 'Grid', NULL, '', 'M', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (5, 4, '栏目管理', 'category-index', 0, '/category', '@/views/cms/category/index.vue', '', NULL, 'cms:category:find', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (7, 5, '栏目新增/修改', 'category-edit', 0, '/category/edit/:id?', '@/views/cms/category/edit.vue', '', NULL, 'cms:category:save', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (8, 5, '栏目删除', '', 0, '', '', '', NULL, 'cms:category:delete', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (9, 5, '栏目查询', '', 0, '', '', '', NULL, 'cms:category:find', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (10, 4, '文章管理', 'article-index', 0, '/article', '@/views/cms/article/index.vue', '', NULL, 'cms:article:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (12, 10, '文章新增/修改', 'article-edit', 0, '/article/edit/:id?', '@/views/cms/article/edit.vue', '', NULL, 'cms:article:save', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (13, 10, '文章删除', '', 0, '', NULL, '', NULL, 'cms:article:delete', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (14, 10, '文章详情', '', 0, '', NULL, '', NULL, 'cms:article:detail', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (15, 4, '轮播管理', 'slide-index', 0, '/slide', '@/views/cms/slide/index.vue', '', NULL, 'cms:slide:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (17, 15, '轮播新增/修改', 'slide-edit', 0, '/slide/edit/:id?', '@/views/cms/slide/edit.vue', '', NULL, 'cms:slide:save', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (18, 15, '轮播删除', '', 0, '', NULL, '', NULL, 'cms:slide:delete', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (19, 15, '轮播详情', '', 0, '', NULL, '', NULL, 'cms:slide:detail', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (20, 4, '标签管理', 'tag-index', 0, '/tag', '@/views/cms/tag/index.vue', '', NULL, 'cms:tag:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (22, 20, '标签新增/修改', 'tag-edit', 0, '/tag/edit/:id?', '@/views/cms/tag/edit.vue', '', NULL, 'cms:tag:save', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (23, 20, '标签删除', '', 0, '', NULL, '', NULL, 'cms:tag:delete', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (24, 20, '标签详情', '', 0, '', NULL, '', NULL, 'cms:tag:detail', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (25, 4, '碎片管理', 'frag-index', 0, '/frag', '@/views/cms/frag/index.vue', '', NULL, 'cms:frag:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (27, 25, '碎片新增/修改', 'frag-edit', 0, '/frag/edit/:id?', '@/views/cms/frag/edit.vue', '', NULL, 'cms:frag:save', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (28, 25, '碎片删除', '', 0, '', NULL, '', NULL, 'cms:frag:delete', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (29, 25, '碎片详情', '', 0, '', NULL, '', NULL, 'cms:frag:detail', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (30, 40, '页面采集', 'collect-index', 0, '/collect', '@/views/cms/collect/index.vue', '', NULL, 'cms:collect:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (32, 30, '采集新增/修改', 'collect-edit', 0, '/collect/edit/:id?', '@/views/cms/collect/edit.vue', '', NULL, 'cms:collect:save', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (33, 30, '采集删除', '', 0, '', NULL, '', NULL, 'cms:collect:delete', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (34, 30, '采集查询', '', 0, '', NULL, '', NULL, 'cms:collect:detail', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (35, 40, '接口采集', 'gather-index', 0, '/gather', '@/views/cms/gather/index.vue', '', NULL, 'cms:gather:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (37, 35, '采集新增/修改', 'gather-edit', 0, '/gather/edit/:id?', '@/views/cms/gather/edit.vue', '', NULL, 'cms:gather:save', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (38, 35, '采集删除', '', 0, '', NULL, '', NULL, 'cms:gather:delete', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (39, 35, '采集详情', '', 0, '', NULL, '', NULL, 'cms:gather:detail', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (40, 0, '功能管理', '', 0, '/extend', NULL, 'Operation', NULL, NULL, 'M', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (41, 40, '模型管理', 'model-index', 0, '/model', '@/views/cms/model/index.vue', '', NULL, 'cms:model:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (43, 41, '模型新增/修改', 'model-edit', 0, '/model/edit/:id?', '@/views/cms/model/edit.vue', '', NULL, 'cms:model:save', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (44, 41, '模型删除', '', 0, '', NULL, '', NULL, 'cms:model:delete', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (45, 41, '模型详情', '', 0, '', NULL, '', NULL, 'cms:model:detail', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (46, 41, '字段管理', 'field-index', 0, '/model/field', '@/views/cms/field/index.vue', '', NULL, 'cms:field:list', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (48, 46, '字段新增/修改', 'field-edit', 0, '/model/field/edit', '@/views/cms/field/edit.vue', '', NULL, 'cms:field:save', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (49, 46, '字段删除', '', 0, '', NULL, '', NULL, 'cms:field:delete', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (50, 46, '字段详情', '', 0, '', NULL, '', NULL, 'cms:field:detail', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (51, 4, '友情链接', 'friendlink-index', 0, '/friendlink', '@/views/cms/friendlink/index.vue', '', NULL, 'cms:friendlink:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (53, 51, '友链新增/修改', 'friendlink-edit', 0, '/friendlink/edit/:id?', '@/views/cms/friendlink/edit.vue', '', NULL, 'cms:friendlink:save', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (54, 51, '友链删除', '', 0, '', NULL, '', NULL, 'cms:friendlink:delete', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (55, 51, '友链详情', '', 0, '', NULL, '', NULL, 'cms:friendlink:detail', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (56, 4, '消息管理', 'message-index', 0, '/message', '@/views/cms/message/index.vue', '', NULL, 'cms:message:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (58, 56, '消息新增/修改', 'message-edit', 0, '/message/edit/:id?', '@/views/cms/message/edit.vue', '', NULL, 'cms:message:save', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (59, 56, '消息删除', '', 0, '', NULL, '', NULL, 'cms:message:delete', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (60, 56, '消息详情', '', 0, '', NULL, '', NULL, 'cms:message:detail', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (61, 0, '系统管理', '', 0, '/sys', '', 'Setting', NULL, NULL, 'M', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (62, 61, '用户管理', 'user-index', 0, '/user', '@/views/base/user/index.vue', '', NULL, 'base:user:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (63, 62, '用户新增', 'user-add', 0, '/user/add', '@/views/base/user/add.vue', '', NULL, 'base:user:create', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (64, 62, '用户修改', 'user-edit', 0, '/user/edit/:id', '@/views/base/user/edit.vue', '', NULL, 'base:user:update', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (65, 62, '用户删除', '', 0, '', NULL, '', NULL, 'base:user:delete', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (66, 62, '用户详情', '', 0, '', NULL, '', NULL, 'base:user:detail', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (67, 61, '角色管理', 'role-index', 0, '/role', '@/views/base/role/index.vue', '', NULL, 'base:role:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (68, 67, '角色新增', 'role-add', 0, '/role/add', '@/views/base/role/add.vue', '', NULL, 'base:role:create', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (69, 67, '角色编辑', 'role-edit', 0, '/role/edit/:id', '@/views/base/role/edit.vue', '', NULL, 'base:role:update', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (70, 67, '角色删除', '', 0, '', NULL, '', NULL, 'base:role:delete', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (71, 67, '角色详情', '', 0, '', NULL, '', NULL, 'base:role:detail', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (72, 61, '菜单管理', 'menu', 0, '/menu', '@/views/base/menu/index.vue', '', NULL, 'base:menu:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (73, 72, '菜单新增', '', 0, '', NULL, '', NULL, 'base:menu:create', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (74, 72, '菜单修改', '', 0, '', NULL, '', NULL, 'base:menu:update', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (75, 72, '菜单删除', '', 0, '', NULL, '', NULL, 'base:menu:delete', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (76, 72, '菜单详情', '', 0, '', NULL, '', NULL, 'base:menu:detail', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (78, 2, '站点更新', '', 0, '', '', '', NULL, 'cms:site:update', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (79, 61, '配置字典', 'configtype', 0, '/configtype', '@/views/base/config-type/index.vue', '', NULL, 'base:config-type:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (80, 79, '配置列表', 'config', 0, '/configtype/:id', '@/views/base/config/index.vue', '', NULL, 'base:config:list', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (81, 79, '字典新增', '', 0, '', '', '', NULL, 'base:config-type:create', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (82, 79, '字典修改', '', 0, '', '', '', NULL, 'base:config-type:update', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (83, 79, '字典删除', '', 0, '', '', '', NULL, 'base:config-type:delete', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (84, 79, '字典查询', '', 0, '', '', '', NULL, 'base:config-type:detail', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (85, 80, '新增配置', '', 0, '', '', '', NULL, 'base:config:create', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (86, 80, '配置修改', '', 0, '', '', '', NULL, 'base:config:update', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (87, 80, '配置删除', '', 0, '', '', '', NULL, 'base:config:delete', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (88, 80, '配置查询', '', 0, '', '', '', NULL, 'base:config:list', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (89, 0, '资源管理', 'resource', 0, '/resource', '', 'Postcard', NULL, '', 'M', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (90, 89, '前端模板', 'template', 0, '/template', '@/views/vip/codeEditor/index.vue', '', NULL, 'vip:v1:file:tree', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (91, 90, '模板更新', 'template-edit', 0, '', '', '', NULL, 'vip:v1:file:save', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (92, 89, '附件管理', 'oss', 0, '/oss', '@/views/vip/oss.vue', '', NULL, 'oss:local:oss', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (93, 72, '全部菜单', '', 0, '', NULL, '', NULL, 'base:menu:allRouter', 'I', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (94, 5, '栏目ID查找', '', 0, '', '', '', NULL, 'cms:category:findId', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (95, 5, '子栏目ID查找', '', 0, '', '', '', NULL, 'cms:category:findSubId', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (96, 5, '栏目搜索', '', 0, '', '', '', NULL, 'cms:category:search', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (97, 10, '文章列表', '', 0, '', '', '', NULL, 'cms:article:list', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (98, 10, '文章统计', '', 0, '', '', '', NULL, 'cms:article:statistics', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (99, 10, '查找字段', '', 0, '', '', '', NULL, 'cms:article:findField', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (100, 10, '文章搜索', '', 0, '', '', '', NULL, 'cms:article:search', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (103, 41, '模型使用情况', '', 0, '', '', '', NULL, 'cms:model:hasUse', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (104, 46, '字段列表', '', 0, '', '', '', NULL, 'cms:field:list', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (105, 25, '碎片列表', '', 0, '', '', '', NULL, 'cms:frag:list', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (106, 25, '碎片搜索', '', 0, '', '', '', NULL, 'cms:frag:search', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (107, 20, '标签列表', '', 0, '', '', '', NULL, 'cms:tag:list', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (108, 20, '标签检查', '', 0, '', '', '', NULL, 'cms:tag:has', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (109, 20, '标签搜索', '', 0, '', '', '', NULL, 'cms:tag:search', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (110, 51, '友情链接列表', '', 0, '', '', '', NULL, 'cms:friendlink:list', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (111, 56, '留言列表', '', 0, '', '', '', NULL, 'cms:message:list', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (112, 56, '留言搜索', '', 0, '', '', '', NULL, 'cms:message:search', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (113, 15, '轮播列表', '', 0, '', '', '', NULL, 'cms:slide:list', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (114, 15, '轮播搜索', '', 0, '', '', '', NULL, 'cms:slide:search', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (115, 30, '获取页面', '', 0, '', '', '', NULL, 'cms:collect:getPages', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (116, 30, '获取采集文章', '', 0, '', '', '', NULL, 'cms:collect:getArticle', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (117, 30, '采集搜索', '', 0, '', '', '', NULL, 'cms:collect:search', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (118, 35, '获取接口文章', '', 0, '', '', '', NULL, 'cms:gather:getArticle', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (119, 35, '接口采集列表', '', 0, '', '', '', NULL, 'cms:gather:list', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (120, 35, '接口采集搜索', '', 0, '', '', '', NULL, 'cms:gather:search', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (121, 77, '创建登录日志', '', 0, '', '', '', NULL, 'cms:loginLog:create', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (122, 77, '删除登录日志', '', 0, '', '', '', NULL, 'cms:loginLog:delete', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (124, 62, '用户角色详情', '', 0, '', '', '', NULL, 'base:userRole:detail', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (125, 67, '角色菜单列表', '', 0, '', '', '', NULL, 'base:roleMenu:list', 'I', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (126, 80, '配置获取列表', '', 0, '', '', '', NULL, 'base:config:getlist', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (127, 80, '配置批量更新', '', 0, '', '', '', NULL, 'base:config:updateMany', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (129, 67, '角色列表', '', 0, '', '', '', NULL, 'base:role:list', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (130, 92, '上传Logo', '', 0, '', '', '', NULL, 'oss:local:logo', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (131, 92, '上传多图片', '', 0, '', '', '', NULL, 'oss:local:imgs', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (132, 92, '上传文件', '', 0, '', '', '', NULL, 'oss:local:files', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (133, 2, '运行环境', '', 0, '', '', '', NULL, 'cms:site:runEnv', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (134, 2, '系统应用查找', '', 0, '', '', '', NULL, 'cms:sysApp:find', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (135, 2, '系统应用视图', '', 0, '', '', '', NULL, 'cms:sysApp:views', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (136, 2, '系统应用文件夹', '', 0, '', '', '', NULL, 'cms:sysApp:folder', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (137, 2, '系统应用更新', '', 0, '', '', '', NULL, 'cms:sysApp:update', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (138, 72, '菜单列表', '', 0, '', '', '', NULL, 'base:menu:list', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (139, 79, '配置类型详情', '', 0, '', '', '', NULL, 'base:config-type:detail', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (140, 80, '配置详情', '', 0, '', '', '', NULL, 'base:config:detail', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (141, 90, '模板内容', '', 0, '', '', '', NULL, 'vip:v1:file:content', 'I', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (142, 92, '删除文件', '', 0, '', '', '', NULL, 'oss:local:delete', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (143, 92, '解压文件', '', 0, '', '', '', NULL, 'oss:local:extract', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (144, 92, '复制文件', '', 0, '', '', '', NULL, 'oss:local:copy', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (145, 92, '移动文件', '', 0, '', '', '', NULL, 'oss:local:move', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (146, 92, '重命名', '', 0, '', '', '', NULL, 'oss:local:rename', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (147, 0, '会员管理', '', 0, '/member', '', 'User', NULL, '', 'M', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (148, 152, '会员列表查询', '', 0, '', '', '', NULL, 'member:v1:list', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (149, 152, '会员搜索', '', 0, '', '', '', NULL, 'member:v1:search', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (150, 152, '会员详情', '', 0, '', '', '', NULL, 'member:v1:adminDetail', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (151, 152, '会员状态更新', '', 0, '', '', '', NULL, 'member:v1:updateStatus', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (152, 147, '会员列表', 'user-list', 0, '/user-list', '@/views/cms/user-list/index.vue', '', NULL, 'member:v1:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (153, 152, '会员信息更新', '', 0, '', '', '', NULL, 'member:v1:adminUpdateUser', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (154, 30, '采集列表', '', 0, '', '', '', NULL, 'cms:collect:list', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (155, 147, '评论列表', 'comment-page', 6, '/comment', '@/views/vip/comment/index.vue', '', NULL, 'member:v1:comment:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (156, 155, '评论列表查询', '', 0, '', '', '', NULL, 'member:v1:comment:list', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (157, 155, '评论审核', '', 0, '', '', '', NULL, 'member:v1:comment:audit', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (158, 155, '评论删除', '', 0, '', '', '', NULL, 'member:v1:comment:delete', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (159, 147, '收藏列表', 'favorite-page', 7, '/favorite', '@/views/vip/favorite/index.vue', '', NULL, 'member:v1:favorite:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (160, 159, '收藏列表查询', '', 0, '', '', '', NULL, 'member:v1:favorite:list', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (161, 159, '收藏删除', '', 0, '', '', '', NULL, 'member:v1:favorite:delete', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (162, 92, '文件列表', '', 0, '', '', '', NULL, 'vip:v1:file:oss', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (163, 92, '创建文件夹', '', 0, '', '', '', NULL, 'oss:local:createFolder', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (164, 92, '压缩文件', '', 0, '', '', '', NULL, 'oss:local:compress', 'F', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (170, 92, '七牛云-单个上传', '', 0, '', '', '', NULL, 'oss:qiniu:upload', 'I', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (171, 92, '七牛云-token', '', 0, '', '', '', NULL, 'oss:qiniu:getUploadToken', 'I', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (172, 92, '阿里云-单个上传', '', 0, '', '', '', NULL, 'oss:aliyun:upload', 'I', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (173, 92, '七牛云-多个上传', '', 0, '', '', '', NULL, 'oss:qiniu:imgs', 'I', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (174, 92, '阿里云-多个上传', '', 0, '', '', '', NULL, 'oss:aliyun:imgs', 'I', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (175, 61, '操作日志', 'operlog', 0, '/operlog', '@/views/base/operLog/index.vue', '', NULL, 'base:operLog:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (176, 61, '权限管理', 'permission', 0, '/permission', '@/views/base/permission/index.vue', '', NULL, 'base:permission:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (177, 176, '权限新增', '', 0, '', '', '', NULL, 'base:permission:create', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (178, 176, '权限修改', '', 0, '', '', '', NULL, 'base:permission:update', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (179, 176, '权限删除', '', 0, '', '', '', NULL, 'base:permission:delete', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (180, 176, '权限详情', '', 0, '', '', '', NULL, 'base:permission:detail', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (181, 176, '权限列表', '', 0, '', '', '', NULL, 'base:permission:list', 'F', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (182, 176, '全部权限', '', 0, '', '', '', NULL, 'base:permission:all', 'I', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (189, 4, '专题管理', 'special-index', 9, '/special', '@/views/cms/special/index.vue', '', NULL, 'cms:special:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (190, 4, '单页管理', 'page-index', 3, '/page', '@/views/cms/page/index.vue', '', NULL, 'cms:article:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (191, 61, '接口权限', 'permission-route', 5, '/permission/route', '@/views/base/permission/route.vue', '', NULL, 'base:permission:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (192, 61, '权限资源', 'permission-resource', 6, '/permission/resource', '@/views/base/permission/resource.vue', '', NULL, 'base:permission:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (195, 40, '统计分析', 'stat-dashboard', 90, '/stat/dashboard', '@/views/stat/dashboard/index.vue', 'TrendCharts', NULL, 'stat:report:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '站点统计（全球地图/排行/导出）');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (196, 61, '定时任务', 'task-index', 90, '/task', '@/views/system/task/index.vue', 'Timer', NULL, 'base:task:list', 'C', '2', '2', '1', NULL, '', NULL, '', NULL, '通用定时任务管理');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (197, 190, '单页新增/修改', 'page-edit', 0, '/page/edit/:id?', '@/views/cms/page/edit.vue', '', NULL, 'cms:article:create', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (198, 189, '专题新增/修改', 'special-edit', 0, '/special/edit/:id?', '@/views/cms/special/edit.vue', '', NULL, 'cms:special:create', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` (`id`, `pid`, `title`, `name`, `order_num`, `path`, `component`, `icon`, `query`, `perms`, `type`, `is_frame`, `is_cache`, `is_show`, `status`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (199, 62, '用户详情', 'user-detail', 0, '/user/detail/:id', '@/views/base/user/detail.vue', '', NULL, 'base:user:list', 'C', '2', '2', '2', NULL, '', NULL, '', NULL, '用户详情/个人中心：看自己→改密码；超管看别人→编辑资料');
COMMIT;

-- ----------------------------
-- Table structure for sys_notice
-- ----------------------------
DROP TABLE IF EXISTS `sys_notice`;
CREATE TABLE `sys_notice` (
  `id` int(4) NOT NULL AUTO_INCREMENT COMMENT '公告ID',
  `title` varchar(50) NOT NULL COMMENT '公告标题',
  `type` char(1) NOT NULL COMMENT '公告类型（1通知 2公告）',
  `content` longtext COMMENT '公告内容',
  `status` char(1) DEFAULT NULL COMMENT '公告状态（0关闭  1正常）',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='通知公告表';

-- ----------------------------
-- Records of sys_notice
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_oper_log
-- ----------------------------
DROP TABLE IF EXISTS `sys_oper_log`;
CREATE TABLE `sys_oper_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '日志主键',
  `title` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '操作模块',
  `business_type` tinyint(2) DEFAULT '0' COMMENT '业务类型（0其它 1新增 2修改 3删除）',
  `method` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '请求方法',
  `request_method` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '请求方式',
  `operator_type` tinyint(1) DEFAULT '0' COMMENT '操作类别（0其它 1后台用户 2手机端用户 3登录）',
  `user_id` bigint(20) DEFAULT NULL COMMENT '操作用户ID',
  `oper_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '操作人员',
  `oper_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '请求URL',
  `oper_ip` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '操作IP',
  `oper_param` text COLLATE utf8mb4_unicode_ci COMMENT '请求参数',
  `json_result` text COLLATE utf8mb4_unicode_ci COMMENT '返回结果',
  `country` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '国家',
  `prov` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '省',
  `city` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '市',
  `district` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '区',
  `isp` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '网络提供商',
  `lat` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '纬度',
  `lng` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '经度',
  `status` tinyint(1) DEFAULT '1' COMMENT '操作状态（0异常 1正常）',
  `error_msg` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '错误消息',
  `oper_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_oper_time` (`oper_time`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1047 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='操作日志记录';

-- ----------------------------
-- Records of sys_oper_log
-- ----------------------------
BEGIN;
INSERT INTO `sys_oper_log` (`id`, `title`, `business_type`, `method`, `request_method`, `operator_type`, `user_id`, `oper_name`, `oper_url`, `oper_ip`, `oper_param`, `json_result`, `country`, `prov`, `city`, `district`, `isp`, `lat`, `lng`, `status`, `error_msg`, `oper_time`) VALUES (1035, 'operLog', 1, '/base/operLog/clear', 'POST', 1, NULL, 'chancms', '/base/operLog/clear', '127.0.0.1', '', '{\"success\":true,\"code\":0,\"msg\":\"清空成功\",\"data\":{}}', '内网', '内网', '内网', NULL, '内网', NULL, NULL, 1, '', '2026-09-17 22:30:52');
INSERT INTO `sys_oper_log` (`id`, `title`, `business_type`, `method`, `request_method`, `operator_type`, `user_id`, `oper_name`, `oper_url`, `oper_ip`, `oper_param`, `json_result`, `country`, `prov`, `city`, `district`, `isp`, `lat`, `lng`, `status`, `error_msg`, `oper_time`) VALUES (1036, 'permission', 1, '/base/permission/route/update', 'POST', 1, NULL, 'admin', '/base/permission/route/update', '127.0.0.1', '{\"id\":9401,\"perm_code\":\"stat:report:list\"}', '{\"success\":false,\"code\":1003,\"msg\":\"暂无权限\",\"data\":null}', '内网', '内网', '内网', NULL, '内网', NULL, NULL, 0, '暂无权限', '2026-09-17 22:58:14');
INSERT INTO `sys_oper_log` (`id`, `title`, `business_type`, `method`, `request_method`, `operator_type`, `user_id`, `oper_name`, `oper_url`, `oper_ip`, `oper_param`, `json_result`, `country`, `prov`, `city`, `district`, `isp`, `lat`, `lng`, `status`, `error_msg`, `oper_time`) VALUES (1037, '用户登录', 0, '', 'POST', 3, 2, 'chancms', '/base/user/login', '127.0.0.1', '{\"userId\":2,\"username\":\"chancms\",\"ip\":\"127.0.0.1\"}', '登录成功', '内网', '内网', '内网', NULL, '内网', NULL, NULL, 1, '', '2026-09-22 08:59:56');
INSERT INTO `sys_oper_log` (`id`, `title`, `business_type`, `method`, `request_method`, `operator_type`, `user_id`, `oper_name`, `oper_url`, `oper_ip`, `oper_param`, `json_result`, `country`, `prov`, `city`, `district`, `isp`, `lat`, `lng`, `status`, `error_msg`, `oper_time`) VALUES (1038, 'category', 1, '/cms/category/update', 'POST', 1, NULL, 'chancms', '/cms/category/update', '127.0.0.1', '{\"pid\":2,\"seoTitle\":\"\",\"seoKeywords\":\"\",\"seoDescription\":\"\",\"name\":\"文档\",\"path\":\"/art2/doc\",\"slug\":\"doc\",\"mid\":0,\"page_mid\":0,\"description\":\"\",\"url\":\"\",\"orderBy\":0,\"type\":0,\"content_type\":\"article\",\"target\":0,\"status\":0,\"articleView\":\"article.html\",\"listView\":\"list.html\",\"dataConfig\":\"{}\",\"image\":\"\",\"aigeo\":\"{\\n  \\\"title\\\": \\\"seo\\\"\\n}\",\"id\":8,\"is_dir\":0,\"ext_data\":{},\"page_ext_data\":{}}', '', '内网', '内网', '内网', NULL, '内网', NULL, NULL, 1, '', '2026-09-22 09:23:07');
INSERT INTO `sys_oper_log` (`id`, `title`, `business_type`, `method`, `request_method`, `operator_type`, `user_id`, `oper_name`, `oper_url`, `oper_ip`, `oper_param`, `json_result`, `country`, `prov`, `city`, `district`, `isp`, `lat`, `lng`, `status`, `error_msg`, `oper_time`) VALUES (1039, 'product', 1, '/cms/product/update', 'POST', 1, NULL, 'chancms', '/cms/product/update', '127.0.0.1', '{\"id\":1,\"cid\":1004,\"title\":\"OMM系列摆线液压马达\",\"cover\":\"/public/cover/02.jpg\",\"gallery\":[{\"url\":\"/public/cover/02.jpg\",\"description\":\"\"}],\"price\":\"1200.00\",\"original_price\":\"1500.00\",\"sku\":\"OMM-100\",\"stock\":200,\"unit\":\"台\",\"brand\":\"Blince\",\"sort\":1,\"status\":\"0\",\"content\":\"<p>OMM 系列摆线液压马达结构紧凑、起动扭矩大，适用于塑料机械、工程机械、农业装备等液压传动系统。</p>\",\"mid\":0,\"slug\":\"omm-orbital-hydraulic-motor\",\"pv\":128,\"create_time\":\"2026-09-11 18:15:43\",\"update_time\":\"2026-09-22 09:04:30\",\"ext_data\":{\"speed\":\"1800rpm\",\"material\":\"铸铁\",\"pressure\":\"16MPa\"}}', '', '内网', '内网', '内网', NULL, '内网', NULL, NULL, 1, '', '2026-09-22 09:23:42');
INSERT INTO `sys_oper_log` (`id`, `title`, `business_type`, `method`, `request_method`, `operator_type`, `user_id`, `oper_name`, `oper_url`, `oper_ip`, `oper_param`, `json_result`, `country`, `prov`, `city`, `district`, `isp`, `lat`, `lng`, `status`, `error_msg`, `oper_time`) VALUES (1040, 'article', 1, '/cms/article/update', 'POST', 1, NULL, 'chancms', '/cms/article/update', '127.0.0.1', '{\"id\":1,\"cid\":11,\"subCid\":\"\",\"title\":\"ChanCMS内容管理系统\",\"shortTitle\":\"\",\"tagId\":\"2,4,10\",\"attr\":\"top\",\"articleView\":\"\",\"source\":\"\",\"description\":\"ChanCMS是一款基于Node、Express、MySQL、Vue3研发的高质量实用型CMS系统。轻量、灵活、稳定、高性能、易扩展，让开发更简单。\",\"img\":\"\",\"created_at\":\"2024-09-13 14:49:28\",\"updated_at\":\"2024-09-13T06:49:28.000Z\",\"content\":\"<p>ChanCMS是一款基于Node、Express、MySQL、Vue3研发的高质量实用型CMS系统。轻量、灵活、稳定、高性能、易扩展，让开发更简单。</p>\\n<ul>\\n<li>自研。基于自研chanjs轻量级mvc框架实现，轻量、灵活、稳定、高性能、可持续。</li>\\n<li>SEO。专注于<code>seo</code>,伪静态<code>html</code>和拼音导航，灵活设置关键词和描述。</li>\\n<li>安全。基于<code>knex</code>,高防<code>sql</code>注入，接口权限校验，为安全提供保障。</li>\\n<li>灵活。碎片功能，支持零碎文案配置，方便各类灵活文案配置。</li>\\n<li>高扩展。支持扩展模型，字段配置，可动态生成表，超强扩展。</li>\\n<li>模块化。一切模块相互独立，互不干扰。</li>\\n<li>插件化。灵活开发，支持完整功能模块。</li>\\n<li>无头cms，为多端提供接口支持。</li>\\n</ul>\",\"status\":\"0\",\"pv\":147,\"link\":\"\",\"allowScript\":0,\"editorType\":\"rich\",\"mid\":0,\"user_id\":null,\"code\":null,\"oldTagId\":\"2,4,10\",\"ext_data\":{}}', '', '内网', '内网', '内网', NULL, '内网', NULL, NULL, 1, '', '2026-09-22 09:24:11');
INSERT INTO `sys_oper_log` (`id`, `title`, `business_type`, `method`, `request_method`, `operator_type`, `user_id`, `oper_name`, `oper_url`, `oper_ip`, `oper_param`, `json_result`, `country`, `prov`, `city`, `district`, `isp`, `lat`, `lng`, `status`, `error_msg`, `oper_time`) VALUES (1041, 'message', 1, '/cms/message/create', 'POST', 1, NULL, '', '/cms/message/create', '127.0.0.1', '{\"name\":\"邮件格式验证\",\"company\":\"ChanCMS\",\"content\":\"【测试】留言邮件归属地格式验证（来源：省市 · IP），请忽略\"}', '', '内网', '内网', '内网', NULL, '内网', NULL, NULL, 1, '', '2026-09-22 11:46:44');
INSERT INTO `sys_oper_log` (`id`, `title`, `business_type`, `method`, `request_method`, `operator_type`, `user_id`, `oper_name`, `oper_url`, `oper_ip`, `oper_param`, `json_result`, `country`, `prov`, `city`, `district`, `isp`, `lat`, `lng`, `status`, `error_msg`, `oper_time`) VALUES (1042, 'message', 1, '/cms/message/create', 'POST', 1, NULL, '', '/cms/message/create', '127.0.0.1', '{\"name\":\"归属地验证\",\"company\":\"ChanCMS\",\"content\":\"【测试】IP后拼接归属地格式验证，请忽略\"}', '', '内网', '内网', '内网', NULL, '内网', NULL, NULL, 1, '', '2026-09-22 11:51:54');
INSERT INTO `sys_oper_log` (`id`, `title`, `business_type`, `method`, `request_method`, `operator_type`, `user_id`, `oper_name`, `oper_url`, `oper_ip`, `oper_param`, `json_result`, `country`, `prov`, `city`, `district`, `isp`, `lat`, `lng`, `status`, `error_msg`, `oper_time`) VALUES (1043, 'permission', 1, '/base/permission/sync', 'POST', 1, NULL, 'chancms', '/base/permission/sync', '127.0.0.1', '', '', '内网', '内网', '内网', NULL, '内网', NULL, NULL, 1, '', '2026-09-22 15:37:52');
INSERT INTO `sys_oper_log` (`id`, `title`, `business_type`, `method`, `request_method`, `operator_type`, `user_id`, `oper_name`, `oper_url`, `oper_ip`, `oper_param`, `json_result`, `country`, `prov`, `city`, `district`, `isp`, `lat`, `lng`, `status`, `error_msg`, `oper_time`) VALUES (1044, '用户登录', 0, '', 'POST', 3, 2, 'chancms', '/base/user/login', '127.0.0.1', '{\"userId\":2,\"username\":\"chancms\",\"ip\":\"127.0.0.1\"}', '登录成功', '内网', '内网', '内网', NULL, '内网', NULL, NULL, 1, '', '2026-09-23 11:23:06');
INSERT INTO `sys_oper_log` (`id`, `title`, `business_type`, `method`, `request_method`, `operator_type`, `user_id`, `oper_name`, `oper_url`, `oper_ip`, `oper_param`, `json_result`, `country`, `prov`, `city`, `district`, `isp`, `lat`, `lng`, `status`, `error_msg`, `oper_time`) VALUES (1045, 'user', 1, '/base/user/logout', 'POST', 1, NULL, '', '/base/user/logout', '127.0.0.1', '', '', '内网', '内网', '内网', NULL, '内网', NULL, NULL, 0, 'HTTP 401', '2026-09-24 22:39:47');
INSERT INTO `sys_oper_log` (`id`, `title`, `business_type`, `method`, `request_method`, `operator_type`, `user_id`, `oper_name`, `oper_url`, `oper_ip`, `oper_param`, `json_result`, `country`, `prov`, `city`, `district`, `isp`, `lat`, `lng`, `status`, `error_msg`, `oper_time`) VALUES (1046, '用户登录', 0, '', 'POST', 3, 2, 'chancms', '/base/user/login', '127.0.0.1', '{\"userId\":2,\"username\":\"chancms\",\"ip\":\"127.0.0.1\"}', '密码错误', '内网', '内网', '内网', NULL, '内网', NULL, NULL, 0, '', '2026-09-26 19:43:12');
COMMIT;

-- ----------------------------
-- Table structure for sys_perm_module
-- ----------------------------
DROP TABLE IF EXISTS `sys_perm_module`;
CREATE TABLE `sys_perm_module` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '模块标识(权限码前缀:cms/base/oss/book/vip/member)',
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分组名(对齐一级菜单)',
  `sort` int(11) DEFAULT '0' COMMENT '排序',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_module` (`module`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限树-模块分组';

-- ----------------------------
-- Records of sys_perm_module
-- ----------------------------
BEGIN;
INSERT INTO `sys_perm_module` (`id`, `module`, `name`, `sort`) VALUES (1, 'cms', '内容管理', 0);
INSERT INTO `sys_perm_module` (`id`, `module`, `name`, `sort`) VALUES (2, 'base', '系统管理', 1);
INSERT INTO `sys_perm_module` (`id`, `module`, `name`, `sort`) VALUES (3, 'oss', '资源管理', 2);
INSERT INTO `sys_perm_module` (`id`, `module`, `name`, `sort`) VALUES (4, 'book', '书籍管理', 3);
INSERT INTO `sys_perm_module` (`id`, `module`, `name`, `sort`) VALUES (5, 'vip', '前端模板', 4);
INSERT INTO `sys_perm_module` (`id`, `module`, `name`, `sort`) VALUES (6, 'member', '会员管理', 5);
INSERT INTO `sys_perm_module` (`id`, `module`, `name`, `sort`) VALUES (7, 'stat', '统计分析', 6);
INSERT INTO `sys_perm_module` (`id`, `module`, `name`, `sort`) VALUES (9, 'wechat', '微信模块', 7);
COMMIT;

-- ----------------------------
-- Table structure for sys_perm_resource
-- ----------------------------
DROP TABLE IF EXISTS `sys_perm_resource`;
CREATE TABLE `sys_perm_resource` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所属模块(权限码前缀)',
  `resource_key` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资源key(权限码中段:cms:article:list 的 article)',
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资源显示名(对齐菜单)',
  `actions` json DEFAULT NULL COMMENT '可勾选动作数组 [list,create,update,delete]',
  `menu_id` int(11) DEFAULT '0' COMMENT '关联菜单ID(阶段三挂菜单用)',
  `sort` int(11) DEFAULT '0' COMMENT '排序',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_module_resource` (`module`,`resource_key`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限树-资源';

-- ----------------------------
-- Records of sys_perm_resource
-- ----------------------------
BEGIN;
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (1, 'cms', 'site', '站点设置', '[\"list\", \"update\"]', 3, 0, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (2, 'cms', 'category', '栏目管理', '[\"list\", \"create\", \"update\", \"delete\"]', 5, 1, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (3, 'cms', 'article', '文章管理', '[\"list\", \"create\", \"update\", \"delete\"]', 10, 2, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (4, 'cms', 'slide', '轮播管理', '[\"list\", \"create\", \"update\", \"delete\"]', 15, 3, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (5, 'cms', 'tag', '标签管理', '[\"list\", \"create\", \"update\", \"delete\"]', 20, 4, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (6, 'cms', 'frag', '碎片管理', '[\"list\", \"create\", \"update\", \"delete\"]', 25, 5, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (7, 'cms', 'friendlink', '友情链接', '[\"list\", \"create\", \"update\", \"delete\"]', 51, 6, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (8, 'cms', 'message', '消息管理', '[\"list\", \"update\", \"delete\"]', 56, 7, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (9, 'cms', 'special', '专题管理', '[\"list\", \"create\", \"update\", \"delete\"]', 189, 8, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (10, 'cms', 'collect', '页面采集', '[\"list\", \"create\", \"update\", \"delete\"]', 30, 9, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (11, 'cms', 'gather', '接口采集', '[\"list\", \"create\", \"update\", \"delete\"]', 35, 10, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (12, 'cms', 'model', '模型管理', '[\"list\", \"create\", \"update\", \"delete\"]', 41, 11, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (13, 'cms', 'field', '字段管理', '[\"list\", \"create\", \"update\", \"delete\"]', 46, 12, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (14, 'base', 'user', '用户管理', '[\"list\", \"create\", \"update\", \"delete\"]', 62, 0, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (15, 'base', 'userRole', '用户角色分配', '[\"list\"]', 62, 1, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (16, 'base', 'role', '角色管理', '[\"list\", \"create\", \"update\", \"delete\"]', 67, 2, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (17, 'base', 'roleMenu', '角色菜单分配', '[\"list\"]', 67, 3, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (18, 'base', 'menu', '菜单管理', '[\"list\", \"create\", \"update\", \"delete\"]', 72, 4, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (19, 'base', 'configType', '配置字典', '[\"list\", \"create\", \"update\", \"delete\"]', 79, 5, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (20, 'base', 'config', '配置列表', '[\"list\", \"create\", \"update\", \"delete\"]', 80, 6, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (21, 'base', 'operLog', '操作日志', '[\"list\", \"delete\"]', 175, 7, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (22, 'base', 'permission', '权限管理', '[\"list\", \"create\", \"update\", \"delete\"]', 191, 8, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (23, 'oss', 'file', '附件管理', '[\"list\", \"create\", \"delete\"]', 92, 0, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (27, 'vip', 'code', '模板文件', '[\"list\", \"update\"]', 90, 0, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (28, 'member', 'user', '会员列表', '[\"list\", \"update\", \"delete\"]', 152, 0, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (31, 'stat', 'report', '统计报表', '[\"list\", \"export\"]', 195, 0, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (32, 'base', 'task', '定时任务', '[\"list\", \"update\", \"run\", \"delete\", \"create\", \"scan\"]', 196, 0, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (33, 'base', 'dept', '部门管理', '[\"list\", \"create\", \"update\", \"delete\"]', 61, 0, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (34, 'base', 'dict', '字典管理', '[\"list\", \"create\", \"update\", \"delete\"]', 61, 0, '2026-09-24 22:02:44');
INSERT INTO `sys_perm_resource` (`id`, `module`, `resource_key`, `name`, `actions`, `menu_id`, `sort`, `created_at`) VALUES (35, 'base', 'online', '在线用户', '[\"list\", \"create\", \"update\", \"delete\"]', 61, 0, '2026-09-24 22:02:44');
COMMIT;

-- ----------------------------
-- Table structure for sys_perm_route
-- ----------------------------
DROP TABLE IF EXISTS `sys_perm_route`;
CREATE TABLE `sys_perm_route` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `method` varchar(10) NOT NULL DEFAULT 'GET',
  `path` varchar(255) NOT NULL,
  `perm_code` varchar(100) NOT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_method_path` (`method`,`path`)
) ENGINE=InnoDB AUTO_INCREMENT=290 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of sys_perm_route
-- ----------------------------
BEGIN;
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (1, 'GET', '/cms/site/appInfo', 'cms:site:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (2, 'GET', '/cms/site/info', 'cms:site:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (3, 'POST', '/cms/site/update', 'cms:site:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (4, 'GET', '/cms/site/runEnv', 'cms:site:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (5, 'GET', '/cms/category/find', 'cms:category:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (6, 'GET', '/cms/category/findId', 'cms:category:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (7, 'GET', '/cms/category/findSubId', 'cms:category:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (8, 'GET', '/cms/category/search', 'cms:category:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (9, 'POST', '/cms/category/delete', 'cms:category:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (10, 'POST', '/cms/category/update', 'cms:category:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (11, 'POST', '/cms/category/create', 'cms:category:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (12, 'GET', '/cms/article/list', 'cms:article:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (13, 'GET', '/cms/article/statistics', 'cms:article:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (14, 'GET', '/cms/article/search', 'cms:article:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (15, 'GET', '/cms/article/detail', 'cms:article:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (16, 'GET', '/cms/article/findField', 'cms:article:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (17, 'POST', '/cms/article/create', 'cms:article:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (18, 'POST', '/cms/article/delete', 'cms:article:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (19, 'POST', '/cms/article/update', 'cms:article:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (20, 'GET', '/cms/model/list', 'cms:model:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (21, 'GET', '/cms/model/search', 'cms:model:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (22, 'GET', '/cms/model/detail', 'cms:model:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (23, 'GET', '/cms/model/hasUse', 'cms:model:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (24, 'POST', '/cms/model/create', 'cms:model:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (25, 'POST', '/cms/model/delete', 'cms:model:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (26, 'POST', '/cms/model/update', 'cms:model:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (27, 'GET', '/cms/field/list', 'cms:field:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (28, 'GET', '/cms/field/findByMid', 'cms:field:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (29, 'GET', '/cms/field/detail', 'cms:field:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (30, 'POST', '/cms/field/create', 'cms:field:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (31, 'POST', '/cms/field/delete', 'cms:field:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (32, 'POST', '/cms/field/update', 'cms:field:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (33, 'GET', '/cms/frag/list', 'cms:frag:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (34, 'GET', '/cms/frag/search', 'cms:frag:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (35, 'GET', '/cms/frag/detail', 'cms:frag:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (36, 'POST', '/cms/frag/create', 'cms:frag:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (37, 'POST', '/cms/frag/delete', 'cms:frag:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (38, 'POST', '/cms/frag/update', 'cms:frag:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (39, 'GET', '/cms/tag/list', 'cms:tag:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (40, 'POST', '/cms/tag/create', 'cms:tag:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (41, 'GET', '/cms/tag/detail', 'cms:tag:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (42, 'GET', '/cms/tag/has', 'cms:tag:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (43, 'GET', '/cms/tag/search', 'cms:tag:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (44, 'POST', '/cms/tag/delete', 'cms:tag:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (45, 'POST', '/cms/tag/update', 'cms:tag:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (46, 'GET', '/cms/friendlink/list', 'cms:friendlink:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (47, 'GET', '/cms/friendlink/detail', 'cms:friendlink:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (48, 'POST', '/cms/friendlink/create', 'cms:friendlink:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (49, 'POST', '/cms/friendlink/delete', 'cms:friendlink:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (50, 'POST', '/cms/friendlink/update', 'cms:friendlink:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (51, 'GET', '/cms/message/list', 'cms:message:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (52, 'GET', '/cms/message/search', 'cms:message:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (53, 'GET', '/cms/message/detail', 'cms:message:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (54, 'POST', '/cms/message/delete', 'cms:message:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (55, 'POST', '/cms/message/update', 'cms:message:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (56, 'GET', '/cms/slide/list', 'cms:slide:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (57, 'GET', '/cms/slide/search', 'cms:slide:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (58, 'GET', '/cms/slide/detail', 'cms:slide:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (59, 'POST', '/cms/slide/create', 'cms:slide:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (60, 'POST', '/cms/slide/delete', 'cms:slide:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (61, 'POST', '/cms/slide/update', 'cms:slide:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (62, 'POST', '/cms/collect/getHtml', 'cms:collect:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (63, 'GET', '/cms/collect/list', 'cms:collect:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (64, 'GET', '/cms/collect/search', 'cms:collect:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (65, 'GET', '/cms/collect/detail', 'cms:collect:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (66, 'POST', '/cms/collect/create', 'cms:collect:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (67, 'POST', '/cms/collect/delete', 'cms:collect:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (68, 'POST', '/cms/collect/update', 'cms:collect:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (69, 'GET', '/cms/gather/getArticle', 'cms:gather:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (70, 'GET', '/cms/gather/list', 'cms:gather:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (71, 'GET', '/cms/gather/search', 'cms:gather:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (72, 'GET', '/cms/gather/detail', 'cms:gather:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (73, 'POST', '/cms/gather/create', 'cms:gather:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (74, 'POST', '/cms/gather/delete', 'cms:gather:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (75, 'POST', '/cms/gather/update', 'cms:gather:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (76, 'GET', '/cms/special/list', 'cms:special:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (77, 'GET', '/cms/special/detail', 'cms:special:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (78, 'POST', '/cms/special/create', 'cms:special:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (79, 'POST', '/cms/special/update', 'cms:special:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (80, 'POST', '/cms/special/delete', 'cms:special:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (81, 'POST', '/cms/special/articles', 'cms:special:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (82, 'GET', '/cms/special/article/search', 'cms:special:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (83, 'GET', '/base/menu/list', 'base:menu:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (84, 'POST', '/base/menu/create', 'base:menu:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (85, 'POST', '/base/menu/update', 'base:menu:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (86, 'POST', '/base/menu/delete', 'base:menu:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (87, 'GET', '/base/role/list', 'base:role:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (88, 'GET', '/base/role/detail', 'base:role:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (89, 'POST', '/base/role/create', 'base:role:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (90, 'POST', '/base/role/update', 'base:role:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (91, 'POST', '/base/role/delete', 'base:role:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (92, 'GET', '/base/roleMenu/list', 'base:roleMenu:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (93, 'GET', '/base/permission/detail', 'base:permission:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (94, 'POST', '/base/permission/create', 'base:permission:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (95, 'POST', '/base/permission/update', 'base:permission:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (96, 'POST', '/base/permission/delete', 'base:permission:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (97, 'POST', '/base/permission/sync', 'base:permission:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (98, 'POST', '/base/user/logout', 'base:user:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (99, 'GET', '/base/user/list', 'base:user:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (100, 'GET', '/base/user/detail', 'base:user:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (101, 'POST', '/base/user/create', 'base:user:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (102, 'POST', '/base/user/update', 'base:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (103, 'POST', '/base/user/delete', 'base:user:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (104, 'GET', '/base/userRole/detail', 'base:userRole:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (105, 'GET', '/base/operLog/list', 'base:operLog:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (106, 'POST', '/base/operLog/delete', 'base:operLog:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (107, 'POST', '/base/operLog/clear', 'base:operLog:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (108, 'GET', '/base/config-type/list', 'base:configType:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (109, 'GET', '/base/config-type/detail', 'base:configType:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (110, 'POST', '/base/config-type/create', 'base:configType:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (111, 'POST', '/base/config-type/update', 'base:configType:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (112, 'POST', '/base/config-type/delete', 'base:configType:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (113, 'GET', '/base/config/list', 'base:config:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (114, 'GET', '/base/config/getlist', 'base:config:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (115, 'GET', '/base/config/detail', 'base:config:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (116, 'POST', '/base/config/create', 'base:config:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (117, 'POST', '/base/config/update', 'base:config:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (118, 'POST', '/base/config/updateMany', 'base:config:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (119, 'POST', '/base/config/delete', 'base:config:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (120, 'POST', '/oss/local/imgs', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (121, 'POST', '/oss/local/files', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (122, 'POST', '/oss/local/logo', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (123, 'POST', '/oss/local/cover', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (124, 'GET', '/oss/local/cover/list', 'oss:file:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (125, 'POST', '/oss/local/delete', 'oss:file:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (126, 'GET', '/oss/local/extract', 'oss:file:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (127, 'POST', '/oss/local/copy', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (128, 'POST', '/oss/local/move', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (129, 'POST', '/oss/local/rename', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (130, 'GET', '/oss/local/relativePath', 'oss:file:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (131, 'POST', '/oss/local/createFolder', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (132, 'POST', '/oss/local/compress', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (133, 'POST', '/oss/qiniu/imgs', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (134, 'POST', '/oss/qiniu/files', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (135, 'POST', '/oss/aliyun/imgs', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (136, 'POST', '/oss/aliyun/files', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (137, 'POST', '/oss/tencent/imgs', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (138, 'POST', '/oss/tencent/files', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (139, 'GET', '/template/v1/file/tree', 'template:code:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (140, 'GET', '/template/v1/file/content', 'template:code:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (141, 'POST', '/template/v1/file/save', 'template:code:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (142, 'GET', '/template/v1/file/oss', 'template:code:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (162, 'GET', '/member/v1/captcha', 'member:user:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (163, 'POST', '/member/v1/verifyCaptcha', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (164, 'POST', '/member/v1/sendEmail', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (165, 'POST', '/member/v1/register', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (166, 'POST', '/member/v1/login', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (167, 'GET', '/member/v1/logout', 'member:user:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (168, 'POST', '/member/v1/checkEmail', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (169, 'POST', '/member/v1/resetPass', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (170, 'GET', '/member/v1/detail', 'member:user:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (171, 'POST', '/member/v1/updatePass', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (172, 'POST', '/member/v1/updateUser', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (173, 'GET', '/member/v1/comments', 'member:user:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (174, 'POST', '/member/v1/comment', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (175, 'POST', '/member/v1/deleteComment', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (176, 'POST', '/member/v1/likeComment', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (177, 'GET', '/member/v1/articleComments', 'member:user:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (178, 'GET', '/member/v1/favorites', 'member:user:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (179, 'POST', '/member/v1/favorite', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (180, 'POST', '/member/v1/deleteFavorite', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (181, 'GET', '/member/v1/list', 'member:user:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (182, 'GET', '/member/v1/search', 'member:user:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (183, 'GET', '/member/v1/adminDetail', 'member:user:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (184, 'POST', '/member/v1/updateStatus', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (185, 'POST', '/member/v1/adminUpdateUser', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (186, 'GET', '/member/v1/comment/list', 'member:user:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (187, 'POST', '/member/v1/comment/audit', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (188, 'POST', '/member/v1/comment/delete', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (189, 'GET', '/member/v1/favorite/list', 'member:user:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (190, 'POST', '/member/v1/favorite/delete', 'member:user:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (191, 'GET', '/base/permission/route/list', 'base:permission:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (192, 'POST', '/base/permission/route/create', 'base:permission:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (193, 'POST', '/base/permission/route/update', 'base:permission:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (194, 'POST', '/base/permission/route/delete', 'base:permission:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (195, 'GET', '/base/permission/permResources', 'base:permission:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (196, 'GET', '/base/menu/detail', 'base:menu:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (197, 'GET', '/base/permission/resource/list', 'base:permission:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (198, 'POST', '/base/permission/resource/save', 'base:permission:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (199, 'POST', '/base/permission/resource/delete', 'base:permission:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (200, 'POST', '/member/v1/delete', 'member:user:delete', '后台删除会员(支持批量)', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (201, 'POST', '/cms/gather/run', 'cms:gather:update', '手动执行一次采集', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (209, 'GET', '/cms/sysApp/find', 'cms:sysApp:config:list', '查询应用参数（按 type_code 分组）', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (210, 'GET', '/cms/sysApp/views', 'cms:sysApp:config:list', '查询模板目录下的模板文件', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (211, 'GET', '/cms/sysApp/folder', 'cms:sysApp:config:list', '查询模板目录列表', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (212, 'POST', '/cms/sysApp/update', 'cms:sysApp:config:update', '更新应用参数（按 id 定位）', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (213, 'POST', '/cms/special/groups', 'cms:special:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (214, 'GET', '/stat/api/stat/dashboard', 'stat:report:list', '统计大盘', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (215, 'GET', '/stat/api/stat/summary', 'stat:report:list', '统计排行', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (216, 'GET', '/stat/api/stat/export', 'stat:report:export', '统计导出CSV', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (217, 'GET', '/base/task/list', 'base:task:list', '任务列表', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (218, 'GET', '/base/task/logs', 'base:task:list', '任务日志', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (219, 'POST', '/base/task/update', 'base:task:update', '任务修改', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (220, 'POST', '/base/task/status', 'base:task:update', '任务开关', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (221, 'POST', '/base/task/run', 'base:task:run', '任务立即执行', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (222, 'POST', '/base/task/delete', 'base:task:delete', '任务删除', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (223, 'POST', '/base/task/create', 'base:task:create', '任务新增', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (224, 'POST', '/base/task/scan', 'base:task:scan', '任务扫描装配', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (225, 'GET', '/base/task/available', 'base:task:create', '可用处理器列表(新增弹窗数据源)', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (226, 'POST', '/oss/qiniu/sign', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (227, 'POST', '/oss/aliyun/sign', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (228, 'POST', '/oss/tencent/sign', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (229, 'POST', '/oss/tencent/cosAuth', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (230, 'GET', '/stat/api/stat/admin-login', 'stat:report:list', '后台登录统计', '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (231, 'GET', '/base/dept/list', 'base:dept:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (232, 'GET', '/base/dept/detail', 'base:dept:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (233, 'POST', '/base/dept/create', 'base:dept:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (234, 'POST', '/base/dept/update', 'base:dept:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (235, 'POST', '/base/dept/delete', 'base:dept:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (236, 'GET', '/base/dict/type/list', 'base:dict:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (237, 'GET', '/base/dict/type/detail', 'base:dict:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (238, 'POST', '/base/dict/type/create', 'base:dict:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (239, 'POST', '/base/dict/type/update', 'base:dict:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (240, 'POST', '/base/dict/type/delete', 'base:dict:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (241, 'GET', '/base/dict/item/list', 'base:dict:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (242, 'GET', '/base/dict/item/detail', 'base:dict:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (243, 'POST', '/base/dict/item/create', 'base:dict:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (244, 'POST', '/base/dict/item/update', 'base:dict:update', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (245, 'POST', '/base/dict/item/delete', 'base:dict:delete', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (246, 'GET', '/base/online/list', 'base:online:list', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (247, 'POST', '/base/online/kick', 'base:online:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (248, 'DELETE', '/oss/qiniu/object', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (249, 'DELETE', '/oss/aliyun/object', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (250, 'DELETE', '/oss/tencent/object', 'oss:file:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (260, 'POST', '/wechat/v1/template/send', 'wechat:message:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (261, 'POST', '/wechat/v1/custom/sendText', 'wechat:v1:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
INSERT INTO `sys_perm_route` (`id`, `method`, `path`, `perm_code`, `remark`, `created_at`, `updated_at`) VALUES (262, 'POST', '/wechat/v1/custom/sendImage', 'wechat:v1:create', NULL, '2026-09-24 22:02:20', '2026-09-24 22:02:20');
COMMIT;

-- ----------------------------
-- Table structure for sys_permission
-- ----------------------------
DROP TABLE IF EXISTS `sys_permission`;
CREATE TABLE `sys_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '权限ID',
  `menu_id` int(11) NOT NULL COMMENT '关联菜单ID（sys_menu.id）',
  `perm_key` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权限唯一标识',
  `perm_type` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权限类型（F按钮 I接口）',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '权限名称',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_perm_key` (`perm_key`) USING BTREE,
  KEY `idx_menu_id` (`menu_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=445 DEFAULT CHARSET=utf8mb4 COMMENT='seed';

-- ----------------------------
-- Records of sys_permission
-- ----------------------------
BEGIN;
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (70, 3, 'cms:site:info', 'I', '站点设置', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (71, 5, 'cms:category:find', 'I', '栏目管理', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (72, 7, 'cms:category:save', 'I', '栏目新增/修改', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (73, 5, 'cms:category:delete', 'F', '栏目删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (74, 5, 'cms:category:find', 'F', '栏目查询', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (75, 10, 'cms:article:list', 'I', '文章管理', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (76, 12, 'cms:article:save', 'I', '文章新增/修改', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (77, 10, 'cms:article:delete', 'F', '文章删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (78, 10, 'cms:article:detail', 'F', '文章详情', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (79, 15, 'cms:slide:list', 'I', '轮播管理', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (80, 17, 'cms:slide:save', 'I', '轮播新增/修改', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (81, 15, 'cms:slide:delete', 'F', '轮播删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (82, 15, 'cms:slide:detail', 'F', '轮播详情', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (83, 20, 'cms:tag:list', 'I', '标签管理', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (84, 22, 'cms:tag:save', 'I', '标签新增/修改', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (85, 20, 'cms:tag:delete', 'F', '标签删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (86, 20, 'cms:tag:detail', 'F', '标签详情', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (87, 25, 'cms:frag:list', 'I', '碎片管理', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (88, 27, 'cms:frag:save', 'I', '碎片新增/修改', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (89, 25, 'cms:frag:delete', 'F', '碎片删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (90, 25, 'cms:frag:detail', 'F', '碎片详情', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (91, 30, 'cms:collect:list', 'I', '页面采集', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (92, 32, 'cms:collect:save', 'I', '采集新增/修改', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (93, 30, 'cms:collect:delete', 'F', '采集删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (94, 30, 'cms:collect:detail', 'F', '采集查询', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (95, 35, 'cms:gather:list', 'I', '接口采集', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (96, 37, 'cms:gather:save', 'I', '采集新增/修改', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (97, 35, 'cms:gather:delete', 'F', '采集删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (98, 35, 'cms:gather:detail', 'F', '采集详情', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (99, 41, 'cms:model:list', 'I', '模型管理', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (100, 43, 'cms:model:save', 'I', '模型新增/修改', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (101, 41, 'cms:model:delete', 'F', '模型删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (102, 41, 'cms:model:detail', 'F', '模型详情', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (103, 46, 'cms:field:list', 'I', '字段管理', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (104, 48, 'cms:field:save', 'I', '字段新增/修改', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (105, 46, 'cms:field:delete', 'F', '字段删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (106, 46, 'cms:field:detail', 'F', '字段详情', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (107, 51, 'cms:friendlink:list', 'I', '友情链接', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (108, 53, 'cms:friendlink:save', 'I', '友链新增/修改', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (109, 51, 'cms:friendlink:delete', 'F', '友链删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (110, 51, 'cms:friendlink:detail', 'F', '友链详情', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (111, 56, 'cms:message:list', 'I', '消息管理', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (112, 58, 'cms:message:save', 'I', '消息新增/修改', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (113, 56, 'cms:message:delete', 'F', '消息删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (114, 56, 'cms:message:detail', 'F', '消息详情', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (115, 62, 'base:user:list', 'I', '用户管理', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (116, 63, 'base:user:create', 'I', '用户新增', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (117, 64, 'base:user:update', 'I', '用户修改', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (118, 62, 'base:user:delete', 'F', '用户删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (119, 62, 'base:user:detail', 'F', '用户详情', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (120, 67, 'base:role:list', 'I', '角色管理', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (121, 68, 'base:role:create', 'I', '角色新增', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (122, 69, 'base:role:update', 'I', '角色编辑', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (123, 67, 'base:role:delete', 'F', '角色删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (124, 67, 'base:role:detail', 'F', '角色详情', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (125, 72, 'base:menu:list', 'I', '菜单管理', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (126, 72, 'base:menu:create', 'F', '菜单新增', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (127, 72, 'base:menu:update', 'F', '菜单修改', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (128, 72, 'base:menu:delete', 'F', '菜单删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (129, 72, 'base:menu:detail', 'F', '菜单详情', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (130, 2, 'cms:site:update', 'F', '站点更新', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (131, 79, 'base:config-type:list', 'I', '配置字典', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (132, 80, 'base:config:list', 'I', '配置列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (133, 79, 'base:config-type:create', 'F', '字典新增', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (134, 79, 'base:config-type:update', 'F', '字典修改', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (135, 79, 'base:config-type:delete', 'F', '字典删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (136, 79, 'base:config-type:detail', 'F', '字典查询', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (137, 80, 'base:config:create', 'F', '新增配置', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (138, 80, 'base:config:update', 'F', '配置修改', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (139, 80, 'base:config:delete', 'F', '配置删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (140, 80, 'base:config:list', 'F', '配置查询', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (141, 90, 'vip:v1:file:tree', 'I', '前端模板', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (142, 90, 'vip:v1:file:save', 'F', '模板更新', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (143, 92, 'oss:local:oss', 'I', '附件管理', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (144, 72, 'base:menu:allRouter', 'I', '全部菜单', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (145, 5, 'cms:category:findId', 'F', '栏目ID查找', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (146, 5, 'cms:category:findSubId', 'F', '子栏目ID查找', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (147, 5, 'cms:category:search', 'F', '栏目搜索', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (148, 10, 'cms:article:list', 'F', '文章列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (149, 10, 'cms:article:statistics', 'F', '文章统计', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (150, 10, 'cms:article:findField', 'F', '查找字段', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (151, 10, 'cms:article:search', 'F', '文章搜索', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (152, 41, 'cms:model:hasUse', 'F', '模型使用情况', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (153, 46, 'cms:field:list', 'F', '字段列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (154, 25, 'cms:frag:list', 'F', '碎片列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (155, 25, 'cms:frag:search', 'F', '碎片搜索', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (156, 20, 'cms:tag:list', 'F', '标签列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (157, 20, 'cms:tag:has', 'F', '标签检查', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (158, 20, 'cms:tag:search', 'F', '标签搜索', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (159, 51, 'cms:friendlink:list', 'F', '友情链接列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (160, 56, 'cms:message:list', 'F', '留言列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (161, 56, 'cms:message:search', 'F', '留言搜索', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (162, 15, 'cms:slide:list', 'F', '轮播列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (163, 15, 'cms:slide:search', 'F', '轮播搜索', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (164, 30, 'cms:collect:getPages', 'F', '获取页面', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (165, 30, 'cms:collect:getArticle', 'F', '获取采集文章', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (166, 30, 'cms:collect:search', 'F', '采集搜索', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (167, 35, 'cms:gather:getArticle', 'F', '获取接口文章', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (168, 35, 'cms:gather:list', 'F', '接口采集列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (169, 35, 'cms:gather:search', 'F', '接口采集搜索', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (170, 77, 'cms:loginLog:create', 'F', '创建登录日志', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (171, 77, 'cms:loginLog:delete', 'F', '删除登录日志', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (172, 62, 'base:userRole:detail', 'F', '用户角色详情', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (173, 67, 'base:roleMenu:list', 'I', '角色菜单列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (174, 80, 'base:config:getlist', 'F', '配置获取列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (175, 80, 'base:config:updateMany', 'F', '配置批量更新', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (176, 67, 'base:role:list', 'F', '角色列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (177, 92, 'oss:local:logo', 'F', '上传Logo', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (178, 92, 'oss:local:imgs', 'F', '上传多图片', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (179, 92, 'oss:local:files', 'F', '上传文件', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (180, 2, 'cms:site:runEnv', 'F', '运行环境', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (181, 2, 'cms:sysApp:find', 'F', '系统应用查找', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (182, 2, 'cms:sysApp:views', 'F', '系统应用视图', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (183, 2, 'cms:sysApp:folder', 'F', '系统应用文件夹', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (184, 2, 'cms:sysApp:update', 'F', '系统应用更新', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (185, 72, 'base:menu:list', 'F', '菜单列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (186, 79, 'base:config-type:detail', 'F', '配置类型详情', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (187, 80, 'base:config:detail', 'F', '配置详情', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (188, 90, 'vip:v1:file:content', 'I', '模板内容', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (189, 92, 'oss:local:delete', 'F', '删除文件', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (190, 92, 'oss:local:extract', 'F', '解压文件', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (191, 92, 'oss:local:copy', 'F', '复制文件', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (192, 92, 'oss:local:move', 'F', '移动文件', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (193, 92, 'oss:local:rename', 'F', '重命名', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (194, 152, 'member:v1:list', 'F', '会员列表查询', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (195, 152, 'member:v1:search', 'F', '会员搜索', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (196, 152, 'member:v1:adminDetail', 'F', '会员详情', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (197, 152, 'member:v1:updateStatus', 'F', '会员状态更新', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (198, 152, 'member:v1:list', 'I', '会员列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (199, 152, 'member:v1:adminUpdateUser', 'F', '会员信息更新', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (200, 30, 'cms:collect:list', 'F', '采集列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (201, 155, 'member:v1:comment:list', 'I', '评论列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (202, 155, 'member:v1:comment:list', 'F', '评论列表查询', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (203, 155, 'member:v1:comment:audit', 'F', '评论审核', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (204, 155, 'member:v1:comment:delete', 'F', '评论删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (205, 159, 'member:v1:favorite:list', 'I', '收藏列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (206, 159, 'member:v1:favorite:list', 'F', '收藏列表查询', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (207, 159, 'member:v1:favorite:delete', 'F', '收藏删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (208, 92, 'vip:v1:file:oss', 'F', '文件列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (209, 92, 'oss:local:createFolder', 'F', '创建文件夹', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (210, 92, 'oss:local:compress', 'F', '压缩文件', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (211, 92, 'oss:qiniu:upload', 'I', '七牛云-单个上传', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (212, 92, 'oss:qiniu:getUploadToken', 'I', '七牛云-token', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (213, 92, 'oss:aliyun:upload', 'I', '阿里云-单个上传', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (214, 92, 'oss:qiniu:imgs', 'I', '七牛云-多个上传', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (215, 92, 'oss:aliyun:imgs', 'I', '阿里云-多个上传', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (216, 175, 'base:operLog:list', 'I', '操作日志', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (217, 176, 'base:permission:list', 'I', '权限管理', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (218, 176, 'base:permission:create', 'F', '权限新增', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (219, 176, 'base:permission:update', 'F', '权限修改', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (220, 176, 'base:permission:delete', 'F', '权限删除', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (221, 176, 'base:permission:detail', 'F', '权限详情', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (222, 176, 'base:permission:list', 'F', '权限列表', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (223, 176, 'base:permission:all', 'I', '全部权限', '2026-07-12 12:30:40');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (325, 0, 'cms:site:list', 'I', 'cms:site:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (326, 0, 'cms:sysApp:list', 'I', 'cms:sysApp:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (327, 0, 'cms:category:list', 'I', 'cms:category:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (328, 0, 'cms:category:create', 'I', 'cms:category:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (329, 0, 'cms:category:update', 'I', 'cms:category:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (330, 0, 'cms:article:create', 'I', 'cms:article:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (331, 0, 'cms:article:update', 'I', 'cms:article:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (332, 0, 'cms:model:create', 'I', 'cms:model:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (333, 0, 'cms:model:update', 'I', 'cms:model:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (334, 0, 'cms:field:create', 'I', 'cms:field:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (335, 0, 'cms:field:update', 'I', 'cms:field:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (336, 0, 'cms:frag:create', 'I', 'cms:frag:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (337, 0, 'cms:frag:update', 'I', 'cms:frag:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (338, 0, 'cms:tag:create', 'I', 'cms:tag:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (339, 0, 'cms:tag:update', 'I', 'cms:tag:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (340, 0, 'cms:friendlink:create', 'I', 'cms:friendlink:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (341, 0, 'cms:friendlink:update', 'I', 'cms:friendlink:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (342, 0, 'cms:message:update', 'I', 'cms:message:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (343, 0, 'cms:slide:create', 'I', 'cms:slide:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (344, 0, 'cms:slide:update', 'I', 'cms:slide:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (345, 0, 'cms:collect:create', 'I', 'cms:collect:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (346, 0, 'cms:collect:update', 'I', 'cms:collect:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (347, 0, 'cms:gather:create', 'I', 'cms:gather:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (348, 0, 'cms:gather:update', 'I', 'cms:gather:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (349, 0, 'cms:special:list', 'I', 'cms:special:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (350, 0, 'cms:special:create', 'I', 'cms:special:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (351, 0, 'cms:special:update', 'I', 'cms:special:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (352, 0, 'cms:special:delete', 'I', 'cms:special:delete', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (353, 0, 'base:userRole:list', 'I', 'base:userRole:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (354, 0, 'base:operLog:delete', 'I', 'base:operLog:delete', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (355, 0, 'base:configType:list', 'I', 'base:configType:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (356, 0, 'base:configType:create', 'I', 'base:configType:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (357, 0, 'base:configType:update', 'I', 'base:configType:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (358, 0, 'base:configType:delete', 'I', 'base:configType:delete', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (359, 0, 'oss:file:list', 'I', 'oss:file:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (360, 0, 'oss:file:create', 'I', 'oss:file:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (361, 0, 'oss:file:delete', 'I', 'oss:file:delete', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (362, 0, 'book:category:list', 'I', 'book:category:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (363, 0, 'book:category:create', 'I', 'book:category:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (364, 0, 'book:category:update', 'I', 'book:category:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (365, 0, 'book:category:delete', 'I', 'book:category:delete', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (366, 0, 'book:book:list', 'I', 'book:book:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (367, 0, 'book:book:create', 'I', 'book:book:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (368, 0, 'book:book:update', 'I', 'book:book:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (369, 0, 'book:book:delete', 'I', 'book:book:delete', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (370, 0, 'book:chapter:list', 'I', 'book:chapter:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (371, 0, 'book:chapter:create', 'I', 'book:chapter:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (372, 0, 'book:chapter:update', 'I', 'book:chapter:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (373, 0, 'book:chapter:delete', 'I', 'book:chapter:delete', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (374, 0, '*:*:*', 'I', '*:*:*', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (375, 0, 'base:configType:detail', 'I', 'base:configType:detail', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (376, 0, 'template:v1:file', 'I', 'template:v1:file', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (377, 0, 'oss:file:update', 'I', 'oss:file:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (378, 0, 'member:v1:comment', 'I', 'member:v1:comment', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (379, 0, 'member:v1:favorite', 'I', 'member:v1:favorite', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (380, 0, 'base:operLog:clear', 'I', 'base:operLog:clear', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (381, 0, 'book:book:save', 'I', 'book:book:save', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (382, 0, 'book:book:detail', 'I', 'book:book:detail', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (383, 0, 'book:category:save', 'I', 'book:category:save', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (384, 0, 'book:chapter:save', 'I', 'book:chapter:save', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (385, 0, 'book:book:all', 'I', 'book:book:all', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (386, 0, 'book:category:tree', 'I', 'book:category:tree', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (387, 0, 'book:category:detail', 'I', 'book:category:detail', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (388, 0, 'book:chapter:tree', 'I', 'book:chapter:tree', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (389, 0, 'book:chapter:detail', 'I', 'book:chapter:detail', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (390, 0, 'book:book:search', 'I', 'book:book:search', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (391, 0, 'cms:special:detail', 'I', 'cms:special:detail', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (392, 0, 'cms:special:article', 'I', 'cms:special:article', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (393, 0, 'template:code:list', 'I', 'template:code:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (394, 0, 'template:code:update', 'I', 'template:code:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (395, 0, 'member:user:list', 'I', 'member:user:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (396, 0, 'member:user:update', 'I', 'member:user:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (397, 0, 'member:user:delete', 'I', 'member:user:delete', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (398, 0, 'cms:product:list', 'I', 'cms:product:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (399, 0, 'cms:product:create', 'I', 'cms:product:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (400, 0, 'cms:product:update', 'I', 'cms:product:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (401, 0, 'cms:product:delete', 'I', 'cms:product:delete', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (402, 0, 'cms:sysApp:config:list', 'I', 'cms:sysApp:config:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (403, 0, 'cms:sysApp:config:update', 'I', 'cms:sysApp:config:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (404, 0, 'stat:report:list', 'I', '统计报表查看', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (405, 0, 'stat:report:export', 'I', '统计报表导出', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (406, 0, 'base:task:list', 'I', '定时任务查看', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (407, 0, 'base:task:update', 'I', '定时任务修改(含开启关闭/改cron)', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (408, 0, 'base:task:run', 'I', '定时任务立即执行', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (409, 0, 'base:task:delete', 'I', '定时任务删除', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (410, 0, 'base:task:create', 'I', '定时任务新增(含可用处理器列表)', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (411, 0, 'base:task:scan', 'I', '定时任务扫描装配(代码新增任务热上线)', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (412, 0, 'cms:sysApp/config:list', 'c', 'cms:sysApp/config:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (413, 0, 'cms:sysApp/config:update', 'c', 'cms:sysApp/config:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (414, 0, 'base:dept:list', 'I', 'base:dept:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (415, 0, 'base:dept:create', 'I', 'base:dept:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (416, 0, 'base:dept:update', 'I', 'base:dept:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (417, 0, 'base:dept:delete', 'I', 'base:dept:delete', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (418, 0, 'base:dict:list', 'I', 'base:dict:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (419, 0, 'base:dict:create', 'I', 'base:dict:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (420, 0, 'base:dict:update', 'I', 'base:dict:update', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (421, 0, 'base:dict:delete', 'I', 'base:dict:delete', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (422, 0, 'base:online:list', 'I', 'base:online:list', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (423, 0, 'base:online:create', 'I', 'base:online:create', '2026-09-24 22:02:44');
INSERT INTO `sys_permission` (`id`, `menu_id`, `perm_key`, `perm_type`, `name`, `created_at`) VALUES (436, 0, 'wechat:message:create', 'I', 'wechat:message:create', '2026-09-24 22:02:44');
COMMIT;

-- ----------------------------
-- Table structure for sys_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色名称',
  `key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色权限字符串(super/admin)',
  `sort` int(4) NOT NULL COMMENT '显示顺序',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1' COMMENT '角色状态（1正常 2停用）',
  `del_flag` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '1' COMMENT '删除标志（1代表存在 2代表删除）',
  `create_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '创建者',
  `created_at` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '更新者',
  `updated_at` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COMMENT='seed';

-- ----------------------------
-- Records of sys_role
-- ----------------------------
BEGIN;
INSERT INTO `sys_role` (`id`, `name`, `key`, `sort`, `status`, `del_flag`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (1, '超级管理员', 'super', 0, '1', '1', '', NULL, '', NULL, NULL);
INSERT INTO `sys_role` (`id`, `name`, `key`, `sort`, `status`, `del_flag`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (2, '普通管理员', 'admin', 0, '1', '1', '', NULL, '', NULL, NULL);
INSERT INTO `sys_role` (`id`, `name`, `key`, `sort`, `status`, `del_flag`, `create_by`, `created_at`, `update_by`, `updated_at`, `remark`) VALUES (3, '游客', 'visitor', 0, '1', '1', '', NULL, '', NULL, NULL);
COMMIT;

-- ----------------------------
-- Table structure for sys_role_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_menu`;
CREATE TABLE `sys_role_menu` (
  `role_id` int(11) NOT NULL COMMENT '角色ID',
  `menu_id` int(11) NOT NULL COMMENT '菜单ID',
  PRIMARY KEY (`role_id`,`menu_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='seed';

-- ----------------------------
-- Records of sys_role_menu
-- ----------------------------
BEGIN;
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 1);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 2);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 3);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 4);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 5);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 7);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 8);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 9);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 10);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 12);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 13);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 14);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 15);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 17);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 18);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 19);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 20);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 22);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 23);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 24);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 25);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 27);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 28);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 29);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 30);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 32);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 33);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 34);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 35);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 37);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 38);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 39);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 40);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 41);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 43);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 44);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 45);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 46);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 48);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 49);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 50);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 51);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 53);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 54);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 55);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 56);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 58);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 59);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 60);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 61);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 62);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 63);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 64);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 65);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 66);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 67);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 68);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 69);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 70);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 71);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 72);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 73);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 74);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 75);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 76);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 78);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 79);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 80);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 81);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 82);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 83);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 84);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 85);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 86);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 87);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 88);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 89);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 90);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 91);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 92);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 93);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 94);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 95);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 96);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 97);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 98);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 99);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 100);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 103);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 104);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 105);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 106);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 107);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 108);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 109);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 110);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 111);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 112);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 113);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 114);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 115);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 116);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 117);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 118);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 119);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 120);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 121);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 122);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 124);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 125);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 126);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 127);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 129);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 130);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 131);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 132);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 133);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 134);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 135);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 136);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 137);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 138);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 139);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 140);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 141);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 142);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 143);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 144);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 145);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 146);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 147);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 148);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 149);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 150);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 151);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 152);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 153);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 154);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 155);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 156);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 157);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 158);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 159);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 160);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 161);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 162);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 163);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 164);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 170);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 171);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 172);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 175);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 176);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 177);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 178);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 179);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 180);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 181);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 182);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 189);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 190);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 191);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 192);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 195);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (1, 196);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 1);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 2);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 3);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 4);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 5);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 7);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 8);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 9);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 10);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 12);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 13);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 14);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 15);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 17);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 18);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 19);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 20);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 22);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 23);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 24);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 25);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 27);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 28);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 29);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 30);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 35);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 40);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 41);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 43);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 44);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 45);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 46);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 48);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 49);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 50);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 51);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 53);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 54);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 55);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 56);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 58);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 59);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 60);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 61);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 62);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 63);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 64);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 65);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 66);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 67);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 72);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 78);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 79);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 80);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 81);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 82);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 83);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 84);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 85);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 86);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 87);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 88);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 89);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 90);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 92);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 95);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 96);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 97);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 98);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 99);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 100);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 104);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 105);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 106);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 107);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 108);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 109);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 110);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 111);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 112);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 113);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 114);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 115);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 122);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 124);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 125);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 127);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 134);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 135);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 136);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 137);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 138);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 140);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 141);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 147);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 152);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 155);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 159);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 175);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 176);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 177);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 178);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 179);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 180);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 189);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 190);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 191);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 192);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 195);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (2, 196);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 1);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 3);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 9);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 14);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 19);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 24);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 29);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 34);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 39);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 45);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 50);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 55);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 60);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 66);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 93);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 94);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 95);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 96);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 97);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 98);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 99);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 100);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 106);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 107);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 108);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 109);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 110);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 111);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 112);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 114);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 115);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 116);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 120);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 121);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 122);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 125);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 126);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 127);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 130);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 131);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 132);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 134);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 136);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 140);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 195);
COMMIT;

-- ----------------------------
-- Table structure for sys_role_permission
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_permission`;
CREATE TABLE `sys_role_permission` (
  `role_id` int(11) NOT NULL COMMENT '角色ID',
  `perm_id` int(11) NOT NULL COMMENT '权限ID',
  PRIMARY KEY (`role_id`,`perm_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='seed';

-- ----------------------------
-- Records of sys_role_permission
-- ----------------------------
BEGIN;
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 70);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 71);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 72);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 73);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 74);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 75);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 76);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 77);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 78);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 79);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 80);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 81);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 82);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 83);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 84);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 85);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 86);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 87);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 88);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 89);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 90);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 91);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 92);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 93);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 94);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 95);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 96);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 97);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 98);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 99);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 100);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 101);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 102);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 103);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 104);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 105);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 106);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 107);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 108);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 109);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 110);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 111);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 112);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 113);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 114);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 115);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 116);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 117);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 118);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 119);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 120);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 121);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 122);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 123);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 124);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 125);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 126);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 127);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 128);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 129);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 130);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 131);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 132);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 133);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 134);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 135);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 136);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 137);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 138);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 139);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 140);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 141);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 142);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 143);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 144);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 145);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 146);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 147);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 148);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 149);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 150);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 151);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 152);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 153);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 154);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 155);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 156);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 157);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 158);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 159);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 160);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 161);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 162);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 163);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 164);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 165);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 166);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 167);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 168);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 169);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 170);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 171);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 172);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 173);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 174);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 175);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 176);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 177);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 178);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 179);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 180);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 181);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 182);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 183);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 184);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 185);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 186);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 187);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 188);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 189);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 190);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 191);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 192);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 193);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 194);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 195);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 196);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 197);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 198);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 199);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 200);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 201);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 202);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 203);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 204);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 205);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 206);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 207);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 208);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 209);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 210);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 211);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 212);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 213);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 214);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 215);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 216);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 217);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 218);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 219);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 220);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 221);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 222);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 223);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 374);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (1, 404);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (2, 96);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (2, 100);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (2, 101);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (2, 102);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (2, 103);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (2, 104);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (2, 105);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (2, 106);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (2, 107);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (2, 108);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (2, 109);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (2, 404);
INSERT INTO `sys_role_permission` (`role_id`, `perm_id`) VALUES (3, 404);
COMMIT;

-- ----------------------------
-- Table structure for sys_task
-- ----------------------------
DROP TABLE IF EXISTS `sys_task`;
CREATE TABLE `sys_task` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '任务名（唯一，^[a-zA-Z0-9_-]{1,50}$）',
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '显示名',
  `module` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '所属模块',
  `cron` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0 1 * * *' COMMENT 'cron 表达式（5 段）',
  `status` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1' COMMENT '1启用 0停用',
  `is_system` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '1系统内置（可停用不可删除）',
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `last_run_at` datetime DEFAULT NULL COMMENT '最近执行时间（含手动触发）',
  `last_run_ms` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '最近执行耗时',
  `last_run_status` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT 'success/fail/running',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '1已软删（后台删除，重启 bootTasks 跳过，不再自动恢复）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='定时任务配置';

-- ----------------------------
-- Records of sys_task
-- ----------------------------
BEGIN;
INSERT INTO `sys_task` (`id`, `name`, `title`, `module`, `cron`, `status`, `is_system`, `remark`, `last_run_at`, `last_run_ms`, `last_run_status`, `created_at`, `updated_at`, `deleted`) VALUES (1, 'stat-aggregate', '统计日聚合', 'stat', '0 1 * * *', '1', 1, '', '2026-09-20 01:00:00', 11, 'success', '2026-09-15 11:23:01', '2026-09-20 01:00:00', 0);
INSERT INTO `sys_task` (`id`, `name`, `title`, `module`, `cron`, `status`, `is_system`, `remark`, `last_run_at`, `last_run_ms`, `last_run_status`, `created_at`, `updated_at`, `deleted`) VALUES (3, 'stat-clean', '统计明细清理', 'stat', '0 1 * * *', '1', 1, '', '2026-09-20 01:00:00', 15, 'success', '2026-09-15 11:23:01', '2026-09-20 01:00:00', 0);
INSERT INTO `sys_task` (`id`, `name`, `title`, `module`, `cron`, `status`, `is_system`, `remark`, `last_run_at`, `last_run_ms`, `last_run_status`, `created_at`, `updated_at`, `deleted`) VALUES (4, 'task-log-clean', '任务日志清理', 'base', '0 1 * * *', '1', 1, '', '2026-09-20 01:00:00', 4, 'success', '2026-09-15 11:23:01', '2026-09-20 01:00:00', 0);
COMMIT;

-- ----------------------------
-- Table structure for sys_task_log
-- ----------------------------
DROP TABLE IF EXISTS `sys_task_log`;
CREATE TABLE `sys_task_log` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `task_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `trigger` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cron' COMMENT 'cron定时 / manual手动',
  `status` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT 'success/fail',
  `cost_ms` int(11) unsigned NOT NULL DEFAULT '0',
  `error` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '失败错误摘要',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name_time` (`task_name`,`created_at`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='定时任务执行日志（保留30天）';

-- ----------------------------
-- Records of sys_task_log
-- ----------------------------
BEGIN;
INSERT INTO `sys_task_log` (`id`, `task_name`, `trigger`, `status`, `cost_ms`, `error`, `created_at`) VALUES (4, 'stat-aggregate', 'manual', 'success', 7, '', '2026-09-15 17:55:46');
INSERT INTO `sys_task_log` (`id`, `task_name`, `trigger`, `status`, `cost_ms`, `error`, `created_at`) VALUES (5, 'stat-clean', 'cron', 'success', 4, '', '2026-09-16 01:00:00');
INSERT INTO `sys_task_log` (`id`, `task_name`, `trigger`, `status`, `cost_ms`, `error`, `created_at`) VALUES (6, 'task-log-clean', 'cron', 'success', 5, '', '2026-09-16 01:00:00');
INSERT INTO `sys_task_log` (`id`, `task_name`, `trigger`, `status`, `cost_ms`, `error`, `created_at`) VALUES (7, 'stat-aggregate', 'cron', 'success', 17, '', '2026-09-16 01:00:00');
INSERT INTO `sys_task_log` (`id`, `task_name`, `trigger`, `status`, `cost_ms`, `error`, `created_at`) VALUES (8, 'task-log-clean', 'cron', 'success', 4, '', '2026-09-20 01:00:00');
INSERT INTO `sys_task_log` (`id`, `task_name`, `trigger`, `status`, `cost_ms`, `error`, `created_at`) VALUES (9, 'stat-aggregate', 'cron', 'success', 11, '', '2026-09-20 01:00:00');
INSERT INTO `sys_task_log` (`id`, `task_name`, `trigger`, `status`, `cost_ms`, `error`, `created_at`) VALUES (10, 'stat-clean', 'cron', 'success', 15, '', '2026-09-20 01:00:00');
COMMIT;

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '登录账号',
  `nickname` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '用户昵称',
  `password` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '密码',
  `salt` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '盐加密',
  `avatar` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '头像路径',
  `sex` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '用户性别（0男 1女 2未知）',
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '用户邮箱',
  `phonenumber` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '手机号码',
  `login_ip` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '最后登录IP',
  `login_date` datetime DEFAULT NULL COMMENT '最后登录时间',
  `create_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '创建者',
  `created_at` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '更新者',
  `updated_at` datetime DEFAULT NULL COMMENT '更新时间',
  `pwd_update_date` datetime DEFAULT NULL COMMENT '密码最后更新时间',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '帐号状态（1正常 0停用）',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `username` (`username`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COMMENT='seed';

-- ----------------------------
-- Records of sys_user
-- ----------------------------
BEGIN;
INSERT INTO `sys_user` (`id`, `username`, `nickname`, `password`, `salt`, `avatar`, `sex`, `email`, `phonenumber`, `login_ip`, `login_date`, `create_by`, `created_at`, `update_by`, `updated_at`, `pwd_update_date`, `status`, `remark`) VALUES (1, 'admin', '', '$2b$12$MNOt0mXmoftvWoilZODR6.Zzu2/4xHBzKDxMy5tToxHCz0mAl3zYa', '', '', '0', '', '', '', NULL, '', NULL, '', NULL, NULL, '1', NULL);
INSERT INTO `sys_user` (`id`, `username`, `nickname`, `password`, `salt`, `avatar`, `sex`, `email`, `phonenumber`, `login_ip`, `login_date`, `create_by`, `created_at`, `update_by`, `updated_at`, `pwd_update_date`, `status`, `remark`) VALUES (2, 'chancms', '', '$2b$12$.Fk2hf5jlyaMixhYIfiPW.56AjCPaqlnKSliF4FSoSKOaZBjkNfJO', '', '', '0', '', '', '', NULL, '', NULL, '', NULL, NULL, '1', NULL);
INSERT INTO `sys_user` (`id`, `username`, `nickname`, `password`, `salt`, `avatar`, `sex`, `email`, `phonenumber`, `login_ip`, `login_date`, `create_by`, `created_at`, `update_by`, `updated_at`, `pwd_update_date`, `status`, `remark`) VALUES (3, 'test', '', '$2b$12$m5RMmDJ1YLWCtJrK/FSfAeB0fqeZwg5kxoA/Z.yuBQ9190QPmRz/2', '', '', '0', '', '', '', NULL, '', NULL, '', NULL, NULL, '1', NULL);
COMMIT;

-- ----------------------------
-- Table structure for sys_user_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_role`;
CREATE TABLE `sys_user_role` (
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `role_id` int(11) NOT NULL COMMENT '角色ID',
  PRIMARY KEY (`user_id`,`role_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='seed';

-- ----------------------------
-- Records of sys_user_role
-- ----------------------------
BEGIN;
INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES (1, 1);
INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES (2, 1);
INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES (3, 3);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
