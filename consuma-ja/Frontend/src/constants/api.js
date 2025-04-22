const LOCATION_API_URL = process.env.EXPO_PUBLIC_LOCATION_API_URL || 'http://localhost:3001/api/location';
const PRODUCT_API_URL = process.env.EXPO_PUBLIC_PRODUCT_API_URL || 'http://localhost:3000/api/product'; // Verifique a porta 3000

console.log('[API Constants] LOCATION_API_URL loaded as:', LOCATION_API_URL);
console.log('[API Constants] PRODUCT_API_URL loaded as:', PRODUCT_API_URL);

export { LOCATION_API_URL, PRODUCT_API_URL };