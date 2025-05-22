import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

// Classe que contém a lógica de validação do CNPJ
@ValidatorConstraint({ async: false })
export class IsCnpjConstraint implements ValidatorConstraintInterface {
  validate(cnpj: string, args: ValidationArguments) {
    // Remove caracteres não numéricos
    const cleanCnpj = cnpj.replace(/[^\d]+/g, '');

    // Verifica se tem 14 dígitos
    if (cleanCnpj.length !== 14) {
      return false;
    }

    // Evita CNPJs com todos os dígitos iguais (inválidos)
    if (/^(\d)\1{13}$/.test(cleanCnpj)) {
      return false;
    }

    let sum = 0;
    let pos = cleanCnpj.length - 2;
    let result;

    // Validação do primeiro dígito verificador
    for (let i = 0; i < cleanCnpj.length - 2; i++) {
      sum += parseInt(cleanCnpj.charAt(i)) * (pos--);
      if (pos < 2) {
        pos = 9;
      }
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(cleanCnpj.charAt(12))) {
      return false;
    }

    sum = 0;
    pos = cleanCnpj.length - 1;

    // Validação do segundo dígito verificador
    for (let i = 0; i < cleanCnpj.length - 1; i++) {
      sum += parseInt(cleanCnpj.charAt(i)) * (pos--);
      if (pos < 2) {
        pos = 9;
      }
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(cleanCnpj.charAt(13))) {
      return false;
    }

    return true; // CNPJ válido
  }

  defaultMessage(args: ValidationArguments) {
    return 'CNPJ inválido.';
  }
}

// Decorator customizado para ser usado nas DTOs
export function IsCnpj(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCnpjConstraint,
    });
  };
}
