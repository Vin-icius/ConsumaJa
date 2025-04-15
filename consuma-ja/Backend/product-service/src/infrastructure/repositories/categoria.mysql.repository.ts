import { Categoria } from "../../domain/entities/categoria.entity";
import { CategoriaRepository } from "../../domain/repositories/categoria-produto.repository";
import { mysqlConnection } from "../database/mysql.connection";

export class CategoriaMySQLRepository implements CategoriaRepository {
  async criar(categoria: Categoria): Promise<Categoria> {
    const [result]: any = await mysqlConnection.execute(
      "INSERT INTO CATEGORIA_PRODUTO (categoria_nome) VALUES (?)",
      [categoria.nome]
    );
    return { ...categoria, id: result.insertId };
  }

  async listar(): Promise<Categoria[]> {
    const [rows]: any = await mysqlConnection.execute("SELECT * FROM CATEGORIA_PRODUTO");
    return rows.map((row: any) => new Categoria(row.categoria_id, row.categoria_nome));
  }

  async buscarPorId(id: number): Promise<Categoria | null> {
    const [rows]: any = await mysqlConnection.execute("SELECT * FROM CATEGORIA_PRODUTO WHERE categoria_id = ?", [id]);
    if (rows.length === 0) {
      return null;
    }
    const row = rows[0];
    return new Categoria(row.categoria_id, row.categoria_nome);
  }

  async atualizar(categoria: Categoria): Promise<Categoria> {
    await mysqlConnection.execute("UPDATE CATEGORIA_PRODUTO SET categoria_nome = ? WHERE categoria_id = ?", [categoria.nome, categoria.id]);
    return categoria;
  }

  async excluir(id: number): Promise<void> {
    await mysqlConnection.execute("DELETE FROM CATEGORIA_PRODUTO WHERE categoria_id = ?", [id]);
  }
}