/**
 * default 模板通用脚本
 * 提供 ChanApp 全局对象：initMobileNav / initBackTop / initLazyLoad / initSideToolbar / initClearableFields
 */
(function () {
  'use strict';

  window.ChanApp = {

    //===================
    // 移动端侧边导航
    //===================
    initMobileNav: function () {
      var panel = document.getElementById('mobile-panel');
      var content = document.getElementById('mobile-panel-content');
      if (!panel || !content) return;

      // 打开侧边菜单
      document.querySelectorAll('[data-open="mobile-nav"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          document.body.style.overflow = 'hidden';
          panel.classList.remove('hidden');
          requestAnimationFrame(function () { content.classList.remove('-translate-x-full'); });
        });
      });

      // 关闭侧边菜单
      document.querySelectorAll('[data-close="mobile-nav"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          content.classList.add('-translate-x-full');
          setTimeout(function () {
            panel.classList.add('hidden');
            document.body.style.overflow = '';
          }, 300);
        });
      });

      // 点击遮罩关闭
      panel.addEventListener('click', function (e) {
        if (e.target === panel) {
          content.classList.add('-translate-x-full');
          setTimeout(function () {
            panel.classList.add('hidden');
            document.body.style.overflow = '';
          }, 300);
        }
      });
    },

    //===================
    // 章节目录抽屉（书籍章节页）：左缘圆钮 / 底部目录按钮 → 左滑面板
    //===================
    initChapterDrawer: function () {
      var panel = document.getElementById('chapter-drawer');
      var content = document.getElementById('chapter-drawer-content');
      if (!panel || !content) return;

      function openDrawer() {
        document.body.style.overflow = 'hidden';
        panel.setAttribute('aria-hidden', 'false');
        panel.classList.remove('hidden');
        requestAnimationFrame(function () { content.classList.remove('-translate-x-full'); });
        // 打开时将当前章节滚动到列表中部，方便快速定位
        var list = document.getElementById('chapter-drawer-list');
        var active = list && list.querySelector('.is-active');
        if (active) {
          var listRect = list.getBoundingClientRect();
          var activeRect = active.getBoundingClientRect();
          list.scrollTop += activeRect.top - listRect.top - list.clientHeight / 2 + activeRect.height / 2;
        }
      }

      function closeDrawer() {
        content.classList.add('-translate-x-full');
        panel.setAttribute('aria-hidden', 'true');
        setTimeout(function () {
          panel.classList.add('hidden');
          document.body.style.overflow = '';
        }, 300);
      }

      // 打开：左缘圆钮 + 底部目录按钮共用
      document.querySelectorAll('[data-open-chapter-drawer]').forEach(function (btn) {
        btn.addEventListener('click', openDrawer);
      });

      // 关闭：头部关闭按钮 + 遮罩
      document.querySelectorAll('[data-close-chapter-drawer]').forEach(function (btn) {
        btn.addEventListener('click', closeDrawer);
      });
      panel.addEventListener('click', function (e) {
        if (e.target === panel) closeDrawer();
      });

      // ESC 关闭
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !panel.classList.contains('hidden')) closeDrawer();
      });
    },

    //===================
    // 返回顶部
    //===================
    initBackTop: function () {
      var btn = document.querySelector('.back-to-top');
      if (!btn) return;

      window.addEventListener('scroll', function () {
        if (window.scrollY > 300) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
      });

      btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },

    //===================
    // 图片懒加载
    //===================
    initLazyLoad: function () {
      if (!('IntersectionObserver' in window)) {
        // 不支持时直接加载所有 lazy 图片
        document.querySelectorAll('img[data-src]').forEach(function (img) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        });
        return;
      }

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      }, { rootMargin: '100px' });

      document.querySelectorAll('img[data-src]').forEach(function (img) {
        observer.observe(img);
      });
    },

    //===================
    // 右侧浮层（返回顶部 / 电话 / 微信 / 留言）+ 弹窗
    //===================
    initSideToolbar: function () {
      var toolbar = document.getElementById('side-toolbar');
      if (!toolbar) return;

      // 浮层按钮 → 打开对应弹窗
      toolbar.querySelectorAll('[data-action]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var action = btn.getAttribute('data-action');
          if (action === 'phone') ChanApp.openModal('phone');
          else if (action === 'wechat') ChanApp.openModal('wechat');
          else if (action === 'message') ChanApp.openModal('message');
        });
      });

      // 留言表单提交
      var form = document.getElementById('message-form');
      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          ChanApp.submitMessage(form);
        });
      }

      // ESC 关闭所有弹窗
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          ['phone', 'wechat', 'message'].forEach(function (n) { ChanApp.closeModal(n); });
        }
      });
    },

    //===================
    // 输入框内「清空」按钮（[data-clearable] + 同容器 .field-clear，样式见 common/head.html）
    // 有内容时出现；若当前页正是被该词过滤的（服务端渲染进来了值），点击等于回到未过滤地址
    //===================
    initClearableFields: function () {
      document.querySelectorAll('[data-clearable]').forEach(function (input) {
        var wrap = input.parentElement;
        var btn = wrap ? wrap.querySelector('.field-clear') : null;
        if (!btn) return;

        // 服务端渲染的初值 = 当前页正在生效的过滤词
        var applied = input.value;
        var sync = function () { btn.classList.toggle('is-on', input.value.length > 0); };

        input.addEventListener('input', sync);
        input.addEventListener('change', sync);
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && input.value) btn.click();
        });
        sync();

        btn.addEventListener('click', function () {
          var resetUrl = input.getAttribute('data-reset-url');
          // 页面已被该关键词过滤 → 回未过滤地址；只是刚敲进去的文本 → 就地清空
          if (applied && resetUrl) { window.location.href = resetUrl; return; }
          input.value = '';
          sync();
          input.focus();
        });
      });
    },

    // 弹窗开关（动效样式见 common/head.html：整层在屏幕中间直接淡入/淡出，无位移）
    openModal: function (name) {
      var m = document.getElementById(name + '-modal');
      if (!m) return;
      m.classList.remove('hidden');
      m.classList.remove('is-closing');
      // 强制 reflow：确保淡入动画在重复打开时也能重新播放
      m.style.animation = 'none';
      void m.offsetWidth;
      m.style.animation = '';
      document.body.style.overflow = 'hidden';
    },

    closeModal: function (name) {
      var m = document.getElementById(name + '-modal');
      if (!m || m.classList.contains('hidden') || m.classList.contains('is-closing')) return;
      m.classList.add('is-closing');
      setTimeout(function () {
        // 等待期间若被重新打开（is-closing 已被移除）则不隐藏
        if (!m.classList.contains('is-closing')) return;
        m.classList.add('hidden');
        m.classList.remove('is-closing');
        document.body.style.overflow = '';
      }, 150);
    },

    submitMessage: function (form) {
      var getVal = function (n) {
        var el = form.querySelector('[name="' + n + '"]');
        return el ? el.value.trim() : '';
      };
      var name = getVal('name');
      var company = getVal('company');
      var tel = getVal('tel');
      var email = getVal('email');
      var content = getVal('content');

      if (!name) return ChanApp.toast('请填写姓名');
      if (name.length < 2) return ChanApp.toast('姓名长度不能少于2个字');
      if (company && company.length < 5) return ChanApp.toast('公司名称不能少于5个字');
      if (!tel) return ChanApp.toast('请填写联系手机号');
      if (!/^\d{11}$/.test(tel)) return ChanApp.toast('请输入11位手机号');
      if (!email) return ChanApp.toast('请填写电子邮箱');
      if (!/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(email)) return ChanApp.toast('邮箱格式不正确');
      if (!content) return ChanApp.toast('请填写需求描述');

      var btn = form.querySelector('[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = '提交中...'; }

      fetch('/cms/message/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          company: company,
          tel: tel,
          email: email,
          content: content
        })
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (btn) { btn.disabled = false; btn.textContent = '提交留言'; }
          if (res && res.success) {
            ChanApp.closeModal('message');
            form.reset();
            ChanApp.toast('提交成功，我们会尽快与您联系', 'success');
          } else {
            ChanApp.toast((res && res.msg) || '提交失败，请稍后重试');
          }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = '提交留言'; }
          ChanApp.toast('网络错误，请稍后重试');
        });
    },

    toast: function (msg, type) {
      var t = document.createElement('div');
      t.style.cssText = 'position:fixed;left:50%;top:20px;transform:translateX(-50%);z-index:100;padding:8px 16px;border-radius:8px;color:#fff;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,.15);max-width:90vw;text-align:center;background:' + (type === 'success' ? '#10b981' : '#1e293b') + ';';
      t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2800);
    }
  };

})();
