import { CategoriaService } from '../../application/services/categoria.service';
import { Request, Response } from 'express';

export class CategoriaController {
  constructor(private categoriaService: CategoriaService) {}

  async criarCategoria(req: Request, res: Response): Promise<void> {
    try {
      const categoria = await this.categoriaService.criarCategoria(req.body);
      res.status(201).json(categoria);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar categoria' });
    }
  }

  async listarCategorias(req: Request, res: Response): Promise<void> {
    try {
      const categorias = await this.categoriaService.listarCategorias();
      res.json(categorias);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao listar categorias' });
    }
  }

  async buscarCategoriaPorId(req: Request, res: Response): Promise<void> {
    try {
      const categoria = await this.categoriaService.buscarCategoriaPorId(parseInt(req.params.id));
      if (categoria) {
        res.json(categoria);
      } else {
        res.status(404).json({ message: 'Categoria não encontrada' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar categoria' });
    }
  }

  async atualizarCategoria(req: Request, res: Response): Promise<void> {
    try {
      const categoria = await this.categoriaService.atualizarCategoria(req.body);
      res.json(categoria);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar categoria' });
    }
  }

  async excluirCategoria(req: Request, res: Response): Promise<void> {
    try {
      await this.categoriaService.excluirCategoria(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Erro ao excluir categoria' });
    }
  }
}