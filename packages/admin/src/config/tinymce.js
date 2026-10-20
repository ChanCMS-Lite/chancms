//http://tinymce.ax-z.cn/configure/content-filtering.php#allow_conditional_comments
//  http://tinymce.ax-z.cn/

import { getUploadWay } from "@/api/upload.js";
import { resolveOssUrl } from "@/utils/oss-url.js";

// 上传方式配置：Lite 精简版仅本地上传
const uploadConfig = {
  '1': '/oss/local/imgs',
};

// 动态获取上传地址的函数
export const getTinymceUploadUrl = async () => {
  const uploadWay = await getUploadWay();
  return uploadConfig[uploadWay] || uploadConfig['1'];
};

// 默认配置（使用本地上传作为默认值）
export let tinymceSet = {
  remove_trailing_brs: true,
  convert_urls: false,
  custom_images_upload: true,
  images_upload_url: '/oss/local/imgs',
  // 图片上传大小限制（字节），默认 200KB；加载后端 upload_config.imgSize 后会被覆盖（见 utils/upload.js）
  custom_images_limit_size: 200 * 1024,
  branding: false, //是否禁用“Powered by TinyMCE”
  menubar: true, //顶部菜单栏显示
  // image_dimensions: false, //去除宽高属性
  body_class: 'article-content ',
  object_resizing: true, //是否允许调整图像大小.
  paste_data_images: true, // 粘贴的同时能把内容里的图片自动上传，非常强力的功能
  paste_merge_formats: true, //启用PowerPaste插件的合并格式功能，例如：<b>abc <b>bold</b> 123</b>成为<b>abc bold 123</b>
  end_container_on_empty_block: true, //如果在空的内部块元素中按下Enter键，则可以使用此选项拆分当前容器块元素。
  powerpaste_word_import: 'clean', //保留标题，表格和列表等内容的结构，但删除内联样式和类。这样就产生了使用站点CSS样式表的简单内容，同时保留了原始文档的语义结构。
  advlist_bullet_styles: 'default,circle,disc,square',
  advlist_number_styles:
    'default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman',
  default_link_target: '_blank', //默认链接是当前窗口打开，你也可以通过此参数将其变为_blank新窗口打开。
  link_title: false,
  nonbreaking_force_tab: true, // 按tab键插入三个&nbsp;。一直按一直插。
  // 上传成功回调函数，return 图片地址。默认 response.location
  custom_images_upload_callback: res => {
    if (res.code === 0 && res.data) {
      if (Array.isArray(res.data) && res.data.length > 0) {
        return resolveOssUrl(res.data[0])
      } else if (res.data.path) {
        return resolveOssUrl(res.data)
      }
    }
  },
  images_upload_credentials: true,
  // 安全策略（P0-S06）：token 由 HttpOnly cookie 自动携带（images_upload_credentials: true + xhr.withCredentials）
  // 不再在 header 中注入 token，避免 JS 可读
  // 上传 api 额外的参数。图片默认 file
  custom_images_upload_param: {},
  height: 550, // editor 高度
  toolbar:
    'undo redo|bold forecolor backcolor fontsize | numlist bullist | alignleft aligncenter alignright | code codesample link unlink |image media table | blocks italic underline strikethrough alignjustify  | indent outdent | superscript subscript | removeformat | fullscreen preview',
  toolbar_mode: 'sliding',
  quickbars_selection_toolbar:
    'removeformat | bold italic underline strikethrough | fontsize forecolor backcolor',
  plugins:
    'link image media table lists fullscreen quickbars codesample preview code fullscreen',
  font_size_formats:
    '12px 13px 14px 15px 16px 17px 18px 19px 20px 21px 22px 23px 24px 25px 26px 27px 28px 29px 30px 31px 32px 33px 34px 35px 36px 37px 38px 39px 40px 41px 42px 43px 44px 45px 46px 37px 48px 49px 50px 51px 52px',
  link_default_target: '_blank',
  //其他配置参数

  allow_html_in_named_anchor: true, //允许name锚点 <a name="tagId"></a>

  valid_children: '+div[p],+div[style]', // 支持div 包含p,支持style 支持class
  // 以中文简体为例
  language: 'zh-Hans',
  language_url: '/public/admin/tinymce/zh-Hans.js',

  codesample_languages: [
    { text: 'HTML/XML', value: 'markup' },
    { text: 'JavaScript', value: 'javascript' },
    { text: 'CSS', value: 'css' },
    { text: 'PHP', value: 'php' },
    { text: 'Ruby', value: 'ruby' },
    { text: 'Python', value: 'python' },
    { text: 'Java', value: 'java' },
    { text: 'C', value: 'c' },
    { text: 'C#', value: 'csharp' },
    { text: 'C++', value: 'cpp' },
  ],
  verify_html: false,
  allow_script_urls: true,
  allow_unsafe_link_target: true,
  extended_valid_elements: '*[*]',
  valid_elements: '*[*]',
}
