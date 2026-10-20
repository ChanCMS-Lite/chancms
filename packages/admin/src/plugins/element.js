// Element Plus 图标按需注册
// 说明：侧边栏/插件菜单通过 <component :is="iconName" /> 动态渲染图标，
// 图标名来源于后端 sys_menu.icon 与 asyncRoutes.meta.icon，因此需注册
// 实际用到的图标集合（静态模板 + 动态菜单），避免全量注册导致的无法摇树。
import {
  // 布局/导航
  ArrowLeft, ArrowRight, Bottom, Top, Back, Right,
  // 菜单/功能
  Grid, Monitor, Operation, Setting, Postcard, User, UserFilled,
  DataLine, Cpu, Key, Lock, Reading, View, Search, Refresh,
  // 操作
  Plus, Minus, Edit, EditPen, Delete, Check, Close, CircleCloseFilled,
  Document, DocumentAdd, DocumentCopy, CopyDocument, Download, Upload, UploadFilled,
  Folder, FolderAdd, FolderOpened, Link, Picture, VideoCamera, VideoPlay,
  // 其他
  HomeFilled, InfoFilled, MostlyCloudy, Position, Scissor, SwitchButton,
} from "@element-plus/icons-vue";

// 注册表：键为图标组件名（与后端 icon 字段 / meta.icon 一致）
const icons = {
  ArrowLeft, ArrowRight, Bottom, Top, Back, Right,
  Grid, Monitor, Operation, Setting, Postcard, User, UserFilled,
  DataLine, Cpu, Key, Lock, Reading, View, Search, Refresh,
  Plus, Minus, Edit, EditPen, Delete, Check, Close, CircleCloseFilled,
  Document, DocumentAdd, DocumentCopy, CopyDocument, Download, Upload, UploadFilled,
  Folder, FolderAdd, FolderOpened, Link, Picture, VideoCamera, VideoPlay,
  HomeFilled, InfoFilled, MostlyCloudy, Position, Scissor, SwitchButton,
};

export default {
  install: (app) => {
    app.config.globalProperties.$message = ElMessage;
    for (const [key, component] of Object.entries(icons)) {
      app.component(key, component);
    }
  },
};
