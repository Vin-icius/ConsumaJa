"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.CepService = void 0;
var app_error_1 = require("../../common/errors/app-error"); // <<< Corrigido o caminho da importação
var uf_map_1 = require("../../common/utils/uf-map");
var CepService = /** @class */ (function () {
    function CepService(viaCepClient, estadoRepository, cidadeRepository) {
        this.viaCepClient = viaCepClient;
        this.estadoRepository = estadoRepository;
        this.cidadeRepository = cidadeRepository;
    }
    CepService.prototype.lookupAndPrepareAddress = function (cep) {
        return __awaiter(this, void 0, void 0, function () {
            var addressData, estadoSiglaUpper, estadoNome, estado, cidade, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.viaCepClient.fetchAddress(cep)];
                    case 1:
                        addressData = _a.sent();
                        // Valida se a API retornou dados válidos
                        if (!addressData) {
                            // Erro operacional comum: CEP não encontrado pela API externa
                            throw new app_error_1.AppError('CEP não encontrado ou inválido na base externa.', 404); // 404 Not Found
                        }
                        // Validações adicionais para dados essenciais da API
                        if (!addressData.uf || !addressData.localidade || !addressData.ddd) {
                            console.error("[CepService] Resposta incompleta da API ViaCEP para CEP ".concat(cep, ":"), addressData);
                            // Erro interno ou problema na API externa, não erro do usuário
                            throw new app_error_1.AppError('Dados externos incompletos para processar o CEP.', 502, false); // 502 Bad Gateway ou 500
                        }
                        estadoSiglaUpper = addressData.uf.toUpperCase();
                        estadoNome = uf_map_1.ufToEstadoNomeMap[estadoSiglaUpper];
                        if (!estadoNome) {
                            // Se a UF da API não está no nosso mapeamento, é um erro interno/inesperado
                            console.error("[CepService] UF \"".concat(estadoSiglaUpper, "\" recebida da API n\u00E3o encontrada no mapeamento interno."));
                            throw new app_error_1.AppError("Sigla de estado (".concat(estadoSiglaUpper, ") inv\u00E1lida ou n\u00E3o mapeada."), 500, false); // 500 Internal Server Error
                        }
                        return [4 /*yield*/, this.estadoRepository.findOrCreate(estadoSiglaUpper, estadoNome)];
                    case 2:
                        estado = _a.sent();
                        return [4 /*yield*/, this.cidadeRepository.findOrCreate(addressData.localidade, // Nome da cidade vindo da API
                            addressData.ddd, // DDD vindo da API
                            estado.estado_id // ID do estado encontrado/criado no passo anterior
                            )];
                    case 3:
                        cidade = _a.sent();
                        // 4. Monta a Resposta Final com dados do nosso banco (mais confiáveis/atualizados)
                        return [2 /*return*/, {
                                cep: addressData.cep,
                                logradouro: addressData.logradouro,
                                complemento: addressData.complemento,
                                bairro: addressData.bairro,
                                cidade: cidade.cidade_nome,
                                estado: estado.estado_sigla,
                                cidadeId: cidade.cidade_id,
                                estadoId: estado.estado_id,
                                ddd: cidade.regiao_ddd
                            }];
                    case 4:
                        error_1 = _a.sent();
                        // Se o erro já for um AppError (lançado acima ou pelos repositórios), apenas relança
                        if (error_1 instanceof app_error_1.AppError) {
                            throw error_1;
                        }
                        // Se for um erro inesperado (ex: falha de rede no ViaCepClient, erro não tratado nos repos)
                        console.error("[CepService.lookupAndPrepareAddress] Erro inesperado ao processar CEP ".concat(cep, ":"), error_1);
                        throw new app_error_1.AppError("Erro ao processar a consulta do CEP ".concat(cep, "."), 500, false); // Genérico, não operacional
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return CepService;
}());
exports.CepService = CepService;
