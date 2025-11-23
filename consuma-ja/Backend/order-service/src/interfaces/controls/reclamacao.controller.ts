import { Request, Response } from 'express';
import { ReclamacaoService } from '../../application/services/reclamacao.service';

export class ReclamacaoController {
  private service = new ReclamacaoService();

  // Estória 15
  async criar(req: Request, res: Response) {
    try {
      await this.service.abrirReclamacao(req.body);
      res.status(201).json({ message: 'Reclamação aberta com sucesso' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const lista = await this.service.listarReclamacoes();
      res.json(lista);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Estória 16
  async aprovarOuRejeitar(req: Request, res: Response) {
    const { id } = req.params;
    const { aprovado, resposta } = req.body; // aprovado: true/false
    
    try {
      await this.service.avaliarReclamacao(Number(id), aprovado, resposta);
      res.json({ message: `Reclamação ${aprovado ? 'aprovada' : 'rejeitada'} com sucesso` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}