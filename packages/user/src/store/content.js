import { defineStore } from 'pinia'
import { ref } from 'vue'
import memberApi from '../api/member'

export const useContentStore = defineStore('content', () => {
  // 用户信息缓存：MainLayout 进入时拉取一次，MemberCenter 等页面复用，避免重复请求 /member/v1/detail
  const userInfo = ref(null)

  function setUserInfo(data) {
    userInfo.value = data
  }

  function getFavorites(page = 1, pageSize = 10) {
    return memberApi.getFavorites(page, pageSize)
  }

  function removeFavorite(articleId) {
    return memberApi.deleteFavorite(articleId)
  }

  function getComments(page = 1, pageSize = 10) {
    return memberApi.getComments(page, pageSize)
  }

  function removeComment(commentId) {
    return memberApi.deleteComment(commentId)
  }

  function likeComment(commentId) {
    return memberApi.likeComment(commentId)
  }

  return {
    userInfo,
    setUserInfo,
    getFavorites,
    removeFavorite,
    getComments,
    removeComment,
    likeComment
  }
})
