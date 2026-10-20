const COMMENT_CONFIG = {
  minLength: 5,
  maxLength: 500,
  maxLinks: 2,
  sensitiveWords: '',
  enableSensitiveFilter: true,
  enableLinkFilter: true
};

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<\s*\/?\s*(script|iframe|object|embed|form|input|button)/gi
];

const MALICIOUS_KEYWORDS = [
  'alert(', 'confirm(', 'prompt(',
  'document.cookie', 'document.location',
  'window.location', 'eval(',
  'innerHTML', 'outerHTML',
  'setTimeout(', 'setInterval(',
  'Function('
];

function validateLength(content) {
  if (!content || typeof content !== 'string') {
    return { valid: false, msg: '评论内容不能为空' };
  }

  if (content.length < COMMENT_CONFIG.minLength) {
    return { valid: false, msg: `评论内容至少${COMMENT_CONFIG.minLength}个字符` };
  }

  if (content.length > COMMENT_CONFIG.maxLength) {
    return { valid: false, msg: `评论内容不能超过${COMMENT_CONFIG.maxLength}个字符` };
  }

  return { valid: true };
}

function validateXSS(content) {
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(content)) {
      return { valid: false, msg: '评论内容包含非法字符' };
    }
  }

  return { valid: true };
}

function validateSensitiveWords(content) {
  if (!COMMENT_CONFIG.enableSensitiveFilter || !COMMENT_CONFIG.sensitiveWords) {
    return { valid: true };
  }

  const words = COMMENT_CONFIG.sensitiveWords.split(',').map(w => w.trim()).filter(w => w);
  for (const word of words) {
    if (content.toLowerCase().includes(word.toLowerCase())) {
      return { valid: false, msg: '评论内容包含敏感词' };
    }
  }

  return { valid: true };
}

function validateLinks(content) {
  if (!COMMENT_CONFIG.enableLinkFilter) {
    return { valid: true };
  }

  const linkPattern = /https?:\/\/[^\s]+/gi;
  const links = content.match(linkPattern) || [];
  if (links.length > COMMENT_CONFIG.maxLinks) {
    return { valid: false, msg: `单条评论最多包含${COMMENT_CONFIG.maxLinks}个链接` };
  }

  return { valid: true };
}

function validateMaliciousContent(content) {
  for (const keyword of MALICIOUS_KEYWORDS) {
    if (content.includes(keyword)) {
      return { valid: false, msg: '评论内容包含非法内容' };
    }
  }

  return { valid: true };
}

function sanitizeContent(content) {
  let sanitized = content;

  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized.trim();
}

export function validateComment(content) {
  const lengthResult = validateLength(content);
  if (!lengthResult.valid) {
    return lengthResult;
  }

  const xssResult = validateXSS(content);
  if (!xssResult.valid) {
    return xssResult;
  }

  const sensitiveResult = validateSensitiveWords(content);
  if (!sensitiveResult.valid) {
    return sensitiveResult;
  }

  const linkResult = validateLinks(content);
  if (!linkResult.valid) {
    return linkResult;
  }

  const maliciousResult = validateMaliciousContent(content);
  if (!maliciousResult.valid) {
    return maliciousResult;
  }

  return { valid: true };
}

export function sanitizeComment(content) {
  return sanitizeContent(content);
}