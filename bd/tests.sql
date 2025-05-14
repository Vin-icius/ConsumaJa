USE consumajadb;

SELECT * FROM pessoa
SELECT * FROM ESTADO
SELECT * FROM CIDADE
SELECT * FROM CATEGORIA_PRODUTO
SELECT * FROM TIPO_PRODUTO
SELECT * FROM MARCA_PRODUTO
SELECT * FROM PRODUTO
SELECT * FROM PESSOA
SELECT * FROM fisica
SELECT * FROM ENDERECO
SELECT * FROM PESSOA WHERE pessoa_login = '1';




INSERT INTO promocao values(1, 'Teste', CURDATE(), CURDATE(), 9, 1,1);
INSERT INTO PESSOA values(1, 'Admin', 'admin@email.com', '111111111', 'Admin', '1', '$2a$11$JKTbvCrhA99mX44.spT2J.BrXvgVG1uLKvlMDbM294oD/Zslvz9FW', 1, CURDATE());
SELECT * FROM PROMOCAO
SELECT * FROM JURIDICA
SELECT * FROM ENDERECO
SELECT * FROM PROMOCAO
SELECT * FROM LOTEPROD

ALTER TABLE FISICA
ADD COLUMN foto_selfie_path VARCHAR(512) NULL DEFAULT NULL COMMENT 'Caminho relativo da foto da selfie no servidor' AFTER pessoa_fotoValidada,
ADD COLUMN foto_documento_path VARCHAR(512) NULL DEFAULT NULL COMMENT 'Caminho relativo da foto do documento no servidor' AFTER foto_selfie_path;

INSERT INTO ENDERECO (PESSOA_pessoa_id, CIDADE_cidade_id, rua, numero, bairro, cep, ativo) VALUES
(9, 1, 'Av. da Economia', '100', 'Centro', '19010010', TRUE);

INSERT INTO LOTEPROD (produto_id, lote_codigo, lote_validade, lote_quantidade_inicial, lote_quantidade_atual, data_entrada, ativo) VALUES
(1, 'CERVLX001', DATE_ADD(CURDATE(), INTERVAL 6 MONTH), 200, 150, NOW(), TRUE);

INSERT INTO LOTEPROD (produto_id, lote_codigo, lote_validade, lote_quantidade_inicial, lote_quantidade_atual, data_entrada, ativo) VALUES
(2, 'CERVLX002', DATE_ADD(CURDATE(), INTERVAL 6 MONTH), 200, 150, NOW(), TRUE);

INSERT INTO LOTEPROD (produto_id, lote_codigo, lote_validade, lote_quantidade_inicial, lote_quantidade_atual, data_entrada, ativo) VALUES
(3, 'CERVLX003', DATE_ADD(CURDATE(), INTERVAL 6 MONTH), 200, 150, NOW(), TRUE);

INSERT INTO LOTEPROD (produto_id, lote_codigo, lote_validade, lote_quantidade_inicial, lote_quantidade_atual, data_entrada, ativo) VALUES
(4, 'CERVLX004', DATE_ADD(CURDATE(), INTERVAL 6 MONTH), 200, 150, NOW(), TRUE);

INSERT INTO PROMOCAO (promocao_descricao, inicio, fim, JURIDICA_PESSOA_pessoa_id, endereco_id, ativo) VALUES
('HIPER PROMOÇÃO', DATE_SUB(NOW(), INTERVAL 2 DAY), NULL, 13, 1, TRUE);

INSERT INTO ITEM_PROMOCAO (PROMOCAO_promocao_id, LOTEPROD_lote_id, itemPromocao_qtde, itemPromocao_valor) VALUES
(4, 4, 50, 2.99);

INSERT INTO ITEM_PROMOCAO (PROMOCAO_promocao_id, LOTEPROD_lote_id, itemPromocao_qtde, itemPromocao_valor) VALUES
(4, 3, 100, 1.99);

select * from loteprod

select * from item_promocao
ALTER TABLE PRODUTO
ADD COLUMN produto_imagem_url VARCHAR(512) NULL DEFAULT NULL COMMENT 'URL da imagem principal do produto' AFTER data_exclusao;


SELECT produto_id, produto_nome, ativo, produto_status
FROM PRODUTO
WHERE ativo = TRUE AND produto_status = 'APROVADO' AND produto_nome LIKE '%k%';

select * from endereco
select * from pessoa

SELECT e.*, c.cidade_nome, est.estado_sigla, est.estado_nome
FROM ENDERECO e
JOIN CIDADE c ON e.CIDADE_cidade_id = c.cidade_id
JOIN ESTADO est ON c.ESTADO_estado_id = est.estado_id
WHERE e.PESSOA_pessoa_id = 14 AND e.ativo = TRUE
ORDER BY e.rua ASC
LIMIT 10 OFFSET 0;

select * from produto
