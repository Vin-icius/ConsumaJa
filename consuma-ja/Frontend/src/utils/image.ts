const URL_PATTERN = /^https?:\/\//i
const BLOB_PATTERN = /^(data:|file:|blob:)/i

import { PRODUCT_API_URL } from '../constants/api'

const PRODUCT_SERVICE_ORIGIN = PRODUCT_API_URL.replace(/\/?api\/product\/?$/, '')

export const resolveProductImageUrl = (value?: string | null): string | null => {
  if (!value) return null
  if (URL_PATTERN.test(value) || BLOB_PATTERN.test(value)) {
    return value
  }
  const normalized = value.startsWith('/') ? value : `/${value}`
  return `${PRODUCT_SERVICE_ORIGIN}${normalized}`
}
