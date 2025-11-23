import { Router } from 'express';
import { ReclamacaoController } from '../controls/reclamacao.controller';

export class ReclamacaoRoutes {
  public router = Router();
  private controller = new ReclamacaoController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', (req, res) => this.controller.criar(req, res));
    this.router.get('/', (req, res) => this.controller.listar(req, res));
    // Rota para o admin aprovar/rejeitar
    this.router.patch('/:id/avaliacao', (req, res) => this.controller.aprovarOuRejeitar(req, res));
  }
}