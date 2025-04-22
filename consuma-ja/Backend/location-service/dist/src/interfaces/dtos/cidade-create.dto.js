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
exports.__esModule = true;
exports.CreateCidadeDto = void 0;
var class_validator_1 = require("class-validator");
var CreateCidadeDto = /** @class */ (function () {
    function CreateCidadeDto() {
    }
    __decorate([
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsNotEmpty)({ message: 'O nome da cidade é obrigatório.' }),
        (0, class_validator_1.MaxLength)(45),
        __metadata("design:type", String)
    ], CreateCidadeDto.prototype, "cidade_nome");
    __decorate([
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsNotEmpty)({ message: 'O DDD é obrigatório.' }),
        (0, class_validator_1.Length)(2, 4),
        __metadata("design:type", String)
    ], CreateCidadeDto.prototype, "regiao_ddd");
    __decorate([
        (0, class_validator_1.IsInt)({ message: 'O ID do estado deve ser um número inteiro.' }),
        (0, class_validator_1.IsNotEmpty)({ message: 'O ID do estado é obrigatório.' }),
        __metadata("design:type", Number)
    ], CreateCidadeDto.prototype, "estado_id");
    return CreateCidadeDto;
}());
exports.CreateCidadeDto = CreateCidadeDto;
