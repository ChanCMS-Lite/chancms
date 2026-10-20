import http from '../utils/http.js'
import API from '../config/index.js'

/**
 * @description 获取上传方式（Lite 精简版固定返回本地 '1'）
 * @returns {Promise<string>} 1=本地
 */
export let getUploadWay = async () => {
  let res = await http({
    url: `${API.BASE_API}/cms/site/info`,
    method: 'get',
  })
  if (res.code === 0) {
    return res.data.uploadWay
  }
  return '1'
}

/**
 * 统一上传函数
 * @param {FormData} data - 表单数据
 * @param {string} type - 'image'=图片 'file'=文件（含PDF/视频等）
 * @param {Object} opts - { max: number } 可选，限制文件数
 * @returns {Promise<Object>} 上传结果 { code, data: [{url, path, link, ...}] }
 */
export let upload = async (data, type = 'image', opts = {}) => {
  const max = opts.max || 20
  // Lite 精简版仅本地上传：后端统一 /imgs 与 /files 两个入口
  const endpoint = type === 'file' ? 'files' : 'imgs'
  const host = 'local'

  const url = `${API.BASE_API}/oss/${host}/${endpoint}${max !== 20 ? `?max=${max}` : ''}`

  // 本地存储上传；单独放宽超时到 120s，避免大文件被全局 10s 超时掐断
  const result = await http({
    url,
    method: 'post',
    headers: { 'Content-type': 'multipart/form-data' },
    data,
    timeout: 120000,
    onUploadProgress: opts.onUploadProgress,
  })
  if (result && result.code === 0) result.provider = host
  return result
}

/**
 * @description Logo 上传（专用接口，不分日期目录）
 * @param {FormData} data
 */
export let uploadLogo = (data, opts = {}) => {
  return http({
    url: `${API.BASE_API}/oss/local/logo`,
    method: 'post',
    headers: { 'Content-type': 'multipart/form-data' },
    data,
    timeout: 120000,
    onUploadProgress: opts.onUploadProgress,
  })
}

/**
 * @description 删除文件
 * @param {Object} params - { url: 文件路径 }
 */
export let deleteFile = data => {
  return http({
    url: `${API.BASE_API}/oss/local/delete`,
    method: 'post',
    data,
  })
}

/**
 * @description 上传封面图到 public/cover（图片专用，扁平存储不分日期目录）
 */
export let uploadCover = (data, opts = {}) => {
  return http({
    url: `${API.BASE_API}/oss/local/cover`,
    method: 'post',
    headers: { 'Content-type': 'multipart/form-data' },
    data,
    timeout: 120000,
    onUploadProgress: opts.onUploadProgress,
  })
}

/**
 * @description 列举 public/cover 根目录下的封面图（安全：后端固定目录、不递归、仅图片）
 */
export let coverList = () => {
  return http({
    url: `${API.BASE_API}/oss/local/cover/list`,
    method: 'get',
  })
}

/**
 * @description 解压压缩包
 * @param {Object} params - { url: 压缩包路径 }
 */
export let extractArchive = params => {
  return http({
    url: `${API.BASE_API}/oss/local/extract`,
    method: 'get',
    params,
  })
}

/**
 * @description 获取上传配置
 */
export let getUploadConfig = async () => {
  let res = await http({
    url: `${API.BASE_API}/base/config/getlist`,
    method: 'get',
    params: { type_code: 'upload_config' }
  })
  if (res.code === 0 && res.data) {
    const config = {}
    const list = res.data.list || res.data
    if (Array.isArray(list)) {
      list.forEach(item => {
        // 后端 sys_config.upload_config 以「MB」为单位存储（如 100 = 100MB），
        // 支持小数（0.5 = 512KB）；此处换算回字节，保证 uploadConfig 内部始终为字节
        //（与 multer / 前端校验一致）。uploadDir 为目录名字符串，原样保留。
        if (item.config_key === 'uploadDir') {
          config[item.config_key] = item.config_value
        } else {
          // MB → 字节（与后端 remote-config.js 的换算口径保持一致）
          const mb = parseFloat(item.config_value)
          config[item.config_key] = Number.isFinite(mb) && mb > 0 ? Math.round(mb * 1024 * 1024) : 0
        }
      })
    }
    return config
  }
  return null
}
