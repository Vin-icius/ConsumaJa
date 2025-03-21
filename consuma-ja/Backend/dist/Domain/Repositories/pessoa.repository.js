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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PessoaRepository = void 0;
const typeorm_1 = require("typeorm");
const pessoa_entity_1 = require("../Entities/pessoa.entity");
const typeorm_2 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
let PessoaRepository = class PessoaRepository {
    pessoaRepo;
    constructor(pessoaRepo) {
        this.pessoaRepo = pessoaRepo;
    }
    async findByLoginOrDocumento(login) {
        return this.pessoaRepo.findOne({
            where: [{ pessoa_login: login }, { fisica: { pessoa_cpf: login } }, { juridica: { fornecedor_cnpj: login } }],
            relations: ['fisica', 'juridica'],
        });
    }
};
exports.PessoaRepository = PessoaRepository;
exports.PessoaRepository = PessoaRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(pessoa_entity_1.Pessoa)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], PessoaRepository);
//# sourceMappingURL=pessoa.repository.js.map