USE ConsumaJaDB;

-- -----------------------------------------------------
-- INSERTS PARA LOCATION-SERVICE
-- -----------------------------------------------------

INSERT INTO ESTADO (estado_nome, estado_sigla) VALUES
('São Paulo', 'SP'),
('Paraná', 'PR'),
('Minas Gerais', 'MG');

INSERT INTO CIDADE (cidade_nome, regiao_ddd, ESTADO_estado_id) VALUES
('Presidente Prudente', '18', 1),
('São Paulo', '11', 1),
('Campinas', '19', 1),
('Curitiba', '41', 2),
('Londrina', '43', 2),
('Belo Horizonte', '31', 3);

-- -----------------------------------------------------
-- INSERTS PARA PRODUCT-SERVICE
-- -----------------------------------------------------

INSERT INTO CATEGORIA_PRODUTO (categoria_nome, ativo) VALUES
('Refrigerantes', TRUE),
('Chocolates', TRUE),
('Sucos', TRUE),
('Laticínios', TRUE),
('Salgadinhos', TRUE);

INSERT INTO MARCA_PRODUTO (marca_nome, ativo) VALUES
('Coca-Cola', TRUE),
('Nestlé', TRUE),
('Garoto', TRUE),
('Lacta', TRUE),
('Del Valle', TRUE),
('Elma Chips', TRUE),
('Marca Teste Inativa', FALSE); -- Exemplo de inativa

INSERT INTO TIPO_PRODUTO (tipo_nome, ativo) VALUES
('Lata 350ml', TRUE),
('Garrafa PET 2L', TRUE),
('Barra 90g', TRUE),
('Caixa 1L', TRUE),
('Iogurte Copo', TRUE),
('Pacote 100g', TRUE);

INSERT INTO PRODUTO (
    MARCA_PRODUTO_marca_id, TIPO_PRODUTO_tipo_id, CATEGORIA_PRODUTO_categoria_id,
    produto_nome, produto_status, produto_medida, produto_precoOriginal,
    descricao, data_registro, ativo
) VALUES

-- HÁ PRODUTOS INATIVOS PARA TESTE, VERIFIQUE NESTES INSERTS
(1, 1, 1, 'Coca-Cola Lata Zero', 'PENDENTE', '350ml', 3.50, 'Refrigerante Coca-Cola Zero Açúcar em lata', NOW(), TRUE),

(2, 3, 2, 'KitKat Tradicional', 'PENDENTE', '41.5g', 2.99, 'Chocolate KitKat ao Leite Nestlé', NOW(), TRUE),

(3, 3, 2, 'Talento Amêndoas e Passas', 'PENDENTE', '90g', 7.50, 'Chocolate Garoto Talento Meio Amargo com Amêndoas e Passas', NOW(), TRUE),

(5, 4, 3, 'Suco Del Valle Uva', 'PENDENTE', '1L', 6.80, 'Néctar de Uva Del Valle TetraPak', NOW(), TRUE),

(6, 6, 5, 'Cheetos Requeijão', 'PENDENTE', '90g', 4.50, 'Salgadinho de Milho sabor Requeijão (Elma Chips)', NOW(), TRUE), -- Status Rejeitado, Ativo=TRUE

(4, 3, 2, 'Diamante Negro', 'PENDENTE', '90g', 7.00, 'Chocolate Lacta Diamante Negro', NOW(), FALSE); -- Status Aprovado, Ativo=FALSE

-- SELECT * FROM ESTADO;
-- SELECT * FROM CIDADE;
-- SELECT * FROM CATEGORIA_PRODUTO;
-- SELECT * FROM MARCA_PRODUTO;
-- SELECT * FROM TIPO_PRODUTO;
-- SELECT p.*, c.categoria_nome, m.marca_nome, t.tipo_nome FROM PRODUTO p LEFT JOIN CATEGORIA_PRODUTO c ON p.CATEGORIA_PRODUTO_categoria_id = c.categoria_id LEFT JOIN MARCA_PRODUTO m ON p.MARCA_PRODUTO_marca_id = m.marca_id LEFT JOIN TIPO_PRODUTO t ON p.TIPO_PRODUTO_tipo_id = t.tipo_id;