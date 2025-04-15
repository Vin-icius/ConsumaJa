import { ProdutoService } from '../../application/services/produto.service';
import { Request, Response } from 'express';

export class ProdutoController {
  constructor(private produtoService: ProdutoService) {}

  async criarProduto(req: Request, res: Response): Promise<void> {
    try {
      const produto = await this.produtoService.criarProduto(req.body);
      res.status(201).json(produto);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar produto' });
    }
  }

  async atualizarProduto(req: Request, res: Response): Promise<void> {
    try {
      const produto = await this.produtoService.atualizarProduto(req.body);
      res.json(produto);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar produto' });
    }
  }

  async buscarProdutoPorId(req: Request, res: Response): Promise<void> {
    try {
      const produto = await this.produtoService.buscarProdutoPorId(parseInt(req.params.id));
      if (produto) {
        res.json(produto);
      } else {
        res.status(404).json({ message: 'Produto não encontrado' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar produto' });
    }
  }

  async listarProdutos(req: Request, res: Response): Promise<void> {
    try {
      const produtos = await this.produtoService.listarProdutos();
      res.json(produtos);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao listar produtos' });
    }
  }

  async excluirProduto(req: Request, res: Response): Promise<void> {
    try {
      await this.produtoService.excluirProduto(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Erro ao excluir produto' });
    }
  }
}