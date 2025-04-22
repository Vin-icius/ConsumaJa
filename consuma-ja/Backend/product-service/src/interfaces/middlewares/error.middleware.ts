import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../common/errors/app-error';
import { ValidationError } from 'class-validator';

const formatValidationErrors = (errors: ValidationError[]): { field: string, messages: string[] }[] => {
    return errors.map(err => ({
        field: err.property,
        messages: err.constraints ? Object.values(err.constraints) : []
    }));
};

export const errorHandler = (
  err: Error | AppError | any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  // Log do Erro no console do backend
  console.error('--- ERROR HANDLER ---');
  console.error('Timestamp:', new Date().toISOString());
  console.error('Route:', req.path);
  console.error('Method:', req.method);

  console.error('Error:', err.message);
  if (process.env.NODE_ENV !== 'production') {
      console.error('Stack:', err.stack);
  }
   if (err.code) console.error('DB Error Code:', err.code);
   if (err instanceof AppError) console.error('AppError Status:', err.statusCode);
   console.error('---------------------');

  let statusCode = 500;
  let responseBody: { status: string; message: string; errors?: any; stack?: string } = {
    status: 'error',
    message: 'Ocorreu um erro interno no servidor.',
  };

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    responseBody.message = err.message;

    if (process.env.NODE_ENV === 'production' && !err.isOperational) {
        responseBody.message = 'Ocorreu um erro interno no servidor.';
    }
  }
  // Tratamento para erros do class-validator
  else if (Array.isArray(err) && err.length > 0 && err[0] instanceof ValidationError) {
      statusCode = 400; // Bad Request
      responseBody.status = 'fail';
      responseBody.message = 'Erro de validação nos dados enviados.';
      responseBody.errors = formatValidationErrors(err);
  }
  // Tratamento para erros comuns do MySQL
  else if (err.code) {
      switch (err.code) {
          case 'ER_DUP_ENTRY':
              statusCode = 409;
              responseBody.message = 'Erro de conflito: Registro duplicado.';

              break;
          case 'ER_NO_REFERENCED_ROW_2':
              statusCode = 400; // Bad Request (FK inválida)
              responseBody.message = 'Erro de referência: Recurso relacionado não encontrado.';
              break;
          case 'ER_BAD_FIELD_ERROR':
                statusCode = 500; // Geralmente erro de programação
                responseBody.message = 'Erro interno: Coluna desconhecida referenciada.';
                break;

          default:
              statusCode = 500;
              responseBody.message = 'Erro inesperado no banco de dados.';
      }
  }
  // Outros erros genéricos
  else {
       statusCode = 500;

       if (process.env.NODE_ENV !== 'production') {
            responseBody.message = err.message || responseBody.message;
       }
  }


   if (process.env.NODE_ENV !== 'production' && statusCode >= 500 && !(err instanceof AppError && err.isOperational)) {
      responseBody.stack = err.stack;
   }


  res.status(statusCode).json(responseBody);
};