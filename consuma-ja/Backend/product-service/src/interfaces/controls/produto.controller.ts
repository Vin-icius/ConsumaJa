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

  async listarPendentes(req: Request, res: Response): Promise<void>{
    try{
      const produtos = await this.produtoService.listarPendentes();
      res.json(produtos);
    } catch (error) {
      res.status(500).json({message: 'Erro ao listar produtos pendentes' })
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

  async aprovarProduto(req: Request, res: Response): Promise<void> {
    try {
      const produtoId = parseInt(req.params.id);
      await this.produtoService.aprovarProduto(produtoId);
      res.status(200).json({ message: 'Produto aprovado com sucesso' });
    } catch (error) {
      console.error('Erro ao aprovar produto:', error);
      res.status(500).json({ message: 'Erro ao aprovar produto' });
    }
  }

  async rejeitarProduto(req: Request, res: Response): Promise<void> {
    try {
      const produtoId = parseInt(req.params.id);
      const motivoRejeicao = req.body.motivoRejeicao;
      await this.produtoService.rejeitarProduto(produtoId, motivoRejeicao);
      res.status(200).json({ message: 'Produto rejeitado com sucesso' });
    } catch (error) {
      console.error('Erro ao rejeitar produto:', error);
      res.status(500).json({ message: 'Erro ao rejeitar produto' });
    }
  }
}