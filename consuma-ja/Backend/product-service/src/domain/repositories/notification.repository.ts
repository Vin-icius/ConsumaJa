export interface CreateNotificationData {
  pessoaId: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  destinatarioTipo: 'CLIENTE' | 'FORNECEDOR' | 'ADMIN';
  vendaId?: number | null;
  rotaDestino?: string | null;
  payload?: Record<string, unknown> | null;
}

export interface NotificationRepository {
  criar(data: CreateNotificationData): Promise<void>;
}
