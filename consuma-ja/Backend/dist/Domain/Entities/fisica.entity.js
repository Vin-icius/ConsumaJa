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
exports.Fisica = void 0;
const typeorm_1 = require("typeorm");
const pessoa_entity_1 = require("./pessoa.entity");
let Fisica = class Fisica {
    id;
    pessoa_cpf;
    pessoa_documentoValidado;
    pessoa_fotoValidada;
    pessoa;
};
exports.Fisica = Fisica;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Fisica.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Fisica.prototype, "pessoa_cpf", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], Fisica.prototype, "pessoa_documentoValidado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], Fisica.prototype, "pessoa_fotoValidada", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => pessoa_entity_1.Pessoa),
    (0, typeorm_1.JoinColumn)({ name: 'PESSOA_pessoa_id' }),
    __metadata("design:type", pessoa_entity_1.Pessoa)
], Fisica.prototype, "pessoa", void 0);
exports.Fisica = Fisica = __decorate([
    (0, typeorm_1.Entity)()
], Fisica);
//# sourceMappingURL=fisica.entity.js.map