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
exports.UpdateTipoDto = void 0;
const class_validator_1 = require("class-validator");
class UpdateTipoDto {
}
exports.UpdateTipoDto = UpdateTipoDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome do tipo não pode ser vazio se fornecido.' }),
    (0, class_validator_1.IsString)({ message: 'O nome do tipo deve ser um texto.' }),
    (0, class_validator_1.MaxLength)(255),
    (0, class_validator_1.Length)(3, 255),
    __metadata("design:type", String)
], UpdateTipoDto.prototype, "tipo_nome", void 0);
//# sourceMappingURL=update-tipo.dto.js.map