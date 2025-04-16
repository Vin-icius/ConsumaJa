import { Categoria } from "../../domain/entities/categoria.entity";
import { Marca } from "../../domain/entities/marca.entity";
import { Produto } from "../../domain/entities/produto.entity";
import { Tipo } from "../../domain/entities/tipo.entity";
import { ProdutoRepository } from "../../domain/repositories/produto.repository";
import { mysqlConnection } from "../database/mysql.connection";

/*
import { ProdutoRepository } from '../../repositories/produto.repository';
import { Produto } from '../entities/produto.entity';
import { Marca } from '../entities/marca.entity';
import { Categoria } from '../entities/categoria.entity';
import { Tipo } from '../entities/tipo.entity';
import { mysqlConnection } from '../database/mysql.connection';
*/

export class ProdutoMySQLRepository implements ProdutoRepository {
  async criar(produto: Produto): Promise<Produto> {
    const [result]: any = await mysqlConnection.execute(
      'INSERT INTO PRODUTO (MARCA_PRODUTO_marca_id, TIPO_PRODUTO_tipo_id, CATEGORIA_PRODUTO_categoria_id, produto_nome, produto_status, produto_medida, produto_precoOriginal, motivo, descricao, data_registro, data_aprovacao, data_exlusao, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        produto.marca.id,
        produto.tipo.id,
        produto.categoria.id,
        produto.nome,
        produto.status,
        produto.unidadeMedida,
        produto.precoOriginal,
        produto.motivo,
        produto.descricao,
        produto.dataRegistro,
        produto.dataAprovacao,
        produto.dataExclusao,
        produto.ativo,
      ]
    );

    return { ...produto, id: result.insertId };
  }

  async atualizar(produto: Produto): Promise<Produto> {
    await mysqlConnection.execute(
      'UPDATE PRODUTO SET MARCA_PRODUTO_marca_id = ?, TIPO_PRODUTO_tipo_id = ?, CATEGORIA_PRODUTO_categoria_id = ?, produto_nome = ?, produto_status = ?, produto_medida = ?, produto_precoOriginal = ?, motivo = ?, descricao = ?, data_registro = ?, data_aprovacao = ?, data_exlusao = ?, status = ? WHERE produto_id = ?',
      [
        produto.marca.id,
        produto.tipo.id,
        produto.categoria.id,
        produto.nome,
        produto.status,
        produto.unidadeMedida,
        produto.precoOriginal,
        produto.motivo,
        produto.descricao,
        produto.dataRegistro,
        produto.dataAprovacao,
        produto.dataExclusao,
        produto.ativo,
        produto.id,
      ]
    );

    return produto;
  }

  async buscarPorId(id: number): Promise<Produto | null> {
    const [rows]: any = await mysqlConnection.execute(
      'SELECT * FROM PRODUTO WHERE produto_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return new Produto(
      row.produto_id,
      new Marca(row.MARCA_PRODUTO_marca_id, ''), // Necessário buscar o nome da marca
      new Categoria(row.CATEGORIA_PRODUTO_categoria_id, ''), // Necessário buscar o nome da categoria
      new Tipo(row.TIPO_PRODUTO_tipo_id, ''), // Necessário buscar o nome do tipo
      row.produto_nome,
      row.produto_status,
      row.produto_medida,
      row.produto_precoOriginal,
      row.motivo,
      row.descricao,
      row.data_registro,
      row.data_aprovacao,
      row.data_exlusao,
      row.status
    );
  }

  async listar(): Promise<Produto[]> {
    const [rows]: any = await mysqlConnection.execute('SELECT * FROM PRODUTO');

    return rows.map((row: any) => new Produto(
      row.produto_id,
      new Marca(row.MARCA_PRODUTO_marca_id, ''), // Necessário buscar o nome da marca
      new Categoria(row.CATEGORIA_PRODUTO_categoria_id, ''), // Necessário buscar o nome da categoria
      new Tipo(row.TIPO_PRODUTO_tipo_id, ''), // Necessário buscar o nome do tipo
      row.produto_nome,
      row.produto_status,
      row.produto_medida,
      row.produto_precoOriginal,
      row.motivo,
      row.descricao,
      row.data_registro,
      row.data_aprovacao,
      row.data_exlusao,
      row.status
    ));
  }

  async listarPendentes(): Promise<Produto[]> {
    const pendente = 'PENDENTE'
    const [rows]: any = await mysqlConnection.execute('SELECT * FROM PRODUTO WHERE produto_status = ?', [pendente]);

    return rows.map((row: any) => new Produto(
      row.produto_id,
      new Marca(row.MARCA_PRODUTO_marca_id, ''), // Necessário buscar o nome da marca
      new Categoria(row.CATEGORIA_PRODUTO_categoria_id, ''), // Necessário buscar o nome da categoria
      new Tipo(row.TIPO_PRODUTO_tipo_id, ''), // Necessário buscar o nome do tipo
      row.produto_nome,
      row.produto_status,
      row.produto_medida,
      row.produto_precoOriginal,
      row.motivo,
      row.descricao,
      row.data_registro,
      row.data_aprovacao,
      row.data_exlusao,
      row.status
    ));
  }

  async excluir(id: number): Promise<void> {
    await mysqlConnection.execute('DELETE FROM PRODUTO WHERE produto_id = ?', [id]);
  }

  async aprovar(produtoId: number): Promise<void> {
    await mysqlConnection.execute('UPDATE PRODUTO SET produto_status = "APROVADO", motivo = null WHERE produto_id = ?', [produtoId]);
  }

  async rejeitar(produtoId: number, motivoRejeicao: string): Promise<void> {
    await mysqlConnection.execute('UPDATE PRODUTO SET produto_status = "REJEITADO", motivo = ? WHERE produto_id = ?', [motivoRejeicao, produtoId]);
  }
}