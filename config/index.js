import app from "./app.js";
import cache from "./cache.js";
import cookie from "./cookie.js";
import db from "./database.js";
import jwt from "./jwt.js";
import logger from "./log.js";
import modules from "./modules.js";
import statics from "./static.js";
import upload from "./upload.js";
import views from "./view.js";
import cors from "./cors.js";
import waf from "./waf.js";
import ratelimit from "./ratelimit.js";
import redis from "./redis.js";
import health from "./health.js";

export default {
  ...app,
  ...cache,
  ...cookie,
  ...waf,
  ...ratelimit,
  ...health,
  ...jwt,
  ...db,
  ...logger,
  ...modules,
  ...statics,
  ...upload,
  ...views,
  ...cors,
  ...redis,
};
