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





-- SELECT * FROM ESTADO;
-- SELECT * FROM CIDADE;
-- SELECT * FROM CATEGORIA_PRODUTO;
-- SELECT * FROM MARCA_PRODUTO;
-- SELECT * FROM TIPO_PRODUTO;
-- SELECT p.*, c.categoria_nome, m.marca_nome, t.tipo_nome FROM PRODUTO p LEFT JOIN CATEGORIA_PRODUTO c ON p.CATEGORIA_PRODUTO_categoria_id = c.categoria_id LEFT JOIN MARCA_PRODUTO m ON p.MARCA_PRODUTO_marca_id = m.marca_id LEFT JOIN TIPO_PRODUTO t ON p.TIPO_PRODUTO_tipo_id = t.tipo_id;