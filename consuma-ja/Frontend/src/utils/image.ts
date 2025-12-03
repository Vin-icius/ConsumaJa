const URL_PATTERN = /^https?:\/\//i
const BLOB_PATTERN = /^(data:|file:|blob:)/i

import { PRODUCT_API_URL } from '../constants/api'

const PRODUCT_SERVICE_ORIGIN = PRODUCT_API_URL.replace(/\/?api\/product\/?$/, '')
const BLOCKED_IMAGE_HOSTS = ['example.com']

const shouldBlockRemoteImage = (url: string): boolean => {
  try {
    const { hostname } = new URL(url)
    if (!hostname) {
      return false
    }
    const normalizedHost = hostname.toLowerCase()
    return BLOCKED_IMAGE_HOSTS.some((blockedHost) =>
      normalizedHost === blockedHost || normalizedHost.endsWith(`.${blockedHost}`),
    )
  } catch {
    return false
  }
}

export const resolveProductImageUrl = (value?: string | null): string | null => {
  if (!value) return null
  if (URL_PATTERN.test(value)) {
    if (shouldBlockRemoteImage(value)) {
      return null
    }
    return value
  }
  if (BLOB_PATTERN.test(value)) {
    return value
  }
  const normalized = value.startsWith('/') ? value : `/${value}`
  return `${PRODUCT_SERVICE_ORIGIN}${normalized}`
}
