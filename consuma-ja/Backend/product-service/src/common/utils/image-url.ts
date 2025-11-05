import path from "path"

const URL_PATTERN = /^https?:\/\//i
const STATIC_PATH_PREFIX = "/static/products"

const normalizeFilename = (value: string): string => {
  const unixPath = value.replace(/\\/g, "/").trim()
  const withoutPrefix = unixPath.replace(/^\.+\//, "")
  return withoutPrefix.replace(/^\/*/, "")
}

export const resolveProductImageDir = (): string => {
  const envDir = process.env.PRODUCT_IMAGES_DIR
  if (envDir && envDir.trim()) {
    return path.resolve(envDir)
  }
  return path.resolve(__dirname, "../../../../fotosProdutos")
}

export const buildProductImagePublicPath = (storedValue: string | null): string | null => {
  if (!storedValue) return null
  if (URL_PATTERN.test(storedValue)) return storedValue

  const filename = normalizeFilename(storedValue)
  const baseUrl = process.env.PRODUCT_IMAGE_BASE_URL?.trim()
  if (baseUrl) {
    return `${baseUrl.replace(/\/$/, "")}/${filename}`
  }
  return `${STATIC_PATH_PREFIX}/${filename}`
}

export const PRODUCT_IMAGE_STATIC_ROUTE = STATIC_PATH_PREFIX
