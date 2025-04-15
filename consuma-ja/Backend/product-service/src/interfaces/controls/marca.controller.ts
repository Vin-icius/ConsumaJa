import { MarcaService } from '../../application/services/marca.service';
import { Request, Response } from 'express';

export class MarcaController {
  constructor(private marcaService: MarcaService) {}

  async criarMarca(req: Request, res: Response): Promise<void> {
    try {
      const marca = await this.marcaService.criarMarca(req.body);
      res.status(201).json(marca);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar marca' });
    }
  }

  async listarMarcas(req: Request, res: Response): Promise<void> {
    try {
      const marcas = await this.marcaService.listarMarcas();
      res.json(marcas);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao listar marcas' });
    }
  }

  async buscarMarcaPorId(req: Request, res: Response): Promise<void> {
    try {
      const marca = await this.marcaService.buscarMarcaPorId(parseInt(req.params.id));
      if (marca) {
        res.json(marca);
      } else {
        res.status(404).json({ message: 'Marca não encontrada' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar marca' });
    }
  }

  async atualizarMarca(req: Request, res: Response): Promise<void> {
    try {
      const marca = await this.marcaService.atualizarMarca(req.body);
      res.json(marca);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar marca' });
    }
  }

  async excluirMarca(req: Request, res: Response): Promise<void> {
    try {
      await this.marcaService.excluirMarca(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Erro ao excluir marca' });
    }
  }
}