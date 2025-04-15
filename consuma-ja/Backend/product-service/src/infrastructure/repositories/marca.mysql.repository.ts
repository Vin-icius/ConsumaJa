import { Marca } from "../../domain/entities/marca.entity";
import { MarcaRepository } from "../../domain/repositories/marca-produto.repository";
import { mysqlConnection } from "../database/mysql.connection";

export class MarcaMySQLRepository implements MarcaRepository {
  async criar(marca: Marca): Promise<Marca> {
    const [result]: any = await mysqlConnection.execute(
      "INSERT INTO MARCA_PRODUTO (marca_nome) VALUES (?)",
      [marca.nome]
    );
    return { ...marca, id: result.insertId };
  }

  async listar(): Promise<Marca[]> {
    const [rows]: any = await mysqlConnection.execute("SELECT * FROM MARCA_PRODUTO");
    return rows.map((row: any) => new Marca(row.marca_id, row.marca_nome));
  }

  async buscarPorId(id: number): Promise<Marca | null> {
    const [rows]: any = await mysqlConnection.execute("SELECT * FROM MARCA_PRODUTO WHERE marca_id = ?", [id]);
    if (rows.length === 0) {
      return null;
    }
    const row = rows[0];
    return new Marca(row.marca_id, row.marca_nome);
  }

  async atualizar(marca: Marca): Promise<Marca> {
    await mysqlConnection.execute("UPDATE MARCA_PRODUTO SET marca_nome = ? WHERE marca_id = ?", [marca.nome, marca.id]);
    return marca;
  }

  async excluir(id: number): Promise<void> {
    await mysqlConnection.execute("DELETE FROM MARCA_PRODUTO WHERE marca_id = ?", [id]);
  }
}