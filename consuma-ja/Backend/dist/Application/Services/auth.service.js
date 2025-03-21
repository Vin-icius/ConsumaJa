"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const pessoa_repository_1 = require("../../Domain/Repositories/pessoa.repository");
let AuthService = class AuthService {
    pessoaRepo;
    jwtService;
    configService;
    constructor(pessoaRepo, jwtService, configService) {
        this.pessoaRepo = pessoaRepo;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(login, senha) {
        const pessoa = await this.pessoaRepo.findByLoginOrDocumento(login);
        if (!pessoa) {
            throw new common_1.UnauthorizedException('Usuário não encontrado.');
        }
        const senhaValida = await bcrypt.compare(senha, pessoa.pessoa_senha);
        if (!senhaValida) {
            throw new common_1.UnauthorizedException('Senha inválida.');
        }
        const payload = { id: pessoa.pessoa_id, tipo: pessoa.pessoa_tipo };
        const token = this.jwtService.sign(payload);
        return { access_token: token, tipo: pessoa.pessoa_tipo };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pessoa_repository_1.PessoaRepository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map