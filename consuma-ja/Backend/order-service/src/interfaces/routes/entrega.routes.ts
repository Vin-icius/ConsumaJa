import { Router } from 'express';
import { EntregaController } from '../controls/entrega.controller';

export class EntregaRoutes {
  public router = Router();
  private controller = new EntregaController();

  constructor() {
    this.router.post('/simulacao', (req, res) => this.controller.simular(req, res));
  }
}