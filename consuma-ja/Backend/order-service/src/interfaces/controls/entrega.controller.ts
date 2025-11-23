import { Request, Response } from 'express';
import { pool } from '../../infrastructure/database/mysql.connection';

export class EntregaController {
  
  async simular(req: Request, res: Response) {
    const { clienteId, fornecedorId } = req.body;

    if (!clienteId || !fornecedorId) {
      res.status(400).json({ message: 'ID do Cliente e Fornecedor são obrigatórios.' });
      return;
    }

    try {
      // 1. Buscar Endereço do Cliente
      const [rowsCliente]: any = await pool.execute(
        `SELECT e.rua, e.numero, e.bairro, c.cidade_nome 
         FROM ENDERECO e 
         JOIN CIDADE c ON e.CIDADE_cidade_id = c.cidade_id 
         WHERE e.PESSOA_pessoa_id = ? LIMIT 1`,
        [clienteId]
      );

      // 2. Buscar Endereço do Fornecedor
      const [rowsFornecedor]: any = await pool.execute(
        `SELECT e.rua, e.numero, e.bairro, c.cidade_nome 
         FROM ENDERECO e 
         JOIN CIDADE c ON e.CIDADE_cidade_id = c.cidade_id 
         WHERE e.PESSOA_pessoa_id = ? LIMIT 1`,
        [fornecedorId]
      );

      if (rowsCliente.length === 0 || rowsFornecedor.length === 0) {
        res.status(404).json({ message: 'Endereço não encontrado para as partes.' });
        return;
      }

      const endCliente = rowsCliente[0];
      const endFornecedor = rowsFornecedor[0];

      // 3. SIMULAÇÃO DA LÓGICA DA UBER (Mock)
      // Aqui integraríamos com a API real. Por enquanto, geramos dados aleatórios "realistas".
      const distanciaKm = (Math.random() * 10 + 2).toFixed(1); // Entre 2 e 12km
      const precoBase = 7.00;
      const precoKm = 1.50;
      const total = (precoBase + (parseFloat(distanciaKm) * precoKm)).toFixed(2);
      const tempoMin = Math.floor(parseFloat(distanciaKm) * 3 + 10); // 3 min por km + 10 base

      res.json({
        origem: `${endFornecedor.rua}, ${endFornecedor.numero} - ${endFornecedor.bairro}`,
        destino: `${endCliente.rua}, ${endCliente.numero} - ${endCliente.bairro}`,
        servico: 'Uber Flash Moto',
        distancia: `${distanciaKm} km`,
        tempo_estimado: `${tempoMin} min`,
        custo: `R$ ${total}`
      });

    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao simular entrega' });
    }
  }
}