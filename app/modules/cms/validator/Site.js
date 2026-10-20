import { z } from '../../../common/validate.js';

/**
 * Site 模块参数校验规则（CMS 站点配置）
 *
 * 对应 controller/Site.js
 * 校验失败 code 1006（参数无效）
 *
 * 说明：站点配置字段较多且动态变化（通常以 JSON 形式整体提交），
 *      此处仅做关键字段类型校验 + passthrough 透传，不强制限制字段集
 */

// ============ 各接口 schema ============

/**
 * 更新站点配置 POST /cms/site/update
 * 原逻辑：body 整体传给 service.updateInfo
 * 宽松校验：要求 body 是对象，至少有一个字段
 */
export const updateSchema = z.looseObject({
  name: z.string().max(100).optional(),
  title: z.string().max(200).optional(),
  keywords: z.string().max(500).optional(),
  description: z.string().max(500).optional(),
  logo: z.string().max(255).optional(),
  favicon: z.string().max(255).optional(),
  icp: z.string().max(100).optional(),
  copyright: z.string().max(200).optional(),
  mid: z.number().int().optional().nullable(),
  template: z.string().max(50).optional(), // 模板切换（admin 应用管理-模板切换页用）
  ext_data: z.any().optional().nullable(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: '站点配置不能为空' }
);
