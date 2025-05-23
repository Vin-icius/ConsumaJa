const IP_DA_SUA_MAQUINA = 'consumaja.com';
const LOCATION_SERVICE_PORT = '3001';
const PRODUCT_SERVICE_PORT = '3000';
const PERSON_SERVICE_PORT = '3002';

const LOCATION_API_URL = `https://${IP_DA_SUA_MAQUINA}/api/location`;
const PRODUCT_API_URL = `https://${IP_DA_SUA_MAQUINA}/api/product`; // <<< Esta URL é usada
const PERSON_API_URL = `https://${IP_DA_SUA_MAQUINA}/api`;

export { LOCATION_API_URL, PRODUCT_API_URL, PERSON_API_URL };