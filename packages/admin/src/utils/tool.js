import Cookies from "js-cookie";

export const setTitle = (title) => {
  window.document.title = (title ? `${title}-chancms管理系统` : "chancms管理系统");
};

export const setCookie = (tokenName = "token", token) => {
  Cookies.set(tokenName, token);
};

export const getCookie = (tokenName = "token") => {
  return Cookies.get(tokenName);
};

export const removeCookie = (tokenName = "token") => {
  Cookies.remove(tokenName);
}


//无限极分类 适配 element-ui组件
export let addLabelValue = (arr,label = "name",value = "id") => {
  for (let item of arr) {

    if(item["name"]==''){
      item["name"] = "name"
    }
    item["label"] = item[label];
    item["value"] = item[value];
    if (item.children) {
      addLabelValue(item.children, label, value);
    }
  }
  return arr;
};

// 无限极分类tree
export let tree = (arr, pid = 0) => {
  let result = [];
  if (!Array.isArray(arr)) {
    return result;
  }
  arr.forEach((item) => {
    if (item.pid === pid) {
      let children = tree(arr, item.id);
      if (children.length) {
        item.children = children;
      }
      result.push(item);
    }
  });
  return result;
};


export let treeOneLevel = (arr, pid = 0) => {
  const result = [];
  // 遍历数组找出当前层节点
  arr.forEach(item => {
    if (item.pid !== pid) return;

    // 创建新节点（避免污染原数据）
    const node = { ...item, children: [] };

    // 递归收集所有后代节点（扁平化）
    const collect = (currentPid) => {
      const children = [];
      arr.forEach(child => {
        if (child.pid !== currentPid) return;
        // 复制子节点并移除其 children
        const childCopy = { ...child };
        delete childCopy.children; // 确保子节点没有嵌套
        children.push(childCopy);
        // 递归收集后代
        children.push(...collect(child.id));
      });
      return children;
    };

    // 所有后代节点塞入 children
    node.children = collect(item.id);
    result.push(node);
  });

  return result;
};


//返回id父级所有栏目
export let treeById = (id, source) => {
  const arr = [];
  let findId = (id, source) => {
    for (let i = 0, item; i < source.length; i++) {
      item = source[i];
      if (item.id == id) {
        arr.unshift(item.id);
        if (item.pid != 0) {
          findId(item.pid, source);
        }
      }
    }
  };
  findId(id, source);
  return arr;
};

// html过滤出图片
export let getImgUrlFromStr = (str) => {
  let imgReg = /<img.*?(?:>|\/>)/gi; //匹配出图片img标签
  // eslint-disable-next-line no-useless-escape
  let srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i; //匹配出图片src属性
  let arr = str.match(imgReg);
  let imgArr = [];
  if (arr) {
    for (let i = 0; i < arr.length; i++) {
      let src = arr[i].match(srcReg);
      if (src[1]) {
        imgArr.push(src[1]);
      }
    }
  }
  return imgArr;
};

export let filterAndReplaceImgSrc = (html) => {
  var regex = /<img[^>]+src="([^">]+)"/g;
  var result = html.replace(regex, function (match, src) {
    if (src.startsWith("public")) {
      src = src.replace("public", "/public");
    }
    return '<img src="' + src + '"';
  });
  return result;
};

// 过滤 html标签
export let filterHtml = (str) => {
  // 查找第一个段落的结束位置
  let endIndex = str.indexOf("</p>");
  // 如果找到第一个段落的结束位置
  if (endIndex !== -1) {
    // 将字符串截断到第一个段落的结束位置加上"</p>"的长度
    str = str.substring(0, endIndex + 4);
  }
  // 创建一个临时元素，用于处理字符串中的HTML内容
  let tempElement = document.createElement("div");
  tempElement.innerHTML = str;
  // 获取处理后的文本内容，包括实体字符
  let filteredText = tempElement.textContent;
  // 如果文本内容超过255个字符
  if (filteredText.length > 225) {
    // 向前查找中文句号进行分割
    let splitIndex = filteredText.lastIndexOf("。", 255);
    // 如果找到分割点，则将字符串分割成两个部分
    if (splitIndex !== -1) {
      filteredText = filteredText.slice(0, splitIndex + 1);
    }
  }
  // 销毁临时元素，释放内存
  tempElement.remove();
  return filteredText;
};

// 过滤 body标签
export let filterBody = (str) => {
  const result = /<body[^>]*>([\s\S]*)<\/body>/.exec(str);
  if (result && result.length === 2) return result[1];
  return str;
};

/*html加码*/
export let htmlEncode = (str) => {
  if (str.length == 0) return "";
  var s = str.replace(/&/g, "&amp;");
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  s = s.replace(/ /g, "&nbsp;");
  s = s.replace(/'/g, "&#39;");
  s = s.replace(/"/g, "&quot;");
  return s;
};
/*html解码*/
export let htmlDecode = (str) => {
  if (str.length == 0) return "";
  var s = str.replace(/&amp;/g, "&");
  s = s.replace(/&lt;/g, "<");
  s = s.replace(/&gt;/g, ">");
  s = s.replace(/&nbsp;/g, " ");
  s = s.replace(/&#39;/g, "'");
  s = s.replace(/&quot;/g, '"');
  return s;
};


export let showErrors = (invalidFields) => {
  Object.keys(invalidFields).forEach((field) => {
    const errors = invalidFields[field].map((err) => err.message);
    ElMessage.warning({
      message: `${errors.join(', ')}`,
      duration: 2000
    });
  });
};

/**
 * 解析代码编辑器里的 JSON 文本，失败时「返回错误」而不是静默丢弃。
 * 背景：编辑页曾用 try { JSON.parse(x) } catch { v = null }，语法错就把字段置 null，
 * 提交后直接把库里已存的配置清零，且用户完全无感知（2026-09-01 栏目 aigeo 事故）。
 * 现在统一走这里：调用方必须判断 ok，失败时提示并拦住提交。
 * @param {string} text 编辑器原文
 * @returns {{ok: boolean, value: any, error: string, raw: string}}
 *   ok=true  value 为解析结果（原文为空时 value=null，表示"清空"，属合法提交）
 *   ok=false error 为带行列信息的错误描述，raw 为原文（便于用户修正后重解析）
 */
export let parseJsonText = (text) => {
  const raw = (text ?? '').toString().trim();
  if (!raw) return { ok: true, value: null, error: '', raw };
  try {
    return { ok: true, value: JSON.parse(raw), error: '', raw };
  } catch (e) {
    const msg = e.message || 'JSON 语法错误';
    let location = '';
    const matched = /position (\d+)/.exec(msg);
    // 新版 V8 已自带 (line x column y)，避免重复标注
    if (matched && !/line \d+ column \d+/.test(msg)) {
      const pos = Number(matched[1]);
      const upto = raw.slice(0, pos);
      const line = upto.split('\n').length;
      const column = pos - upto.lastIndexOf('\n');
      location = `第 ${line} 行第 ${column} 列：`;
    }
    return { ok: false, value: null, error: `${location}${msg}`, raw };
  }
};


