import { z } from '../../../common/validate.js';

const urlSchema = z.string().min(1, '文件路径不能为空');

// 文件类操作：路径由 pathGuard 中间件写入 req.safePath，原始入参为 req.query.url
export const deleteFileSchema = z.looseObject({ url: urlSchema });
export const extractArchiveSchema = z.looseObject({ url: urlSchema });
export const getRelativePathSchema = z.looseObject({ url: urlSchema });
export const createFolderSchema = z.looseObject({ url: urlSchema });

// 复制 / 移动：body 需 sourceUrl + targetUrl
export const copyFileSchema = z.looseObject({
  sourceUrl: z.string().min(1, '源路径不能为空'),
  targetUrl: z.string().min(1, '目标路径不能为空'),
});
export const moveFileSchema = z.looseObject({
  sourceUrl: z.string().min(1, '源路径不能为空'),
  targetUrl: z.string().min(1, '目标路径不能为空'),
});

// 重命名：body 需 sourceUrl + newName
export const renameFileSchema = z.looseObject({
  sourceUrl: z.string().min(1, '源路径不能为空'),
  newName: z.string().min(1, '新名称不能为空'),
});

// 压缩：body 需 files 数组（非空）
export const compressFilesSchema = z.looseObject({
  files: z.array(z.any()).min(1, '请选择要压缩的文件'),
});
