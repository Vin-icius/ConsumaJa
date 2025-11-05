import multer, { type FileFilterCallback } from "multer"
import path from "path"
import fs from "fs"
import type { Request } from "express"
import { resolveProductImageDir } from "../common/utils/image-url"

const uploadRoot = resolveProductImageDir()

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true })
}

const IMAGE_MIME_REGEX = /^image\/(jpe?g|png|gif|webp)$/i

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadRoot)
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const productId = req.params.id
    if (!productId) {
      cb(new Error("Produto inválido para upload"), "")
      return
    }
    const extension = path.extname(file.originalname) || ".jpg"
    const sanitizedExt = extension.toLowerCase()
    const newFileName = `produto_${productId}_${Date.now()}${sanitizedExt}`
    cb(null, newFileName)
  },
})

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (IMAGE_MIME_REGEX.test(file.mimetype)) {
    cb(null, true)
    return
  }
  cb(new Error("Formato de imagem não suportado"))
}

export const productImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})
