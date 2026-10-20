import { userStore } from '@/stores/user';

/**
 * @description: 权限指令（resource-action RBAC）
 * @param {Object} el 指令所绑定的元素
 * @param {Object} binding 指令所绑定的值（权限码数组，如 ['cms:article:update']）
 * @usage: <el-button v-permission="['cms:article:update']">保存</el-button>
 * @behavior: 无权限时按钮置灰 + 拦截点击 + 悬停提示「当前角色暂无操作权限」
 *
 * 🔴 使用边界（2026-09-12 定稿）：本指令**只用于「提交类」按钮**
 *    —— 保存 / 提交 / 确定 / 删除 / 批量删除 / 导入 等真正改数据的动作。
 *    「入口类」按钮（新增 / 编辑 / 查看 / 设置）**不加**指令：游客要能打开
 *    页面与弹窗（看得到界面和数据），只挡住最后一步提交；越权写入由后端 403 兜底。
 */

const TIP_TEXT = '当前角色暂无操作权限';

// ============ 提示气泡（单例，挂到 body 上避免被 overflow 裁切） ============
let tipEl = null;
let tipBound = false;

function ensureTip() {
  if (tipEl && document.body.contains(tipEl)) return tipEl;
  tipEl = document.createElement('div');
  tipEl.className = 'perm-tip';
  tipEl.textContent = TIP_TEXT;
  document.body.appendChild(tipEl);
  if (!tipBound) {
    tipBound = true;
    // 滚动/缩放时收起，避免气泡与按钮脱位
    window.addEventListener('scroll', hideTip, true);
    window.addEventListener('resize', hideTip);
  }
  return tipEl;
}

function showTip(el) {
  const tip = ensureTip();
  const r = el.getBoundingClientRect();
  tip.style.visibility = 'hidden';
  tip.style.display = 'block';

  const tw = tip.offsetWidth;
  const th = tip.offsetHeight;
  // 优先在按钮上方；空间不足改到下方
  let placement = 'top';
  let top = r.top - th - 8;
  if (top < 4) {
    placement = 'bottom';
    top = r.bottom + 8;
  }
  let left = r.left + r.width / 2 - tw / 2;
  left = Math.max(4, Math.min(left, window.innerWidth - tw - 4));

  tip.dataset.placement = placement;
  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;
  tip.style.visibility = '';
  tip.classList.add('is-show');
}

function hideTip() {
  if (tipEl) tipEl.classList.remove('is-show');
}

// ============ 权限判定 ============
function isAllowed(binding) {
  const store = userStore();
  const perms = store.perms || []; // 实际权限码（后端 sys_permission，登录时注入）
  const required = binding.value || [];
  // 通配 *:*:*（超管）放行一切；其余按具体权限码精确匹配
  return perms.includes('*:*:*') || required.some((p) => perms.includes(p));
}

// 移除点击拦截器与 hover 监听
function clearGuard(el) {
  if (el.__permPrevent__) {
    el.removeEventListener('click', el.__permPrevent__, true);
    delete el.__permPrevent__;
  }
  if (el.__permTip__) {
    const { onEnter, onLeave } = el.__permTip__;
    el.removeEventListener('mouseenter', onEnter);
    el.removeEventListener('mouseleave', onLeave);
    el.removeEventListener('focus', onEnter);
    el.removeEventListener('blur', onLeave);
    delete el.__permTip__;
  }
  delete el.dataset.permBlocked;
}

// 应用权限态：无权限 → 置灰 + 拦截点击 + 悬停提示；有权限 → 仅解除自己的拦截器
// 🔴 有权限时不得回写 class/disabled —— 组件自身的 :disabled（如「当前项不可点」）
//    归组件逻辑管，指令不能覆盖，否则会把本该禁用的按钮「放开」
// 🔴 无权限时**刻意不设 disabled 属性**：浏览器对 disabled 元素不派发 mouseenter，
//    悬停提示会失效。改为只加 is-disabled 类（Element Plus 自带的禁用观感）+ 捕获期拦截点击。
function applyPermission(el, binding) {
  if (isAllowed(binding)) {
    clearGuard(el);
    return;
  }
  el.classList.add('is-disabled');
  el.style.cursor = 'not-allowed';
  el.style.opacity = '0.6';
  el.dataset.permBlocked = '1';

  if (!el.__permPrevent__) {
    const prevent = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    el.__permPrevent__ = prevent;
    el.addEventListener('click', prevent, true);
  }
  if (!el.__permTip__) {
    const onEnter = () => {
      if (el.dataset.permBlocked === '1') showTip(el);
    };
    const onLeave = () => hideTip();
    el.__permTip__ = { onEnter, onLeave };
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('focus', onEnter);
    el.addEventListener('blur', onLeave);
  }
}

export default {
  mounted(el, binding) {
    applyPermission(el, binding);
  },
  // 🔴 必须在 updated 重新施加：绑定动态 :disabled / :class 的按钮，
  //    Vue 在组件更新时会重写 class 与 disabled 属性，把 mounted 时加的
  //    is-disabled 冲掉 → 无权限用户会看到「可点」的按钮（视觉泄漏）。
  //    实测案例：带 :disabled="!activeFolder || activeFolder === current" 这类动态
  //    绑定的提交按钮（如站点设置里选完模板后按钮从 disabled 变可点）。
  updated(el, binding) {
    applyPermission(el, binding);
  },
  unmounted(el) {
    clearGuard(el);
    hideTip();
  },
};
