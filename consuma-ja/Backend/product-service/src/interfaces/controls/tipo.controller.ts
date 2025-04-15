import { TipoService } from '../../application/services/tipo.service';
import { Request, Response } from 'express';

export class TipoController {
  constructor(private tipoService: TipoService) {}

  async criarTipo(req: Request, res: Response): Promise<void> {
    try {
      const tipo = await this.tipoService.criarTipo(req.body);
      res.status(201).json(tipo);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar tipo' });
    }
  }

  async listarTipos(req: Request, res: Response): Promise<void> {
    try {
      const tipos = await this.tipoService.listarTipos();
      res.json(tipos);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao listar tipos' });
    }
  }

  async buscarTipoPorId(req: Request, res: Response): Promise<void> {
    try {
      const tipo = await this.tipoService.buscarTipoPorId(parseInt(req.params.id));
      if (tipo) {
        res.json(tipo);
      } else {
        res.status(404).json({ message: 'Tipo não encontrado' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar tipo' });
    }
  }

  async atualizarTipo(req: Request, res: Response): Promise<void> {
    try {
      const tipo = await this.tipoService.atualizarTipo(req.body);
      res.json(tipo);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar tipo' });
    }
  }

  async excluirTipo(req: Request, res: Response): Promise<void> {
    try {
      await this.tipoService.excluirTipo(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Erro ao excluir tipo' });
    }
  }
}