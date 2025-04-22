"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const app_error_1 = require("../../common/errors/app-error");
const class_validator_1 = require("class-validator");
// Função para formatar erros do class-validator (pode mover para utils comum)
const formatValidationErrors = (errors) => {
    return errors.map(err => ({
        field: err.property,
        messages: err.constraints ? Object.values(err.constraints) : (err.children && err.children.length > 0 ? formatValidationErrors(err.children).flatMap(childErr => childErr.messages) : []) // Formata filhos recursivamente se necessário
    }));
};
const errorHandler = (err, req, res, next) => {
    // Log do Erro no console do backend (ajuste o nível de log em produção)
    console.error('--- ERROR HANDLER (Pessoa Service) ---');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Route:', `${req.method} ${req.originalUrl}`);
    console.error('Error:', err.message || err);
    if (process.env.NODE_ENV !== 'production' || (err instanceof app_error_1.AppError && !err.isOperational) || !(err instanceof app_error_1.AppError)) {
        console.error('Stack:', err.stack);
    }
    if (err.code)
        console.error('DB Code:', err.code); // Código de erro do DB
    if (err instanceof app_error_1.AppError)
        console.error('AppError Status:', err.statusCode);
    console.error('--------------------------------------');
    let statusCode = 500; // Default: Internal Server Error
    let responseBody = {
        status: 'error',
        message: 'Ocorreu um erro interno no servidor.',
    };
    // Trata AppError (erros lançados pela nossa aplicação)
    if (err instanceof app_error_1.AppError) {
        statusCode = err.statusCode;
        responseBody.message = err.message;
        if (process.env.NODE_ENV === 'production' && !err.isOperational && statusCode >= 500) {
            responseBody.message = 'Ocorreu um erro interno no servidor.';
        }
    }
    // Trata erros de validação do class-validator
    else if (Array.isArray(err) && err.length > 0 && err[0] instanceof class_validator_1.ValidationError) {
        statusCode = 400; // Bad Request
        responseBody.status = 'fail'; // Indicar falha de validação
        responseBody.message = 'Dados inválidos fornecidos.';
        responseBody.errors = formatValidationErrors(err);
    }
    // Trata erros específicos do MySQL (baseado no código do erro)
    else if (err.code) {
        switch (err.code) {
            case 'ER_DUP_ENTRY':
                statusCode = 409; // Conflict
                responseBody.message = 'Conflito: O registro já existe ou viola uma chave única.';
                break;
            case 'ER_NO_REFERENCED_ROW': // FK constraint (versão 1)
            case 'ER_NO_REFERENCED_ROW_2': // FK constraint (versão 2)
                statusCode = 400; // Bad Request (referência inválida)
                responseBody.message = 'Erro de referência: Um dos IDs relacionados fornecidos não existe.';
                break;
            case 'ER_BAD_FIELD_ERROR': // Coluna não existe
                statusCode = 500; // Erro de programação (bug)
                responseBody.message = 'Erro interno do servidor (Bad Field).';
                console.error("ERRO DE SQL - ER_BAD_FIELD_ERROR: Verifique nomes de colunas nas queries."); // Log específico para dev
                break;
            case 'ECONNREFUSED': // Erro de conexão com DB
            case 'PROTOCOL_CONNECTION_LOST':
                statusCode = 503; // Service Unavailable
                responseBody.message = 'Serviço indisponível no momento (DB).';
                break;
            default:
                statusCode = 500;
                responseBody.message = 'Erro inesperado no processamento do banco de dados.';
        }
    }
    else {
        statusCode = 500;
        if (process.env.NODE_ENV !== 'production') {
            responseBody.message = err.message || responseBody.message;
        }
    }
    if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
        responseBody.stack = err.stack;
    }
    res.status(statusCode).json(responseBody);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map