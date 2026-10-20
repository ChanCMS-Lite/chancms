import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'
import MemberCenter from '@/views/user/MemberCenter.vue';
import Cookies from "js-cookie";
// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/reg',
    name: 'Register',
    component: () => import('@/views/login/Register.vue'),
    meta: {
      title: '注册',
      auth: false
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: {
      title: '登录',
      auth: false
    }
  },
  {
    path: '/repass',
    name: 'ResetPassword',
    component: () => import('@/views/login/Repass.vue'),
    meta: {
      title: '找回密码',
      auth: false
    }
  },
  // 个人中心相关页面，使用MainLayout作为父组件
  {
    path: '/',
    component: MainLayout,
    meta: {
      auth: true
    },
    children: [
      {
        path: 'index',
        name: 'MemberCenter',
        component: MemberCenter,
        meta: {
          title: '个人中心',
          auth: true
        }
      },
      {
        path: 'settings',
        name: 'SecuritySettings',
        component: () => import('@/views/user/SecuritySettings.vue'),
        meta: {
          title: '安全设置',
          auth: true
        }
      },
      {
        path: 'fav',
        name: 'Favorites',
        component: () => import('@/views/Favorites.vue'),
        meta: {
          title: '我的收藏',
          auth: true
        }
      },
      {
        path: 'comment',
        name: 'Comments',
        component: () => import('@/views/Comments.vue'),
        meta: {
          title: '我的评论',
          auth: true
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面不存在'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局前置守卫
// 鉴权说明（统一登录态方案）：
// - ut 为登录态 token cookie，现已非 HttpOnly，前端可直接读取判断登录态。
// - 真正的鉴权仍依赖后端 ut，每个需鉴权的 API 由后端校验，失败时通过 code 1001/1002/1010 触发跳登录。
// - 即使前端 ut 被伪造，也无法通过任何受保护接口获取数据。
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - CMS个人中心` : 'CMS个人中心'

  // 检查用户是否已登录（直接读 ut token cookie，非 HttpOnly 可读）
  const isLoggedIn = !!Cookies.get('ut')

  // 如果已登录，并且要访问的是登录、注册、找回密码等页面，则重定向到个人中心
  if (isLoggedIn) {
    if (['Login', 'Register', 'ResetPassword'].includes(to.name)) {
      next({ name: 'MemberCenter' })
      return
    }
  }

  // 检查目标路由是否需要认证
  if (to.meta.auth) {
    if (isLoggedIn) {
      next() // 已登录，放行
    } else {
      // 未登录，重定向到登录页，并携带当前页面作为 redirect 参数
      next({ 
        name: 'Login', 
        query: { redirect: to.fullPath } 
      })
    }
  } else {
    next() // 不需要认证的页面，直接放行
  }
})
export default router