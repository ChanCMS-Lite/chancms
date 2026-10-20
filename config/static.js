export let statics = [
  {
    prefix: "/public/",
    dir: "public",
    maxAge: 0, // 禁用强缓存（每次回源，由 ETag 走 304 协商缓存）
  },
  {
    prefix: "/view/",
    dir: "view",
    maxAge: 0, // 禁用强缓存（每次回源，由 ETag 走 304 协商缓存）
  }
];

export default {
  statics,
};
