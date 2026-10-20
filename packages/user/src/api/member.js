import http from '@/utils/http'
import { validateComment, sanitizeComment } from '../utils/commentValidator'

const API_BASE = '/member/v1'

// 辅助函数：生成文章URL
function getArticleUrl(articleId, articlePath) {
  return articlePath
    ? `/${articlePath}/article-${articleId}.html`
    : `/article-${articleId}.html`
}

/**
 * 统一请求封装（复用 utils/http.js 实例，享受鉴权/错误处理/跳登录等拦截器）
 * @param {string} method - HTTP 方法
 * @param {string} url - 接口路径（不含 /member/v1 前缀）
 * @param {Object} [data] - 请求体（POST/PUT）
 * @returns {Promise<Object>} 后端响应数据（含 code/msg/data）
 */
async function request(method, url, data = null) {
  const config = {
    method,
    url: `${API_BASE}${url}`,
  }
  if (data) config.data = data
  // http.js 响应拦截器返回的是 data（含 code/msg/data），直接透传
  return await http(config)
}

export default {
  async getComments(page = 1, pageSize = 10) {
    const response = await request('GET', `/comments?page=${page}&pageSize=${pageSize}`)
    const data = response.data || {}
    return {
      items: (data.list || []).map(item => ({
        id: item.id,
        articleId: item.articleId,
        articleTitle: item.articleTitle,
        content: item.content,
        status: item.status,
        articlePath: item.articlePath,
        likeCount: item.like_count || 0,
        isLiked: !!item.is_liked,
        created_at: item.created_at
      })),
      total: data.total || 0,
      page: data.page || 1,
      pageSize: pageSize
    }
  },
  
  async addComment(articleId, content) {
    const validation = validateComment(content)
    if (!validation.valid) {
      throw new Error(validation.msg)
    }
    
    const sanitizedContent = sanitizeComment(content)
    const response = await request('POST', '/comment', { articleId, content: sanitizedContent })
    return response
  },
  
  async deleteComment(id) {
    const response = await request('POST', '/deleteComment', { id })
    return response
  },
  
  async getFavorites(page = 1, pageSize = 10, { type = '', categoryId = 0, keyword = '' } = {}) {
    const params = new URLSearchParams({ page, pageSize })
    if (type) params.append('type', type)
    if (categoryId) params.append('categoryId', categoryId)
    if (keyword) params.append('keyword', keyword)
    const response = await request('GET', `/favorites?${params.toString()}`)
    const data = response.data || {}
    return {
      items: (data.list || []).map(item => ({
        id: item.id,
        articleId: item.article_id,
        title: item.article_title,
        cover: item.article_cover,
        summary: item.article_summary,
        url: item.article_url || getArticleUrl(item.article_id, item.article_path),
        articlePath: item.article_path,
        type: item.type || 'article',
        categoryId: item.category_id || 0,
        categoryName: item.category_name || '',
        favoriteTime: item.created_at
      })),
      total: data.total || 0,
      page: data.page || 1,
      pageSize: pageSize
    }
  },

  async addFavorite({ articleId, articleTitle, articleCover = '', articleSummary = '', articleUrl = '', type = 'article', categoryId = 0, categoryName = '' }) {
    const response = await request('POST', '/favorite', {
      articleId,
      articleTitle,
      articleCover,
      articleSummary,
      articleUrl,
      type,
      categoryId,
      categoryName
    })
    return response
  },
  
  async deleteFavorite(id) {
    const response = await request('POST', '/deleteFavorite', { id })
    return response
  },

  async likeComment(id) {
    const response = await request('POST', '/likeComment', { id })
    return response
  }
}
