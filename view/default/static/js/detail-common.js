/**
 * default 模板详情页通用功能脚本 - 复制链接 / 分享海报 / 字号调整 / Toast提示
 * 依赖：qrcode.min.js、snapdom.js（由 share-poster.html 提前引入）
 *
 * 调用方式（供 share-bar.html 使用）：
 *   copyLink('站点名')           —— 复制「站点名 - 标题 + 链接」
 *   openPosterPreview()          —— 无参时读取 window.__posterData 生成海报
 */
(function () {
  'use strict';

  var TOAST_DURATION = 2000;
  var FONT_SIZE_MIN = 12;
  var FONT_SIZE_MAX = 24;
  var SUMMARY_MAX_LENGTH = 120;
  var DEFAULT_COVER_IMG = '/public/cover/02.jpg';
  var QR_CODE_CONFIG = { width: 144, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } };

  //===================
  // Toast 轻提示
  //===================
  function showToast(msg) {
    if (!msg) return;
    var toast = document.createElement('div');
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800/90 text-white px-4 py-2 rounded-lg text-sm z-[70] shadow-lg';
    toast.textContent = msg.trim();
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, TOAST_DURATION);
  }
  window.showToast = showToast;

  //===================
  // 复制分享链接
  //===================
  function copyLink(siteName) {
    siteName = siteName || '';
    var titleEl = document.querySelector('article h1') || document.querySelector('[data-share-title]');
    var pageTitle = (titleEl && titleEl.textContent) ? titleEl.textContent.trim() : document.title;
    var shareUrl = window.location.href;
    var copyText = siteName ? (siteName + ' - ' + pageTitle + '\n' + shareUrl) : (pageTitle + '\n' + shareUrl);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(copyText)
        .then(function () { showToast('链接已复制'); })
        .catch(function () { showToast('复制失败'); });
      return;
    }

    var textarea = document.createElement('textarea');
    textarea.value = copyText;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.zIndex = '-999';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('链接已复制');
    } catch (e) {
      showToast('复制失败');
    }
    document.body.removeChild(textarea);
  }
  window.copyLink = copyLink;

  //===================
  // 字号调整
  //===================
  function changeFontSize(delta) {
    var bodyEl = document.getElementById('articleBody') || document.querySelector('[data-share-body]');
    if (!bodyEl || isNaN(delta)) return;
    var currentSize = parseInt(bodyEl.style.fontSize, 10) || 16;
    currentSize = Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, currentSize + delta));
    bodyEl.style.fontSize = currentSize + 'px';
    var descEl = document.querySelector('.description');
    if (descEl) descEl.style.fontSize = currentSize + 'px';
  }
  window.changeFontSize = changeFontSize;

  //===================
  // 海报生成 - Blob
  //===================
  function generatePosterBlob() {
    var posterEl = document.getElementById('sharePoster');
    if (!posterEl || typeof snapdom === 'undefined') return Promise.resolve(null);
    return snapdom.toBlob(posterEl, { scale: 2, backgroundColor: '#ffffff' }).catch(function () { return null; });
  }
  window.generatePosterBlob = generatePosterBlob;

  //===================
  // 海报生成 - DataURL
  //===================
  function generatePosterDataUrl() {
    var posterEl = document.getElementById('sharePoster');
    if (!posterEl || typeof snapdom === 'undefined') return Promise.resolve('');
    return snapdom.toPng(posterEl, { scale: 2, backgroundColor: '#ffffff' })
      .then(function (img) { return (img && img.src) ? img.src : ''; })
      .catch(function () { return ''; });
  }
  window.generatePosterDataUrl = generatePosterDataUrl;

  //===================
  // 关闭海报预览
  //===================
  function closePosterPreview() {
    var mask = document.getElementById('posterPreviewMask');
    if (mask) mask.style.display = 'none';
  }
  window.closePosterPreview = closePosterPreview;

  //===================
  // 关闭分享弹窗（兼容）
  //===================
  function closeShareModal() {
    var modal = document.getElementById('share-modal');
    if (modal) modal.classList.add('hidden');
  }
  window.closeShareModal = closeShareModal;

  //===================
  // 海报DOM填充
  //===================
  function fillSharePoster(params) {
    params = params || {};

    // 标题（超长截断，配合 CSS 行数限制，避免文字过多溢出）
    var posterTitle = document.getElementById('posterTitle');
    if (posterTitle) {
      var _t = (params.title || '').trim();
      posterTitle.textContent = _t.length > 40 ? _t.slice(0, 40) + '…' : _t;
    }

    var posterSubTitle = document.getElementById('posterSubTitle');
    if (posterSubTitle) posterSubTitle.textContent = params.subTitle || params.title || '';

    var posterSummary = document.getElementById('posterSummary');
    if (posterSummary) {
      var text = params.summary || '';
      if (!text) {
        var bodyEl = document.getElementById('articleBody') || document.querySelector('[data-share-body]');
        if (bodyEl) {
          text = (bodyEl.innerText || bodyEl.textContent || '').replace(/\s+/g, ' ').trim();
        }
      }
      posterSummary.textContent = text.length > SUMMARY_MAX_LENGTH ? text.slice(0, SUMMARY_MAX_LENGTH) + '……' : text;
    }

    // 封面图（外部图加载失败时回退到本地默认图，避免空白）
    var posterCover = document.getElementById('posterCover');
    if (posterCover) {
      posterCover.onerror = function () { this.onerror = null; this.src = DEFAULT_COVER_IMG; };
      posterCover.src = params.cover || DEFAULT_COVER_IMG;
    }

    var posterQrcode = document.getElementById('posterQrcode');
    if (posterQrcode && typeof QRCode !== 'undefined') {
      QRCode.toDataURL(window.location.href, QR_CODE_CONFIG)
        .then(function (url) { posterQrcode.src = url; })
        .catch(function (err) { console.error('二维码生成失败', err); });
    }
  }

  //===================
  // 打开海报预览（无参时读取 window.__posterData）
  //===================
  function openPosterPreview(opts) {
    if (typeof opts === 'undefined' || opts === null) {
      opts = window.__posterData || {};
    }

    var previewImg = document.getElementById('previewImg');
    var previewMask = document.getElementById('posterPreviewMask');
    if (!previewImg || !previewMask) {
      showToast('海报组件未就绪，请稍后重试');
      return;
    }

    if (typeof opts === 'string') {
      opts = { msg: opts };
    }
    opts = opts || {};

    if (!opts.cover) {
      var bodyEl = document.getElementById('articleBody') || document.querySelector('[data-share-body]');
      var firstImg = bodyEl ? bodyEl.querySelector('img') : null;
      opts.cover = firstImg ? firstImg.src : DEFAULT_COVER_IMG;
    }

    if (!opts.title) {
      var titleEl = document.querySelector('article h1') || document.querySelector('[data-share-title]') || document.querySelector('h1');
      opts.title = titleEl ? titleEl.textContent.trim() : document.title;
    }

    fillSharePoster(opts);

    generatePosterDataUrl().then(function (dataUrl) {
      if (!dataUrl) {
        showToast('海报生成失败，请稍后重试');
        return;
      }
      previewImg.src = dataUrl;
      previewMask.style.display = 'flex';
      if (opts.msg) showToast(opts.msg);
    });
  }
  window.openPosterPreview = openPosterPreview;

  //===================
  // 页面预置数据自动初始化
  //===================
  function initSharePoster() {
    if (!window.__posterData) return;
    fillSharePoster({
      title: window.__posterData.title || '',
      summary: window.__posterData.summary || '',
      cover: window.__posterData.cover || '',
      subTitle: window.__posterData.subTitle || ''
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSharePoster);
  } else {
    initSharePoster();
  }

})();
