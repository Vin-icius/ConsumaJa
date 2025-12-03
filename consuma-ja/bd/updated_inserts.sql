USE ConsumaJaDB;

INSERT INTO PESSOA (pessoa_id, pessoa_nome, pessoa_email, pessoa_telefone, pessoa_tipo, pessoa_login, pessoa_senha, pessoa_status, data_criacao)
VALUES (2000, 'Fornecedor Teste', 'fornecedor@example.com', '11900000000', 'Juridica', 'fornecedor_teste', 'hashed_password', 1, CURRENT_DATE());

INSERT INTO JURIDICA (cnpj, fornecedor_num, PESSOA_pessoa_id, taxa_entrega, parcelas_config)
VALUES ('12.345.678/0001-00', 1, 2000, 12.50, JSON_OBJECT('maxParcelas', 3));

INSERT INTO MARCA_PRODUTO (marca_nome, ativo)
VALUES ('Marca Padrão', 1);

INSERT INTO CATEGORIA_PRODUTO (categoria_nome, fornecedor_pessoa_id, ativo)
VALUES ('Bebidas', 2000, 1);

INSERT INTO TIPO_PRODUTO (tipo_nome, fornecedor_pessoa_id, ativo)
VALUES ('Refrigerante', 2000, 1);

INSERT INTO PRODUTO (
  MARCA_PRODUTO_marca_id,
  TIPO_PRODUTO_tipo_id,
  CATEGORIA_PRODUTO_categoria_id,
  fornecedor_pessoa_id,
  produto_nome,
  produto_status,
  produto_medida,
  produto_precoOriginal,
  motivo,
  descricao,
  produto_imagem_url,
  ativo
) VALUES (
  1,
  1,
  1,
  2000,
  'Refrigerante Lata 350ml',
  'APROVADO',
  '350ml',
  5.99,
  NULL,
  'Refrigerante sabor cola',
  NULL,
  1
);

INSERT INTO LOTEPROD (
  produto_id,
  fornecedor_pessoa_id,
  lote_codigo,
  lote_validade,
  lote_quantidade_inicial,
  lote_quantidade_atual,
  data_entrada,
  ativo
) VALUES (
  1,
  2000,
  'LOTE-REF-001',
  DATE_ADD(CURRENT_DATE(), INTERVAL 180 DAY),
  100,
  100,
  CURRENT_TIMESTAMP(),
  1
);

INSERT INTO NOTIFICACAO (
  PESSOA_pessoa_id,
  titulo,
  mensagem,
  notificacao_tipo,
  destinatario_tipo,
  venda_id,
  rota_destino,
  payload,
  lida
) VALUES
  (2000, 'Novo Pedido Recebido', 'Um cliente finalizou uma nova compra.', 'VENDA_NOVA_FORNECEDOR', 'FORNECEDOR', NULL, '/orders/details', JSON_OBJECT('vendaId', 1), 0),
  (2000, 'Etapa Atualizada', 'O pedido avançou para logística.', 'VENDA_ETAPA_ATUALIZADA', 'CLIENTE', NULL, '/orders/details', JSON_OBJECT('vendaId', 1, 'etapa', 'LOGISTICA_TRANSPORTADORA'), 0);
