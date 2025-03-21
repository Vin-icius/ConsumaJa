import { Fisica } from './fisica.entity';
import { Juridica } from './juridica.entity';
export declare class Pessoa {
    pessoa_id: number;
    pessoa_nome: string;
    pessoa_email: string;
    pessoa_telefone: string;
    pessoa_tipo: string;
    pessoa_login: string;
    pessoa_senha: string;
    pessoa_status: number;
    data_criacao: Date;
    fisica: Fisica;
    juridica: Juridica;
}
