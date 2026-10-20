import { logger } from "chanjs";
import { checkKeywords } from "chanjs/security/checker.js";

/**
 * @description 验证评论内容长度
 * @param {string} content - 评论内容
 * @param {Object} config - 配置对象
 * @returns {Object} - 验证结果对象
 */
function validateContentLength(content, config) {
  if (content.length < config.minLength) {
    return { valid: false, msg: `评论内容至少${config.minLength}个字符` };
  }
  
  if (content.length > config.maxLength) {
    return { valid: false, msg: `评论内容不能超过${config.maxLength}个字符` };
  }
  
  return { valid: true };
}

/**
 * @description 验证评论内容是否包含敏感词
 * @param {string} content - 评论内容
 * @param {Object} config - 配置对象
 * @returns {Object} - 验证结果对象
 */
function validateSensitiveWords(content, config) {
  if (!config.enableSensitiveFilter || !config.sensitiveWords) {
    return { valid: true };
  }
  
  const words = config.sensitiveWords.split(',').map(w => w.trim()).filter(w => w);
  for (const word of words) {
    if (content.toLowerCase().includes(word.toLowerCase())) {
      return { valid: false, msg: '评论内容包含敏感词' };
    }
  }
  
  return { valid: true };
}

/**
 * @description 验证评论内容是否包含链接
 * @param {string} content - 评论内容
 * @param {Object} config - 配置对象
 * @returns {Object} - 验证结果对象
 */
function validateLinks(content, config) {
  if (!config.enableLinkFilter) {
    return { valid: true };
  }
  
  const linkPattern = /https?:\/\/[^\s]+/gi;
  const links = content.match(linkPattern) || [];
  if (links.length > config.maxLinks) {
    return { valid: false, msg: `单条评论最多包含${config.maxLinks}个链接` };
  }
  
  return { valid: true };
}

/**
 * @description 验证评论内容是否包含非法内容
 * @param {string} content - 评论内容
 * @returns {Object} - 验证结果对象
 */
function validateMaliciousContent(content) {
  // scope='body'：评论为用户输入正文，跳过路径/文件特征类规则（secret/debug/.env 等易误杀），
  // 真实攻击仍由 sqlInjection/xss/commandInjection/pathTraversal 覆盖
  const result = checkKeywords(content, { scope: 'body' });
  if (result) {
    return { valid: false, msg: '评论内容包含非法内容' };
  }
  
  return { valid: true };
}

/**
 * @description 验证评论内容是否符合安全要求
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 * @param {Object} - 验证结果对象
 */

// 评论配置 60s 进程内缓存：该中间件在评论热路径上，原逻辑每请求查一次 sys_config；
// 后台改配置最迟 60s 生效（此前缓存层行为一致性已有同类取舍）
let _cfgCache = null;
let _cfgCacheAt = 0;
const CFG_TTL = 60 * 1000;

async function getCommentConfigCached() {
  if (_cfgCache && Date.now() - _cfgCacheAt < CFG_TTL) return _cfgCache;
  const { default: CommentService } = await import("../service/Comment.js");
  _cfgCache = await CommentService.getCommentConfig();
  _cfgCacheAt = Date.now();
  return _cfgCache;
}

export default () => {
  return async (req, res, next) => {
    try {
      const { content } = req.body;
      //内容是否为空
      if (!content || typeof content !== 'string') {
        return res.json({ success: false, msg: '评论内容不能为空' });
      }

      //获取评论配置（60s 进程内缓存，避免每请求查库）
      const config = await getCommentConfigCached();
      
      //验证评论内容长度
      const lengthValidation = validateContentLength(content, config);
      if (!lengthValidation.valid) {
        return res.json({ success: false, msg: lengthValidation.msg });
      }
      
      //验证评论内容是否包含敏感词
      const sensitiveValidation = validateSensitiveWords(content, config);
      if (!sensitiveValidation.valid) {
        return res.json({ success: false, msg: sensitiveValidation.msg });
      }
      
      //验证评论内容是否包含链接
      const linkValidation = validateLinks(content, config);
      if (!linkValidation.valid) {
        return res.json({ success: false, msg: linkValidation.msg });
      }
      
      //验证评论内容是否包含非法内容
      const maliciousValidation = validateMaliciousContent(content);
      if (!maliciousValidation.valid) {
        return res.json({ success: false, msg: maliciousValidation.msg });
      }
      
      next();
    } catch (error) {
      logger.error('[CommentSecurity] 验证失败:', error);
      next(error);
    }
  };
};