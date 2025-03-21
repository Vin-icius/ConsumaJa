import { Repository } from 'typeorm';
import { Pessoa } from '../Entities/pessoa.entity';
export declare class PessoaRepository {
    private pessoaRepo;
    constructor(pessoaRepo: Repository<Pessoa>);
    findByLoginOrDocumento(login: string): Promise<Pessoa | null>;
}
