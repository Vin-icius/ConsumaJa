import { Pool, RowDataPacket } from 'mysql2/promise';
import { Pessoa } from "../../domain/entities/pessoa.entity";
import { Fisica } from "../../domain/entities/fisica.entity";
import { Juridica } from "../../domain/entities/juridica.entity";
import { PessoaRepository } from "../../domain/repositories/pessoa.repository";

export class PessoaMysqlRepository implements PessoaRepository {
  constructor(private readonly pool: Pool) {}

  async findByLogin(login: string): Promise<Pessoa | null> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT * FROM PESSOA WHERE pessoa_login = ?',
      [login]
    );
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return new Pessoa(
      row.pessoa_id,
      row.pessoa_nome,
      row.pessoa_email,
      row.pessoa_telefone,
      row.pessoa_tipo,
      row.pessoa_login,
      row.pessoa_senha,
      row.pessoa_status,
      row.data_criacao ? new Date(row.data_criacao) : null
    );
  }

  async findFisicaByPessoaId(pessoaId: number): Promise<Fisica | null> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT * FROM FISICA WHERE PESSOA_pessoa_id = ?',
      [pessoaId]
    );
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return new Fisica(
      row.pessoa_cpf,
      Boolean(row.pessoa_documentoValidado),
      Boolean(row.pessoa_fotoValidada),
      await this.findByLogin(row.PESSOA_pessoa_id.toString()) as Pessoa
    );
  }

  async findJuridicaByPessoaId(pessoaId: number): Promise<Juridica | null> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT * FROM JURIDICA WHERE PESSOA_pessoa_id = ?',
      [pessoaId]
    );
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return new Juridica(
      row.fornecedor_cnpj,
      row.fornecedor_num,
      await this.findByLogin(row.PESSOA_pessoa_id.toString()) as Pessoa
    );
  }
}