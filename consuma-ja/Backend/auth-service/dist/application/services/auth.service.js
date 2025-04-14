"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    constructor(pessoaRepository) {
        this.pessoaRepository = pessoaRepository;
    }
    isCPF(cpf) {
        return /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(cpf);
    }
    isCNPJ(cnpj) {
        return /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/.test(cnpj);
    }
    isAdminLogin(login) {
        return /^\d{3}$/.test(login);
    }
    async validateLogin(login, senha) {
        // Verificar se o login é CPF, CNPJ ou admin
        let pessoa = null;
        if (this.isCPF(login)) {
            // Buscar pessoa física por CPF
            const fisica = await this.pessoaRepository.findFisicaByPessoaId(parseInt(login.replace(/\D/g, '')));
            if (!fisica)
                return null;
            pessoa = fisica.pessoa;
        }
        else if (this.isCNPJ(login)) {
            // Buscar pessoa jurídica por CNPJ
            const juridica = await this.pessoaRepository.findJuridicaByPessoaId(parseInt(login.replace(/\D/g, '')));
            if (!juridica)
                return null;
            pessoa = juridica.pessoa;
        }
        else if (this.isAdminLogin(login)) {
            // Buscar admin pelo login (3 dígitos)
            pessoa = await this.pessoaRepository.findByLogin(login);
            if (!pessoa || pessoa.pessoa_tipo !== 'Admin')
                return null;
        }
        else {
            // Formato inválido
            return null;
        }
        // Verificar senha
        const senhaValida = await bcrypt_1.default.compare(senha, pessoa.pessoa_senha);
        if (!senhaValida)
            return null;
        return {
            pessoa,
            tipo: pessoa.pessoa_tipo
        };
    }
    generateToken(pessoa) {
        const payload = {
            id: pessoa.pessoa_id,
            nome: pessoa.pessoa_nome,
            email: pessoa.pessoa_email,
            tipo: pessoa.pessoa_tipo
        };
        return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
    }
    async hashPassword(senha) {
        const salt = await bcrypt_1.default.genSalt(10);
        return await bcrypt_1.default.hash(senha, salt);
    }
}
exports.AuthService = AuthService;
