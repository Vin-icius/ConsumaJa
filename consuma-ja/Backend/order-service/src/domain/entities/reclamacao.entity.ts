export class Reclamacao {
  constructor(
    public reclamacao_id: number,
    public titulo: string,
    public descricao: string,
    public classificacao: number,
    public status: 'PENDENTE' | 'ANALISE' | 'RESOLVIDA' | 'REJEITADA',
    public data_abertura: Date,
    public venda_id: number,
    public pessoa_id: number,
    public resposta_admin?: string,
    public data_fechamento?: Date
  ) {}
}