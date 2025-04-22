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
exports.ViaCepClient = void 0;
var axios_1 = require("axios");
var ViaCepClient = /** @class */ (function () {
    function ViaCepClient() {
        this.baseUrl = 'https://viacep.com.br/ws';
    }
    ViaCepClient.prototype.fetchAddress = function (cep) {
        return __awaiter(this, void 0, void 0, function () {
            var cleanedCep, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        cleanedCep = cep.replace(/\D/g, '');
                        if (cleanedCep.length !== 8) {
                            console.warn("[ViaCepClient] CEP inv\u00E1lido fornecido: ".concat(cep));
                            return [2 /*return*/, null]; // Ou lançar um erro específico
                        }
                        return [4 /*yield*/, axios_1["default"].get("".concat(this.baseUrl, "/").concat(cleanedCep, "/json/"))];
                    case 1:
                        response = _a.sent();
                        // ViaCEP retorna { erro: true } para CEPs não encontrados
                        if (response.data.erro) {
                            console.log("[ViaCepClient] CEP n\u00E3o encontrado na ViaCEP: ".concat(cleanedCep));
                            return [2 /*return*/, null];
                        }
                        // Retorna null se campos essenciais não vierem (pouco provável se não der erro)
                        if (!response.data.localidade || !response.data.uf || !response.data.ibge || !response.data.ddd) {
                            console.warn("[ViaCepClient] Resposta incompleta para o CEP: ".concat(cleanedCep));
                            return [2 /*return*/, null];
                        }
                        console.log("[ViaCepClient] Endere\u00E7o encontrado para CEP ".concat(cleanedCep, ":"), response.data);
                        return [2 /*return*/, response.data];
                    case 2:
                        error_1 = _a.sent();
                        console.error("[ViaCepClient] Erro ao buscar CEP ".concat(cep, ":"), error_1.message);
                        // Poderia retornar null ou lançar um erro específico para tratamento no serviço
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ViaCepClient;
}());
exports.ViaCepClient = ViaCepClient;
