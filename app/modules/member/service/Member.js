import { parsePage, parsePageSize } from "chanjs/utils/index.js";
import { Repository, logger } from "chanjs";
import { escapeLike } from "../../../common/model-utils.js";

class MemberService extends Repository {
  constructor() {
    super("member");
  }

  async findUserByField(value, field = "username") {
    const allowedFields = ["username", "email", "phone", "wechat"];
    const safeField = allowedFields.includes(field) ? field : "username";
    const res = await this.findOne({
      query: { [safeField]: value },
      fields: ["id", "username", "email", "password", "avatar", "nickname", "sex", "phone", "wechat", "status"],
    });
    return res;
  }

  async queryPass(id) {
    const res = await this.findById(id, {
      fields: ["password"],
    });
    return res;
  }

  async find(email) {
    const res = await this.query({
      query: { email },
      fields: ["id", "email"],
    });
    return res;
  }

  async detail(id) {
    const res = await this.findById(id, {
      fields: [
        "id",
        "nickname",
        "username",
        "sex",
        "email",
        "wechat",
        "phone",
        "avatar",
        "status",
        "created_at",
        "remark",
        "loginDate",
      ],
    });
    return res;
  }

  async delete(ids) {
    try {
      // 支持批量：逗号分隔（"1,2,3"）或数组；删除会员同时清理其评论/收藏
      const idList = Array.isArray(ids)
        ? ids.map(Number).filter(Boolean)
        : String(ids).split(",").map(Number).filter(Boolean);
      if (!idList.length) return { success: true, code: 0, msg: "删除成功", data: { affectedRows: 0 } };
      await this.db.transaction(async (trx) => {
        await trx("member_comment").whereIn("member_id", idList).del();
        await trx("member_favorite").whereIn("member_id", idList).del();
        await trx(this.tableName).whereIn("id", idList).del();
      });
      return { success: true, code: 0, msg: "删除成功", data: { affectedRows: idList.length } };
    } catch (err) {
      logger.error("[MemberService.delete] 失败:", err.message);
      throw err;
    }
  }

  async create(body) {
    const result = await this.insert(body);
    return result;
  }

  // 可更新字段白名单：update 走裸 knex（Repository 白名单不覆盖 where 形态），须自行收口
  // 防止调用方夹带 id/created_at 等列越权改写
  static MEMBER_UPDATE_FIELDS = [
    "username", "nickname", "avatar", "email", "phone", "status", "password",
  ];

  async update({ query, data }) {
    const safeData = {};
    for (const key of MemberService.MEMBER_UPDATE_FIELDS) {
      if (data?.[key] !== undefined) safeData[key] = data[key];
    }
    if (!Object.keys(safeData).length) {
      return { success: false, code: 1007, msg: "无可更新字段" };
    }
    const result = await this.db(this.tableName).where(query).update(safeData);
    return result;
  }

  // ========== 会员管理后台方法 ==========
  // 列表
  async list(page = 1, pageSize = 10) {
    // 分页参数钳制（与 SysUser.list 同口径）
    const p = parsePage(page);
    const size = parsePageSize(pageSize);
    const offset = (p - 1) * size;

    // count 与 list 并行执行（两个独立 builder，安全并行）
    const [countResult, list] = await Promise.all([
      this.db(this.tableName).count("* as count").first(),
      this.db(this.tableName)
        .select(
          "id",
          "username",
          "nickname",
          "avatar",
          "status",
          "email",
          "phone",
          "created_at",
          "updated_at"
        )
        .limit(size)
        .offset(offset)
        .orderBy("id", "desc"),
    ]);

    // count 兜底 0（原 || 1 会导致 totalPages 计算错误）
    const count = parseInt(countResult?.count || 0, 10);
    return {
      success: true,
      code: 0,
      msg: '查询成功',
      data: {
        total: count,
        page: p,
        pageSize: size,
        list: list,
      }
    };
  }

  // 搜索
  async search(keyword, page = 1, pageSize = 10) {
    // escapeLike 从 app/common/model-utils.js 导入：转义 LIKE 特殊字符 % _ \ 防 LIKE 注入
    const safeKey = `%${escapeLike(keyword)}%`;
    const p = parsePage(page);
    const size = parsePageSize(pageSize);
    const offset = (p - 1) * size;

    // count 与 list 共用条件构造器（函数引用，每次独立应用，安全并行）
    const buildQuery = () =>
      this.db(this.tableName)
        .where("username", "like", safeKey)
        .orWhere("nickname", "like", safeKey);

    // count 与 list 并行执行
    const [countResult, list] = await Promise.all([
      buildQuery().count("id", { as: "count" }).first(),
      buildQuery()
        .select(
          "id",
          "username",
          "nickname",
          "avatar",
          "status",
          "email",
          "phone",
          "created_at",
          "updated_at"
        )
        .limit(size)
        .offset(offset)
        .orderBy("id", "desc"),
    ]);

    // count 兜底 0（原 || 1 会导致 totalPages 计算错误）
    const count = parseInt(countResult?.count || 0, 10);
    return {
      success: true,
      code: 0,
      msg: '查询成功',
      data: {
        total: count,
        page: p,
        pageSize: size,
        list: list,
      }
    };
  }

  // 更新状态（启用/禁用）
  async updateStatus(id, status) {
    const res = await this.updateById(id, { status });
    return res;
  }
}

export default new MemberService();
