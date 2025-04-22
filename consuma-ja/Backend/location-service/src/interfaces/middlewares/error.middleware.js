"use strict";
exports.__esModule = true;
exports.errorHandler = void 0;
var app_error_1 = require("../../common/errors/app-error"); // Importe sua classe de erro customizada
var class_validator_1 = require("class-validator"); // Importe se estiver usando class-validator
// Função para formatar erros de validação do class-validator
var formatValidationErrors = function (errors) {
    var messages = [];
    errors.forEach(function (err) {
        if (err.constraints) {
            messages = messages.concat(Object.values(err.constraints));
        }
        // Recursivamente formata erros aninhados (se houver)
        if (err.children && err.children.length > 0) {
            messages = messages.concat(formatValidationErrors(err.children));
        }
    });
    return messages;
};
var errorHandler = function (err, // Aceita vários tipos de erro
req, res, next // next é necessário na assinatura, mesmo que não usado aqui
) {
    // --- Log do Erro ---
    // Em produção, considere usar um logger mais robusto (Winston, Pino)
    // e evitar logar detalhes sensíveis de erros não operacionais.
    console.error('----------------------------------------');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Route:', req.path);
    console.error('Method:', req.method);
    // Logar o stack trace completo para depuração
    console.error('Error Stack:', err.stack || err);
    // Logar detalhes adicionais se for um AppError
    if (err instanceof app_error_1.AppError) {
        console.error('AppError Status Code:', err.statusCode);
        console.error('AppError Is Operational:', err.isOperational);
    }
    // Logar detalhes específicos de erros comuns (Ex: DB)
    if (err.code) { // Códigos de erro do MySQL, por exemplo
        console.error('Error Code:', err.code);
    }
    console.error('----------------------------------------');
    // --- Tratamento e Resposta ---
    var statusCode = 500; // Default para Internal Server Error
    var responseBody = {
        status: 'error',
        message: 'Ocorreu um erro interno no servidor.'
    };
    // Erro Customizado da Aplicação (AppError)
    if (err instanceof app_error_1.AppError) {
        statusCode = err.statusCode;
        responseBody.message = err.message;
        // Em produção, só envie a mensagem de erros operacionais
        // if (process.env.NODE_ENV === 'production' && !err.isOperational) {
        //     responseBody.message = 'Ocorreu um erro interno no servidor.';
        // }
    }
    // Erros de Validação (class-validator)
    // class-validator geralmente lança um array de ValidationError
    else if (Array.isArray(err) && err[0] instanceof class_validator_1.ValidationError) {
        statusCode = 400; // Bad Request
        responseBody.status = 'fail'; // Indica falha na validação
        responseBody.message = 'Dados inválidos fornecidos.';
        responseBody.errors = formatValidationErrors(err); // Formata os erros
    }
    // Erros Específicos do Banco de Dados (Exemplo MySQL)
    else if (err.code) {
        switch (err.code) {
            case 'ER_DUP_ENTRY': // Entrada duplicada (UNIQUE constraint)
                statusCode = 409; // Conflict
                // Tenta extrair uma mensagem mais útil, se possível (requer parsing da string de erro)
                responseBody.message = "Erro de conflito: ".concat(err.message.split(' for key')[0], "."); // Mensagem mais genérica
                break;
            case 'ER_NO_REFERENCED_ROW_2': // Violação de Foreign Key
                statusCode = 400; // Bad Request (tentando referenciar algo que não existe)
                responseBody.message = "Erro de refer\u00EAncia: ".concat(err.message.split(' FOREIGN KEY')[0], "."); // Mensagem mais genérica
                break;
            case 'ECONNREFUSED': // Erro de conexão com o DB
            case 'PROTOCOL_CONNECTION_LOST':
                statusCode = 503; // Service Unavailable
                responseBody.message = 'Serviço temporariamente indisponível devido a problema no banco de dados.';
                break;
            // Adicionar outros códigos de erro do DB relevantes
            default:
                // Mantém 500 para outros erros de DB não tratados especificamente
                responseBody.message = 'Ocorreu um erro no processamento do banco de dados.';
        }
    }
    // Outros Erros Genéricos (SyntaxError, TypeError, etc.)
    else {
        // Não vazar detalhes do erro em produção
        if (process.env.NODE_ENV === 'development') {
            responseBody.message = err.message || 'Ocorreu um erro inesperado.';
            // Opcional: adicionar stack trace em desenvolvimento
            // responseBody.stack = err.stack;
        }
    }
    // Enviar Resposta
    res.status(statusCode).json(responseBody);
};
exports.errorHandler = errorHandler;
