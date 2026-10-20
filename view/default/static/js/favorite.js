// 收藏按钮逻辑（vanilla JS，无需打包，照 comment.js 模式）
function favGetCookie(key) {
  const name = key + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(name) === 0) {
      return decodeURIComponent(c.substring(name.length));
    }
  }
  return null;
}

function favShowToast(message, type = 'info', duration = 2000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function favIsLoggedIn() {
  // ut 为登录态 token cookie（非 HttpOnly，统一方案），前端可直接读取判断登录态
  return !!favGetCookie('ut');
}

function favGoLogin() {
  // 会员登录页（SPA）位于 /public/member，跳过去登录
  const base = location.origin;
  window.location.href = `${base}/public/member/#/login`;
}

class FavoriteManager {
  constructor(item) {
    this.item = item; // { id, type, categoryId, categoryName, title, cover }
    this.favorited = false;
    this.favoriteId = null;
    this.loading = false;
  }

  // 进入详情页时，拉取收藏列表判断当前内容是否已收藏
  async checkStatus() {
    if (!favIsLoggedIn()) {
      this.render(false, null);
      return;
    }
    try {
      const res = await fetch(`/member/v1/favorites?page=1&pageSize=200&type=${encodeURIComponent(this.item.type)}`, {
        credentials: 'include'
      });
      const result = await res.json();
      const list = result?.data?.list || [];
      const found = list.find(f => String(f.article_id) === String(this.item.id) && (f.type || 'article') === this.item.type);
      if (found) {
        this.favorited = true;
        this.favoriteId = found.id;
        this.render(true, found.id);
      } else {
        this.render(false, null);
      }
    } catch (e) {
      console.error('[FavoriteManager] 查询收藏状态失败', e);
      this.render(false, null);
    }
  }

  async toggle() {
    if (this.loading) return;
    if (!favIsLoggedIn()) {
      favShowToast('请先登录', 'info');
      setTimeout(favGoLogin, 600);
      return;
    }

    this.loading = true;
    this.setLoading(true);
    try {
      if (this.favorited) {
        // 取消收藏
        const res = await fetch('/member/v1/deleteFavorite', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: this.favoriteId })
        });
        const result = await res.json();
        if (result.success) {
          this.favorited = false;
          this.favoriteId = null;
          this.render(false, null);
          favShowToast('已取消收藏', 'success');
        } else {
          favShowToast(result.msg || '取消收藏失败', 'error');
        }
      } else {
        // 添加收藏
        const res = await fetch('/member/v1/favorite', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articleId: this.item.id,
            articleTitle: this.item.title,
            articleCover: this.item.cover,
            articleUrl: location.pathname,
            type: this.item.type,
            categoryId: this.item.categoryId,
            categoryName: this.item.categoryName
          })
        });
        const result = await res.json();
        if (result.success) {
          this.favorited = true;
          this.favoriteId = result.data?.id || null;
          this.render(true, this.favoriteId);
          favShowToast('收藏成功', 'success');
        } else if (result.code === 1005) {
          // 已收藏（后端会回传已有记录 id，回填后可直接再次点击取消）
          this.favorited = true;
          this.favoriteId = result.data?.id || this.favoriteId;
          this.render(true, this.favoriteId);
          favShowToast('已收藏该内容', 'info');
        } else {
          favShowToast(result.msg || '收藏失败', 'error');
        }
      }
    } catch (e) {
      console.error('[FavoriteManager] 收藏操作失败', e);
      favShowToast('操作失败，请稍后重试', 'error');
    } finally {
      this.loading = false;
      this.setLoading(false);
    }
  }

  render(favorited, id) {
    const btn = document.getElementById('favorite-btn');
    if (!btn) return;
    btn.classList.toggle('is-favorited', !!favorited);
    const textEl = btn.querySelector('.favorite-text');
    if (textEl) textEl.textContent = favorited ? '已收藏' : '收藏';
    btn.disabled = false;
  }

  setLoading(loading) {
    const btn = document.getElementById('favorite-btn');
    if (btn) btn.classList.toggle('is-loading', loading);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const el = document.querySelector('[data-fav-item]');
  if (!el) return;

  const item = {
    id: el.dataset.favItem,
    type: el.dataset.type || 'article',
    categoryId: parseInt(el.dataset.categoryId) || 0,
    categoryName: el.dataset.categoryName || '',
    title: el.dataset.title || document.title || '',
    cover: el.dataset.cover || ''
  };

  const manager = new FavoriteManager(item);
  const btn = document.getElementById('favorite-btn');
  if (btn) {
    btn.disabled = false;
    btn.addEventListener('click', () => manager.toggle());
  }
  manager.checkStatus();
});
