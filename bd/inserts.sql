INSERT INTO `PESSOA` VALUES 
(1,'Admin User','consumaja2025@gmail.com','11999999999','Admin','1','$2a$11$JKTbvCrhA99mX44.spT2J.BrXvgVG1uLKvlMDbM294oD/Zslvz9FW',1,'2025-04-29'),
(1000,'Gabryel','gablerlivros@gmail.com','18998082383','Fisica','47806728806','$2b$10$d2YsKYhI14q.WyzrUBtgReQ3IzIIFUd6aALTcftDlwIIrebTdGxZi',1,'2025-04-24'),
(1001,'Francisco Maracci','fvmaracci@gmail.com','18997442619','Fisica','30922325855','$2b$10$R56bBKp.Mr6u2TeHQ3A1P.kf57dDksmfwc0D.XRngRGySd9nl.po2',1,'2025-04-24'),
(1002,'fulvio','fanelli0157@gmail.com','18996464824','Fisica','19929318231','$2b$10$NMG2Z1rgz86vmsAR8HMK0OAWo7HZjkXLJUl1WlY5zhgGgR1J4rt4q',1,'2025-05-08'),
(1003,'Robson ','robson.siscoutto@gmail.com','18981420605','Fisica','08034895873','$2b$10$qibpUPC6.fZHGzBwcZCFg.lLG.jDLMYDhvfYfocheHjnzhYhd4t/O',1,'2025-05-08'),
(1004,'Wellington F','wellington05092003@gmail.com','18996691877','Fisica','49475788270','$2b$10$Q10A2H1hBhGdTc4KE2Qe0./3YdLX6jSFDrQda..fJoV5RjEqQ69ee',1,'2025-05-09'),
(1005,'JOEL ELIAS DE OLIVEIRA XAVIER','joel.xavier1979@gmail.com','18997970702','Fisica','21760811882','$2b$10$prP2h3LrUIUASMRNyVYO9uOWWmSZKaNIU7rbEtA1xhJyKaZpnB1oe',1,'2025-05-12');

INSERT INTO `ESTADO` (estado_id, estado_nome, estado_sigla) VALUES
(1, 'São Paulo', 'SP'),
(2, 'Santa Catarina', 'SC'),
(3, 'Paraná', 'PR'),
(4, 'Minas Gerais', 'MG');

INSERT INTO `CIDADE` (cidade_nome, regiao_ddd, ESTADO_estado_id) VALUES
('Pirapozinho','18',1),
('Presidente Prudente','18',1),
('Florianópolis','48',2),
('Álvares Machado','18',1),
('Mirante do Paranapanema','18',1),
('Franca','16',1),
('São Paulo', '11', 1),
('Campinas', '19', 1),
('Curitiba', '41',3),
('Londrina', '43',3),
('Belo Horizonte', '31', 4);

INSERT INTO `CATEGORIA_PRODUTO` (categoria_nome, ativo) VALUES
('Refrigerantes', TRUE),
('Chocolates', TRUE),
('Sucos', TRUE),
('Laticínios', TRUE),
('Salgadinhos', TRUE);INSERT INTO MARCA_PRODUTO (marca_nome, ativo) VALUES
('Coca-Cola', TRUE),
('Nestlé', TRUE),
('Garoto', TRUE),
('Lacta', TRUE),
('Del Valle', TRUE),
('Elma Chips', TRUE),
('Marca Teste Inativa', FALSE); -- Exemplo de inativa

INSERT INTO `TIPO_PRODUTO` (tipo_nome, ativo) VALUES
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
(1, 1, 1, 'Coca-Cola Lata Zero', 'PENDENTE', '350ml', 3.50, 'Refrigerante Coca-Cola Zero Açúcar em lata', NOW(), TRUE),
(2, 3, 2, 'KitKat Tradicional', 'PENDENTE', '41.5g', 2.99, 'Chocolate KitKat ao Leite Nestlé', NOW(), TRUE),
(3, 3, 2, 'Talento Amêndoas e Passas', 'PENDENTE', '90g', 7.50, 'Chocolate Garoto Talento Meio Amargo com Amêndoas e Passas', NOW(), TRUE),
(5, 4, 3, 'Suco Del Valle Uva', 'PENDENTE', '1L', 6.80, 'Néctar de Uva Del Valle TetraPak', NOW(), TRUE),
(6, 6, 5, 'Cheetos Requeijão', 'PENDENTE', '90g', 4.50, 'Salgadinho de Milho sabor Requeijão (Elma Chips)', NOW(), TRUE), -- Status Rejeitado, Ativo=TRUE
(4, 3, 2, 'Diamante Negro', 'PENDENTE', '90g', 7.00, 'Chocolate Lacta Diamante Negro', NOW(), FALSE); -- Status Aprovado, Ativo=FALSE