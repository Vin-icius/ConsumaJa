<<<<<<< HEAD
const LOCATION_API_URL = process.env.EXPO_PUBLIC_LOCATION_API_URL || 'http://localhost:3001/api/location';
const PRODUCT_API_URL = process.env.EXPO_PUBLIC_PRODUCT_API_URL || 'http://localhost:3000/api/product'; // Verifique a porta 3000

console.log('[API Constants] LOCATION_API_URL loaded as:', LOCATION_API_URL);
console.log('[API Constants] PRODUCT_API_URL loaded as:', PRODUCT_API_URL);

export { LOCATION_API_URL, PRODUCT_API_URL };
=======
const IP_DA_SUA_MAQUINA = '172.16.241.5';
const LOCATION_SERVICE_PORT = '3001';
const PRODUCT_SERVICE_PORT = '3000';
const PERSON_SERVICE_PORT = '3002';

const LOCATION_API_URL = `http://${IP_DA_SUA_MAQUINA}:${LOCATION_SERVICE_PORT}/api/location`;
const PRODUCT_API_URL = `http://${IP_DA_SUA_MAQUINA}:${PRODUCT_SERVICE_PORT}/api/product`; // <<< Esta URL é usada
const PERSON_API_URL = `http://${IP_DA_SUA_MAQUINA}:${PERSON_SERVICE_PORT}/api`;

export { LOCATION_API_URL, PRODUCT_API_URL, PERSON_API_URL };
>>>>>>> ba4043b (feat: criacao do gerenciamento de lotes e promocoes, refatoramento da tela de inicio)
