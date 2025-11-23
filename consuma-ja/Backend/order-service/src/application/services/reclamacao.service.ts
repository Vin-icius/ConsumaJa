import { ReclamacaoRepository } from '../../infrastructure/repositories/reclamacao.repository';

export class ReclamacaoService {
  private repository = new ReclamacaoRepository();

  async abrirReclamacao(dados: any) {
    // Aqui você poderia validar se a Venda existe antes de criar
    if (!dados.venda_id || !dados.pessoa_id) {
      throw new Error('Venda e Cliente são obrigatórios');
    }
    return await this.repository.create(dados);
  }

  async listarReclamacoes() {
    return await this.repository.findAll();
  }

  async avaliarReclamacao(id: number, aprovado: boolean, resposta: string) {
    const novoStatus = aprovado ? 'RESOLVIDA' : 'REJEITADA';
    
    // Lógica de negócio: Se aprovada, talvez devesse disparar a criação na tabela DEVOLUCAO
    // Por enquanto, vamos apenas fechar a reclamação.
    
    return await this.repository.updateStatus(id, novoStatus, resposta);
  }
}