import { Platform } from 'react-native'
import Constants from 'expo-constants'

const stripProtocolAndPort = (value) => {
	if (!value) {
		return null
	}
	const sanitized = value.replace(/^https?:\/\//i, '')
	return sanitized.split(':')[0]
}

const getHostFromExpo = () => {
	const hostUri =
		Constants?.expoConfig?.hostUri ||
		Constants?.manifest2?.extra?.expoClient?.hostUri ||
		Constants?.manifest?.debuggerHost

	return stripProtocolAndPort(hostUri)
}

const getHostFromWindow = () => {
	if (typeof window === 'undefined') {
		return null
	}
	return window.location.hostname
}

const resolveHost = () => {
	const envHost = process.env.EXPO_PUBLIC_API_HOST || process.env.API_HOST
	if (envHost) {
		return stripProtocolAndPort(envHost) || 'localhost'
	}

	const expoHost = getHostFromExpo()
	if (expoHost) {
		return expoHost
	}

	const webHost = getHostFromWindow()
	if (webHost) {
		return webHost
	}

	if (Platform.OS === 'android') {
		return '10.0.2.2'
	}

	if (Platform.OS === 'ios') {
		return '127.0.0.1'
	}

	return 'localhost'
}

const API_HOST = resolveHost()

const LOCATION_SERVICE_PORT = process.env.EXPO_PUBLIC_LOCATION_PORT || process.env.LOCATION_SERVICE_PORT || '3001'
const PRODUCT_SERVICE_PORT = process.env.EXPO_PUBLIC_PRODUCT_PORT || process.env.PRODUCT_SERVICE_PORT || '3000'
const ORDER_SERVICE_PORT = process.env.EXPO_PUBLIC_ORDER_PORT || process.env.ORDER_SERVICE_PORT || PRODUCT_SERVICE_PORT
const PERSON_SERVICE_PORT = process.env.EXPO_PUBLIC_PERSON_PORT || process.env.PERSON_SERVICE_PORT || '3002'
const buildUrl = (port, suffix = '') => `http://${API_HOST}:${port}${suffix}`

const LOCATION_API_URL = buildUrl(LOCATION_SERVICE_PORT, '/api/location')
const PRODUCT_API_URL = buildUrl(PRODUCT_SERVICE_PORT, '/api/product') // <<< Esta URL é usada
const ORDER_API_URL = buildUrl(ORDER_SERVICE_PORT, '/api/product')
const PERSON_API_URL = buildUrl(PERSON_SERVICE_PORT, '/api')

export { LOCATION_API_URL, PRODUCT_API_URL, PERSON_API_URL, ORDER_API_URL }