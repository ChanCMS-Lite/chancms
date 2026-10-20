/**
 * 跨库 insert 工具：统一从 INSERT 返回值中取出自增主键 id
 * MySQL/SQLite：knex insert 返回 [insertId]
 * PostgreSQL：需显式 .returning("id")，返回 [{ id: N }]
 * 用法：await insertGetId(db("sys_role"), { name, key }) 或 await insertGetId(trx("sys_role"), { ... })
 */
export async function insertGetId(queryBuilder, data) {
  const isPg = (process.env.DB_TYPE || "mysql").toLowerCase() === "pg";
  let q = queryBuilder.insert(data);
  if (isPg) q = q.returning("id");
  const raw = await q;
  return isPg ? (raw?.[0]?.id ?? raw?.[0]) : raw?.[0];
}
