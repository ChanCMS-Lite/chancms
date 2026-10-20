import permission from './permission';

/**
 * @param {*} app  vue实例
 * @description 注册全局指令
 * @use import loadDirective  from '@/directives'
 * loadDirective(app)
 */
export default function loadDirective(app) {
    app.directive('permission', permission);
}
