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

    const calculateDigit = (length: number): number => {
      let sum = 0;
      let factor = length - 7; // Sequência oficial (5..2,9..2)

      for (let i = 0; i < length; i++) {
        sum += parseInt(cleanCnpj.charAt(i), 10) * factor--;
        if (factor < 2) {
          factor = 9;
        }
      }

      const mod = sum % 11;
      return mod < 2 ? 0 : 11 - mod;
    };

    const firstDigit = calculateDigit(12);
    if (firstDigit !== parseInt(cleanCnpj.charAt(12), 10)) {
      return false;
    }

    const secondDigit = calculateDigit(13);
    if (secondDigit !== parseInt(cleanCnpj.charAt(13), 10)) {
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
