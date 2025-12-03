import { ResultSetHeader } from 'mysql2/promise';
import { pool } from '../database/mysql.connection';
import { CreateNotificationData, NotificationRepository } from '../../domain/repositories/notification.repository';

export class NotificationMySQLRepository implements NotificationRepository {
  async criar(data: CreateNotificationData): Promise<void> {
    await pool.query<ResultSetHeader>(
      `INSERT INTO NOTIFICACAO (
        PESSOA_pessoa_id,
        titulo,
        mensagem,
        notificacao_tipo,
        destinatario_tipo,
        venda_id,
        rota_destino,
        payload,
        lida
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        data.pessoaId,
        data.titulo,
        data.mensagem,
        data.tipo,
        data.destinatarioTipo,
        data.vendaId ?? null,
        data.rotaDestino ?? null,
        data.payload ? JSON.stringify(data.payload) : null,
      ],
    );
  }
}
