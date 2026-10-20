/**
 * 把前端构建产物同步到后端（根目录）静态目录：
 *   admin  -> public/admin
 *   user   -> public/member
 *
 * 用法：
 *   node scripts/sync-dist.mjs admin
 *   node scripts/sync-dist.mjs user
 *   node scripts/sync-dist.mjs admin --clean   # 先清空目标目录再复制（默认只覆盖，不删旧文件）
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAP = {
  admin: { from: "packages/admin/dist", to: "public/admin" },
  user: { from: "packages/user/dist", to: "public/member" },
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const key = process.argv[2];
const clean = process.argv.includes("--clean");
const cfg = MAP[key];

if (!cfg) {
  console.error("用法: node scripts/sync-dist.mjs <admin|user> [--clean]");
  process.exit(1);
}

const from = resolve(root, cfg.from);
const to = resolve(root, cfg.to);

if (!existsSync(from)) {
  console.error(`源目录不存在，请先构建：${cfg.from}`);
  process.exit(1);
}

if (clean && existsSync(to)) {
  rmSync(to, { recursive: true });
}

mkdirSync(to, { recursive: true });
cpSync(from, to, { recursive: true });
console.log(`已同步 ${cfg.from} -> ${cfg.to}`);
