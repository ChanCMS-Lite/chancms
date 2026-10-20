import API from '@/config/index.js'
import http from '@/utils/http.js'

export let rolelist = (params = {}) => {
  return http({
    url: `${API.BASE_API}/base/role/list`,
    method: 'get',
    params,
  })
}
export let list = (params = {}) => {
  return http({
    url: `${API.BASE_API}/base/user/list`,
    method: 'get',
    params,
  })
}

export let create = (params = {}) => {
  return http({
    url: `${API.BASE_API}/base/user/create`,
    method: 'post',
    data: params,
  })
}

export let detail = (params = {}) => {
  return http({
    url: `${API.BASE_API}/base/user/detail`,
    method: 'get',
    params: params,
  })
}

export let roleDetail = (params = {}) => {
  return http({
    url: `${API.BASE_API}/base/userRole/detail`,
    method: 'get',
    params: params,
  })
}

export let update = (params = {}) => {
  return http({
    url: `${API.BASE_API}/base/user/update`,
    method: 'post',
    data: params,
  })
}

export let remove = (data = {}) => {
  return http({
    url: `${API.BASE_API}/base/user/delete`,
    method: 'post',
    data: data,
  })
}
