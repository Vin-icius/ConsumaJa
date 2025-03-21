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
exports.Pessoa = void 0;
const typeorm_1 = require("typeorm");
const fisica_entity_1 = require("./fisica.entity");
const juridica_entity_1 = require("./juridica.entity");
let Pessoa = class Pessoa {
    pessoa_id;
    pessoa_nome;
    pessoa_email;
    pessoa_telefone;
    pessoa_tipo;
    pessoa_login;
    pessoa_senha;
    pessoa_status;
    data_criacao;
    fisica;
    juridica;
};
exports.Pessoa = Pessoa;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Pessoa.prototype, "pessoa_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Pessoa.prototype, "pessoa_nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Pessoa.prototype, "pessoa_email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Pessoa.prototype, "pessoa_telefone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['Fisica', 'Juridica', 'Admin'] }),
    __metadata("design:type", String)
], Pessoa.prototype, "pessoa_tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], Pessoa.prototype, "pessoa_login", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Pessoa.prototype, "pessoa_senha", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 1 }),
    __metadata("design:type", Number)
], Pessoa.prototype, "pessoa_status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Pessoa.prototype, "data_criacao", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => fisica_entity_1.Fisica, (fisica) => fisica.pessoa),
    __metadata("design:type", fisica_entity_1.Fisica)
], Pessoa.prototype, "fisica", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => juridica_entity_1.Juridica, (juridica) => juridica.pessoa),
    __metadata("design:type", juridica_entity_1.Juridica)
], Pessoa.prototype, "juridica", void 0);
exports.Pessoa = Pessoa = __decorate([
    (0, typeorm_1.Entity)()
], Pessoa);
//# sourceMappingURL=pessoa.entity.js.map