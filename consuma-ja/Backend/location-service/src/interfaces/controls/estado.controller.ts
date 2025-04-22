import { Request, Response, NextFunction } from 'express';
import { EstadoService } from '../../application/services/estado.service';
import { CreateEstadoDto } from '../dtos/estado-create.dto';
import { UpdateEstadoDto } from '../dtos/estado-update.dto';

export class EstadoController {
  // Injeção de Dependência do serviço
  constructor(private estadoService: EstadoService) {}

  // --- Métodos do Controller ---

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Idealmente, usar um DTO com validação (ex: class-validator)
      const createDto: CreateEstadoDto = req.body;
      const novoEstado = await this.estadoService.createEstado(createDto);
      res.status(201).json(novoEstado);
    } catch (error) {
      next(error); // Passa para o middleware de erro
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
       const { nome, sigla } = req.query; // Pegar parâmetros de busca [source: 107]
       const params = {
           nome: nome as string | undefined,
           sigla: sigla as string | undefined
       };
       const estados = await this.estadoService.getAllEstados(params);
       res.status(200).json(estados);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
       if (isNaN(id)) {
           res.status(400).json({ message: 'ID inválido.' });
           return;
       }
      const estado = await this.estadoService.getEstadoById(id);
      res.status(200).json(estado);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
       if (isNaN(id)) {
           res.status(400).json({ message: 'ID inválido.' });
           return;
       }
      const updateDto: UpdateEstadoDto = req.body;
       if (Object.keys(updateDto).length === 0) {
            res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
           return;
       }
      const estadoAtualizado = await this.estadoService.updateEstado(id, updateDto);
      res.status(200).json(estadoAtualizado);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
       if (isNaN(id)) {
           res.status(400).json({ message: 'ID inválido.' });
           return;
       }
      await this.estadoService.deleteEstado(id);
      res.status(204).send(); // No Content
    } catch (error) {
      next(error);
    }
  }
}