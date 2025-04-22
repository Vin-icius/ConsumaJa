export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean; // Para diferenciar erros esperados de bugs
  
    constructor(message: string, statusCode: number, isOperational: boolean = true) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
  
      // Garante que o nome da classe seja mantido
      Object.setPrototypeOf(this, new.target.prototype);
  
      // Captura o stack trace (opcional, mas útil para debugging)
      Error.captureStackTrace(this, this.constructor);
    }
  }