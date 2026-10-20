# view/default 模板 · 碎片（frag）约定

> art-template 模板中通过 `frag["mark名"]` 取值。mark 命名由 **模板作者按本约定维护**，
> 与栏目/数据模型无关，**不涉及后端特殊判断**。

## 约定 mark 一览

| mark          | 用途               | 用在哪                                       | 缺省行为 |
| ------------- | ------------------ | -------------------------------------------- | -------- |
| `home_intro`  | 首页右侧栏介绍文案 | `index.html` 右侧栏                          | 不存在则隐藏该区块 |

## 模板作者怎么改

1. **改 mark 名**：直接改 `index.html` 里的 `frag["home_intro"]` 字面量，全局替换即可。
   模板与数据完全解耦——后端只负责把 `cms_frag` 全表按 mark 暴露成 `frag` 对象。
2. **想新增碎片位**：在模板里写 `{{if frag && frag["your_mark"]}} ... {{/if}}`，
   后台「碎片管理」建一条 mark=`your_mark` 的碎片即可。

## 后端数据形态

- 路由：栏目级碎片会覆盖全局同名 mark（绑栏目后只在该栏目及祖先可见）
- 完整规则见：`app/modules/web/service/common/site.js#fragForCategory`