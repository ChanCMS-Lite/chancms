import { z } from '../../../common/validate.js';

// 模板文件读写：路径安全由 controller 内 isAllowed/resolveFilePath 硬校验，此处只做类型约束
export const treeSchema = z.looseObject({
  template: z.string().max(100).optional(),
});

export const ossSchema = z.looseObject({
  path: z.string().max(500).optional(),
});

export const contentSchema = z.looseObject({
  template: z.string().max(100).optional(),
  path: z.string().max(500).optional(),
});

// 保存：content 为模板源码（含 art-template 语法与合法 <script>），不做长度/内容约束
export const saveSchema = z.looseObject({
  template: z.string().max(100).optional(),
  path: z.string().max(500).optional(),
  content: z.string().optional(),
});
