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
exports.CreateProdutoDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer"); // Para converter tipos
class CreateProdutoDto {
}
exports.CreateProdutoDto = CreateProdutoDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Nome do produto é obrigatório.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 255),
    __metadata("design:type", String)
], CreateProdutoDto.prototype, "produto_nome", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Medida é obrigatória.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(45),
    __metadata("design:type", String)
], CreateProdutoDto.prototype, "produto_medida", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Preço original é obrigatório.' }),
    (0, class_validator_1.IsNumber)({}, { message: 'Preço original deve ser um número.' }),
    (0, class_validator_1.IsPositive)({ message: 'Preço original deve ser positivo.' }),
    (0, class_transformer_1.Type)(() => Number) // Tenta converter string para número
    ,
    __metadata("design:type", Number)
], CreateProdutoDto.prototype, "produto_precoOriginal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateProdutoDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'ID da Categoria é obrigatório.' }),
    (0, class_validator_1.IsInt)({ message: 'ID da Categoria deve ser um número inteiro.' }),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number) // Tenta converter string para número
    ,
    __metadata("design:type", Number)
], CreateProdutoDto.prototype, "CATEGORIA_PRODUTO_categoria_id", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'ID da Marca é obrigatório.' }),
    (0, class_validator_1.IsInt)({ message: 'ID da Marca deve ser um número inteiro.' }),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateProdutoDto.prototype, "MARCA_PRODUTO_marca_id", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'ID do Tipo é obrigatório.' }),
    (0, class_validator_1.IsInt)({ message: 'ID do Tipo deve ser um número inteiro.' }),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateProdutoDto.prototype, "TIPO_PRODUTO_tipo_id", void 0);
//# sourceMappingURL=create-produto.dto.js.map