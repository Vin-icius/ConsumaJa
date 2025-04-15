import { Tipo } from "../../domain/entities/tipo.entity";
import { TipoRepository } from "../../domain/repositories/tipo-produto.repository";
import { mysqlConnection } from "../database/mysql.connection";

export class TipoMySQLRepository implements TipoRepository {
  async criar(tipo: Tipo): Promise<Tipo> {
    const [result]: any = await mysqlConnection.execute(
      "INSERT INTO TIPO_PRODUTO (tipo_nome) VALUES (?)",
      [tipo.nome]
    );
    return { ...tipo, id: result.insertId };
  }

  async listar(): Promise<Tipo[]> {
    const [rows]: any = await mysqlConnection.execute("SELECT * FROM TIPO_PRODUTO");
    return rows.map((row: any) => new Tipo(row.tipo_id, row.tipo_nome));
  }

  async buscarPorId(id: number): Promise<Tipo | null> {
    const [rows]: any = await mysqlConnection.execute("SELECT * FROM TIPO_PRODUTO WHERE tipo_id = ?", [id]);
    if (rows.length === 0) {
      return null;
    }
    const row = rows[0];
    return new Tipo(row.tipo_id, row.tipo_nome);
  }

  async atualizar(tipo: Tipo): Promise<Tipo> {
    await mysqlConnection.execute("UPDATE TIPO_PRODUTO SET tipo_nome = ? WHERE tipo_id = ?", [tipo.nome, tipo.id]);
    return tipo;
  }

  async excluir(id: number): Promise<void> {
    await mysqlConnection.execute("DELETE FROM TIPO_PRODUTO WHERE tipo_id = ?", [id]);
  }
}