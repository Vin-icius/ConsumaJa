                 -- -----------------------------------------------------
-- Schema ConsumaJaDB
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `ConsumaJaDB` ;

-- -----------------------------------------------------
-- Schema ConsumaJaDB
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `ConsumaJaDB` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `ConsumaJaDB` ;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`pessoa`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `pessoa`;
CREATE TABLE `pessoa` (
  `pessoa_id` int unsigned NOT NULL AUTO_INCREMENT,
  `pessoa_nome` varchar(255) NOT NULL,
  `pessoa_email` varchar(255) NOT NULL,
  `pessoa_telefone` varchar(20) DEFAULT NULL,
  `pessoa_tipo` enum('Fisica','Juridica','Admin') NOT NULL,
  `pessoa_login` varchar(100) NOT NULL,
  `pessoa_senha` varchar(100) NOT NULL,
  `pessoa_status` tinyint NOT NULL,
  `data_criacao` date DEFAULT NULL,
  PRIMARY KEY (`pessoa_id`),
  UNIQUE KEY `idPESSOA_UNIQUE` (`pessoa_id`),
  UNIQUE KEY `pessoa_email_UNIQUE` (`pessoa_email`),
  UNIQUE KEY `pessoa_login_UNIQUE` (`pessoa_login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`estado`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `estado`;
CREATE TABLE `estado` (
  `estado_id` int NOT NULL AUTO_INCREMENT,
  `estado_nome` varchar(45) NOT NULL,
  `estado_sigla` varchar(3) NOT NULL,
  PRIMARY KEY (`estado_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`cidade`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cidade`;
CREATE TABLE `cidade` (
  `cidade_id` int NOT NULL AUTO_INCREMENT,
  `cidade_nome` varchar(45) DEFAULT NULL,
  `regiao_ddd` varchar(4) NOT NULL,
  `ESTADO_estado_id` int NOT NULL,
  PRIMARY KEY (`cidade_id`),
  UNIQUE KEY `idx_cidade_unica_estado` (`cidade_nome`, `ESTADO_estado_id`),
  KEY `fk_CIDADE_ESTADO1_idx` (`ESTADO_estado_id`),
  CONSTRAINT `fk_CIDADE_ESTADO1` FOREIGN KEY (`ESTADO_estado_id`) REFERENCES `estado` (`estado_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`endereco`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `endereco`;
CREATE TABLE `endereco` (
  `endereco_id` int NOT NULL AUTO_INCREMENT,
  `rua` varchar(60) NOT NULL,
  `bairro` varchar(45) NOT NULL,
  `numero` varchar(10) NOT NULL,
  `cep` varchar(10) NOT NULL,
  `complemento` varchar(80) DEFAULT NULL,
  `CIDADE_cidade_id` int NOT NULL,
  `PESSOA_pessoa_id` int unsigned NOT NULL,
  `ativo` boolean NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`endereco_id`),
  KEY `fk_ENDERECO_CIDADE1_idx` (`CIDADE_cidade_id`),
  KEY `fk_ENDERECO_PESSOA1_idx` (`PESSOA_pessoa_id`),
  CONSTRAINT `fk_ENDERECO_CIDADE1` FOREIGN KEY (`CIDADE_cidade_id`) REFERENCES `cidade` (`cidade_id`),
  CONSTRAINT `fk_ENDERECO_PESSOA1` FOREIGN KEY (`PESSOA_pessoa_id`) REFERENCES `pessoa` (`pessoa_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`fisica`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `fisica`;
CREATE TABLE `fisica` (
  `pessoa_cpf` varchar(14) NOT NULL,
  `pessoa_documentoValidado` tinyint NOT NULL DEFAULT '0',
  `pessoa_fotoValidada` tinyint NOT NULL DEFAULT '0',
  `PESSOA_pessoa_id` int unsigned NOT NULL,
  PRIMARY KEY (`PESSOA_pessoa_id`),
  UNIQUE KEY `pessoa_cpf_UNIQUE` (`pessoa_cpf`),
  CONSTRAINT `fk_FISICA_PESSOA1` FOREIGN KEY (`PESSOA_pessoa_id`) REFERENCES `pessoa` (`pessoa_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`juridica`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `juridica`;
CREATE TABLE `juridica` (
  `cnpj` varchar(18) NOT NULL,
  `fornecedor_num` int DEFAULT NULL,
  `PESSOA_pessoa_id` int unsigned NOT NULL,
  PRIMARY KEY (`PESSOA_pessoa_id`),
  UNIQUE KEY `pessoa_cnpj_UNIQUE` (`cnpj`),
  CONSTRAINT `fk_JURIDICA_PESSOA1` FOREIGN KEY (`PESSOA_pessoa_id`) REFERENCES `pessoa` (`pessoa_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`categoria_produto`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `categoria_produto`;
CREATE TABLE `categoria_produto` (
  `categoria_id` int unsigned NOT NULL AUTO_INCREMENT,
  `categoria_nome` varchar(255) NOT NULL,
  `ativo` boolean NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`categoria_id`),
  UNIQUE KEY `categoria_nome_UNIQUE` (`categoria_nome`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`marca_produto`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `marca_produto`;
CREATE TABLE `marca_produto` (
  `marca_id` int unsigned NOT NULL AUTO_INCREMENT,
  `marca_nome` varchar(255) NOT NULL,
  `ativo` boolean NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`marca_id`),
  UNIQUE KEY `marca_nome_UNIQUE` (`marca_nome`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`tipo_produto`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tipo_produto`;
CREATE TABLE `tipo_produto` (
  `tipo_id` int unsigned NOT NULL AUTO_INCREMENT,
  `tipo_nome` varchar(255) NOT NULL,
  `ativo` boolean NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`tipo_id`),
  UNIQUE KEY `tipo_nome_UNIQUE` (`tipo_nome`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`produto`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `produto`;
CREATE TABLE `produto` (
  `produto_id` int unsigned NOT NULL AUTO_INCREMENT,
  `MARCA_PRODUTO_marca_id` int unsigned NOT NULL,
  `TIPO_PRODUTO_tipo_id` int unsigned NOT NULL,
  `CATEGORIA_PRODUTO_categoria_id` int unsigned NOT NULL,
  `produto_nome` varchar(255) NOT NULL,
  `produto_status` enum('APROVADO','PENDENTE','REJEITADO') NOT NULL DEFAULT 'PENDENTE',
  `produto_medida` varchar(45) NOT NULL,
  `produto_precoOriginal` decimal(10,2) NOT NULL,
  `motivo` varchar(200) DEFAULT NULL,
  `descricao` varchar(500) DEFAULT NULL,
  `data_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_aprovacao` datetime DEFAULT NULL,
  `data_exclusao` datetime DEFAULT NULL, -- Nome corrigido
  `ativo` boolean NOT NULL DEFAULT TRUE, -- Nome corrigido
  PRIMARY KEY (`produto_id`),
  UNIQUE KEY `idPRODUTO_UNIQUE` (`produto_id`), -- Pode remover, redundante com PK
  KEY `fk_PRODUTO_MARCA_PRODUTO1_idx` (`MARCA_PRODUTO_marca_id`),
  KEY `fk_PRODUTO_TIPO_PRODUTO1_idx` (`TIPO_PRODUTO_tipo_id`),
  KEY `fk_PRODUTO_CATEGORIA_PRODUTO1_idx` (`CATEGORIA_PRODUTO_categoria_id`),
  CONSTRAINT `fk_PRODUTO_CATEGORIA_PRODUTO1` FOREIGN KEY (`CATEGORIA_PRODUTO_categoria_id`) REFERENCES `categoria_produto` (`categoria_id`),
  CONSTRAINT `fk_PRODUTO_MARCA_PRODUTO1` FOREIGN KEY (`MARCA_PRODUTO_marca_id`) REFERENCES `marca_produto` (`marca_id`),
  CONSTRAINT `fk_PRODUTO_TIPO_PRODUTO1` FOREIGN KEY (`TIPO_PRODUTO_tipo_id`) REFERENCES `tipo_produto` (`tipo_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`loteprod`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `loteprod`;
CREATE TABLE `loteprod` (
  `lote_id` int NOT NULL AUTO_INCREMENT,
  `produto_id` int unsigned NOT NULL,
  `lote_codigo` varchar(100) NOT NULL,
  `lote_validade` date NOT NULL,
  `lote_quantidade_inicial` int unsigned NOT NULL,
  `lote_quantidade_atual` int unsigned NOT NULL,
  `data_entrada` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`lote_id`),
  UNIQUE KEY `idx_lote_unico_produto` (`produto_id`, `lote_codigo`),
  KEY `fk_LOTEPROD_PRODUTO1_idx` (`produto_id`),
  CONSTRAINT `fk_LOTEPROD_PRODUTO1` FOREIGN KEY (`produto_id`) REFERENCES `produto` (`produto_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`promocao`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `promocao`;
CREATE TABLE `promocao` (
  `promocao_id` int NOT NULL AUTO_INCREMENT,
  `promocao_descricao` varchar(255) NOT NULL,
  `inicio` datetime NOT NULL,
  `fim` datetime DEFAULT NULL,
  `JURIDICA_PESSOA_pessoa_id` int unsigned NOT NULL,
  `endereco_id` int NOT NULL,
  `ativo` boolean NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`promocao_id`),
  KEY `fk_PROMOCAO_JURIDICA1_idx` (`JURIDICA_PESSOA_pessoa_id`),
  KEY `fk_PROMOCAO_ENDERECO1_idx` (`endereco_id`),
  CONSTRAINT `fk_PROMOCAO_ENDERECO1` FOREIGN KEY (`endereco_id`) REFERENCES `endereco` (`endereco_id`),
  CONSTRAINT `fk_PROMOCAO_JURIDICA1` FOREIGN KEY (`JURIDICA_PESSOA_pessoa_id`) REFERENCES `juridica` (`PESSOA_pessoa_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`item_promocao`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `item_promocao`;
CREATE TABLE `item_promocao` (
  `PROMOCAO_promocao_id` int NOT NULL,
  `LOTEPROD_lote_id` int NOT NULL,
  `itemPromocao_qtde` int NOT NULL,
  `itemPromocao_valor` decimal(10,2) NOT NULL,
  PRIMARY KEY (`PROMOCAO_promocao_id`,`LOTEPROD_lote_id`),
  KEY `fk_ITEM_PROMOCAO_LOTEPROD1_idx` (`LOTEPROD_lote_id`),
  CONSTRAINT `fk_ITEM_PROMOCAO_LOTEPROD1` FOREIGN KEY (`LOTEPROD_lote_id`) REFERENCES `loteprod` (`lote_id`),
  CONSTRAINT `fk_ITEM_PROMOCAO_PROMOCAO1` FOREIGN KEY (`PROMOCAO_promocao_id`) REFERENCES `promocao` (`promocao_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`venda`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `venda`;
CREATE TABLE `venda` (
  `venda_id` int unsigned NOT NULL AUTO_INCREMENT,
  `venda_data` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `venda_total` decimal(10,2) NOT NULL,
  `venda_status` enum('EM ANDAMENTO','CONCLUIDA','CANCELADA') NOT NULL DEFAULT 'EM ANDAMENTO',
  `PROMOCAO_promocao_id` int DEFAULT NULL,
  `PESSOA_pessoa_id` int unsigned NOT NULL,
  `ENDERECO_endereco_id` int NOT NULL,
  PRIMARY KEY (`venda_id`),
  UNIQUE KEY `idVENDA_UNIQUE` (`venda_id`),
  KEY `fk_VENDA_PROMOCAO1_idx` (`PROMOCAO_promocao_id`),
  KEY `fk_VENDA_PESSOA1_idx` (`PESSOA_pessoa_id`),
  KEY `fk_VENDA_ENDERECO1_idx` (`ENDERECO_endereco_id`),
  CONSTRAINT `fk_VENDA_ENDERECO1` FOREIGN KEY (`ENDERECO_endereco_id`) REFERENCES `endereco` (`endereco_id`),
  CONSTRAINT `fk_VENDA_PESSOA1` FOREIGN KEY (`PESSOA_pessoa_id`) REFERENCES `pessoa` (`pessoa_id`),
  CONSTRAINT `fk_VENDA_PROMOCAO1` FOREIGN KEY (`PROMOCAO_promocao_id`) REFERENCES `promocao` (`promocao_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`item_venda`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `item_venda`;
CREATE TABLE `item_venda` (
  `itemVenda_qtde` int NOT NULL,
  `itemVenda_preco` decimal(10,2) NOT NULL,
  `LOTEPROD_lote_id` int NOT NULL,
  `VENDA_venda_id` int unsigned NOT NULL,
  PRIMARY KEY (`LOTEPROD_lote_id`,`VENDA_venda_id`),
  KEY `fk_ITEM_VENDA_LOTEPROD1_idx` (`LOTEPROD_lote_id`),
  KEY `fk_ITEM_VENDA_VENDA1_idx` (`VENDA_venda_id`),
  CONSTRAINT `fk_ITEM_VENDA_LOTEPROD1` FOREIGN KEY (`LOTEPROD_lote_id`) REFERENCES `loteprod` (`lote_id`),
  CONSTRAINT `fk_ITEM_VENDA_VENDA1` FOREIGN KEY (`VENDA_venda_id`) REFERENCES `venda` (`venda_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`devolucao`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `devolucao`;
CREATE TABLE `devolucao` (
  `devolucao_id` int unsigned NOT NULL AUTO_INCREMENT,
  `devolucao_data` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `devolucao_motivo` text NOT NULL,
  `devolucao_status` enum('PENDENTE','ANALISE','APROVADA', 'REJEITADA') NOT NULL DEFAULT 'PENDENTE',
  `VENDA_venda_id` int unsigned NOT NULL,
  PRIMARY KEY (`devolucao_id`),
  UNIQUE KEY `idDEVOLUCAO_UNIQUE` (`devolucao_id`),
  KEY `fk_DEVOLUCAO_VENDA1_idx` (`VENDA_venda_id`),
  CONSTRAINT `fk_DEVOLUCAO_VENDA1` FOREIGN KEY (`VENDA_venda_id`) REFERENCES `venda` (`venda_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`item_devolucao`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `item_devolucao`;
CREATE TABLE `item_devolucao` (
  `DEVOLUCAO_devolucao_id` int unsigned NOT NULL,
  `LOTEPROD_lote_id` int NOT NULL,
  `itemDevolucao_qtde` int NOT NULL,
  PRIMARY KEY (`DEVOLUCAO_devolucao_id`,`LOTEPROD_lote_id`),
  KEY `fk_ITEM_DEVOLUCAO_DEVOLUCAO1_idx` (`DEVOLUCAO_devolucao_id`),
  KEY `fk_ITEM_DEVOLUCAO_LOTEPROD1_idx` (`LOTEPROD_lote_id`),
  CONSTRAINT `fk_ITEM_DEVOLUCAO_DEVOLUCAO1` FOREIGN KEY (`DEVOLUCAO_devolucao_id`) REFERENCES `devolucao` (`devolucao_id`),
  CONSTRAINT `fk_ITEM_DEVOLUCAO_LOTEPROD1` FOREIGN KEY (`LOTEPROD_lote_id`) REFERENCES `loteprod` (`lote_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`perguntas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `perguntas`;
CREATE TABLE `perguntas` (
  `perguntas_id` int unsigned NOT NULL AUTO_INCREMENT,
  `perguntas_descricao` text NOT NULL,
  `ativo` boolean NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`perguntas_id`),
  UNIQUE KEY `idPERGUNTAS_UNIQUE` (`perguntas_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`avaliacao`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `avaliacao`;
CREATE TABLE `avaliacao` (
  `avaliacao_id` int unsigned NOT NULL AUTO_INCREMENT,
  `avaliacao_descricao` text,
  `PROMOCAO_promocao_id` int DEFAULT NULL,
  `VENDA_venda_id` int unsigned DEFAULT NULL,
  `PESSOA_pessoa_id` int unsigned NOT NULL,
  `avaliacao_data` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`avaliacao_id`),
  UNIQUE KEY `idAVALIACAO_UNIQUE` (`avaliacao_id`),
  KEY `fk_AVALIACAO_PROMOCAO1_idx` (`PROMOCAO_promocao_id`),
  KEY `fk_AVALIACAO_PESSOA1_idx` (`PESSOA_pessoa_id`),
  KEY `fk_AVALIACAO_VENDA1_idx` (`VENDA_venda_id`),
  CONSTRAINT `fk_AVALIACAO_PESSOA1` FOREIGN KEY (`PESSOA_pessoa_id`) REFERENCES `pessoa` (`pessoa_id`),
  CONSTRAINT `fk_AVALIACAO_PROMOCAO1` FOREIGN KEY (`PROMOCAO_promocao_id`) REFERENCES `promocao` (`promocao_id`),
  CONSTRAINT `fk_AVALIACAO_VENDA1` FOREIGN KEY (`VENDA_venda_id`) REFERENCES `venda` (`venda_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`nota_avaliacao`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `nota_avaliacao`;
CREATE TABLE `nota_avaliacao` (
  `AVALIACAO_avaliacao_id` int unsigned NOT NULL,
  `PERGUNTAS_perguntas_id` int unsigned NOT NULL,
  `avaliacao_nota` tinyint NOT NULL,
  PRIMARY KEY (`AVALIACAO_avaliacao_id`,`PERGUNTAS_perguntas_id`),
  KEY `fk_AVALIACAO_has_PERGUNTAS_PERGUNTAS1_idx` (`PERGUNTAS_perguntas_id`),
  KEY `fk_AVALIACAO_has_PERGUNTAS_AVALIACAO1_idx` (`AVALIACAO_avaliacao_id`),
  CONSTRAINT `fk_AVALIACAO_has_PERGUNTAS_AVALIACAO1` FOREIGN KEY (`AVALIACAO_avaliacao_id`) REFERENCES `avaliacao` (`avaliacao_id`),
  CONSTRAINT `fk_AVALIACAO_has_PERGUNTAS_PERGUNTAS1` FOREIGN KEY (`PERGUNTAS_perguntas_id`) REFERENCES `perguntas` (`perguntas_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- INSERTS DE EXEMPLO (AJUSTADOS)
-- -----------------------------------------------------

INSERT INTO PESSOA
  (pessoa_nome, pessoa_email, pessoa_telefone, pessoa_tipo, pessoa_login, pessoa_senha, pessoa_status, data_criacao)
VALUES
  ('Admin User', 'admin@email.com', '11999999999', 'Admin', '1', '$2a$11$JKTbvCrhA99mX44.spT2J.BrXvgVG1uLKvlMDbM294oD/Zslvz9FW', 1, CURDATE()); -- Senha é 'admin'

-- Inserir dados base (garantindo que 'ativo' está incluído onde necessário)
-- Use INSERT IGNORE para evitar erro se já existirem com mesmo nome/ID
INSERT IGNORE INTO estado (estado_id, estado_nome, estado_sigla) VALUES (1,'São Paulo','SP'), (2,'Santa Catarina','SC');
INSERT IGNORE INTO cidade (cidade_id, cidade_nome, regiao_ddd, ESTADO_estado_id) VALUES (2,'Pirapozinho','18',1), (3,'Presidente Prudente','18',1), (4,'Florianópolis','48',2);

INSERT IGNORE INTO tipo_produto (tipo_id, tipo_nome, ativo) VALUES (1, 'Barra de Chocolate', TRUE);
INSERT IGNORE INTO categoria_produto (categoria_id, categoria_nome, ativo) VALUES (1, 'Chocolates', TRUE),(3,'Bebidas', TRUE);
INSERT IGNORE INTO marca_produto (marca_id, marca_nome, ativo) VALUES (1, 'Garoto', TRUE);

-- Inserir Produto (corrigido nome coluna 'ativo' e 'data_exclusao')
INSERT INTO PRODUTO (
    MARCA_PRODUTO_marca_id,
    TIPO_PRODUTO_tipo_id,
    CATEGORIA_PRODUTO_categoria_id,
    produto_nome,
    produto_status,
    produto_medida,
    produto_precoOriginal,
    motivo,
    descricao,
    data_registro,
    data_aprovacao,
    data_exclusao,
    ativo
) VALUES (
    1, -- MARCA_PRODUTO_marca_id (Garoto)
    1, -- TIPO_PRODUTO_tipo_id (Barra de Chocolate)
    1, -- CATEGORIA_PRODUTO_categoria_id (Chocolates)
    'Barra Garoto Teste', -- produto_nome
    'PENDENTE', -- produto_status
    '90g', -- produto_medida
    5.99, -- produto_precoOriginal
    NULL, -- motivo
    'Barra de chocolate ao leite Garoto 90g', -- descricao
    NOW(), -- data_registro (Usar NOW())
    NULL, -- data_aprovacao
    NULL, -- data_exclusao
    TRUE -- ativo (TRUE ou 1)
);

INSERT INTO PESSOA
  (pessoa_nome, pessoa_email, pessoa_telefone, pessoa_tipo, pessoa_login, pessoa_senha, pessoa_status, data_criacao) 
VALUES ('Teste', 'testess@gmail.com', '18815487354', 'Fisica', '23125425484', '$2b$10$zv.Dvfb8PFiKImcWsSUwKO0V.9KkhT8MjuztOTzJWKpDpej9Gmk8W', '1', '2025-04-24');

INSERT INTO PESSOA
  (pessoa_nome, pessoa_email, pessoa_telefone, pessoa_tipo, pessoa_login, pessoa_senha, pessoa_status, data_criacao)
VALUES  ('Capeta', 'capetinha@hotmail.com', '6666666666', 'Fisica', '66666666666', '$2b$10$neYFNfb0HKSwqzYhLyIUS.Sjgo5g86oCXEh8fuvfEqFO9p36NS9xm', '0', '2025-04-24');

INSERT INTO PESSOA
  (pessoa_nome, pessoa_email, pessoa_telefone, pessoa_tipo, pessoa_login, pessoa_senha, pessoa_status, data_criacao)
VALUES ('Gabryel', 'gablerlivros@gmail.com', '18998082383', 'Fisica', '47806728806', '$2b$10$d2YsKYhI14q.WyzrUBtgReQ3IzIIFUd6aALTcftDlwIIrebTdGxZi', '1', '2025-04-24');

INSERT INTO PESSOA
  (pessoa_nome, pessoa_email, pessoa_telefone, pessoa_tipo, pessoa_login, pessoa_senha, pessoa_status, data_criacao)
VALUES ('Hajjajsh', 'teste@gmail.com', '81545845456', 'Fisica', '11111111111', '$2b$10$k61YOrw8z5m4HJTfbXGAreAKyheB1q4EB4Uz/az97SYDqZgEBh.B.', '1', '2025-04-24');

INSERT INTO PESSOA
  (pessoa_nome, pessoa_email, pessoa_telefone, pessoa_tipo, pessoa_login, pessoa_senha, pessoa_status, data_criacao)
VALUES ('Francisco Maracci', 'fvmaracci@gmail.com', '18997442619', 'Fisica', '30922325855', '$2b$10$R56bBKp.Mr6u2TeHQ3A1P.kf57dDksmfwc0D.XRngRGySd9nl.po2', '1', '2025-04-24');

INSERT INTO FISICA
  (pessoa_cpf, foto_selfie_path, foto_documento_path, PESSOA_pessoa_id)
VALUES('66666666666', 'fotosUsuarios/8-selfie-1745499150683.jpg', 'fotosUsuarios/8-documento-1745499151063.jpg', '2');

INSERT INTO FISICA
  (pessoa_cpf, foto_selfie_path, foto_documento_path, PESSOA_pessoa_id)
VALUES('47806728806', 'fotosUsuarios/9-selfie-1745500237863.jpg', 'fotosUsuarios/9-documento-1745500238288.jpg', '3');

INSERT INTO FISICA
  (pessoa_cpf, foto_selfie_path, foto_documento_path, PESSOA_pessoa_id)
VALUES('11111111111', 'fotosUsuarios/10-selfie-1745500909344.jpg', 'fotosUsuarios/10-documento-1745500909589.jpg', '4');

INSERT INTO FISICA
  (pessoa_cpf, foto_selfie_path, foto_documento_path, PESSOA_pessoa_id)
VALUES('30922325855', 'fotosUsuarios/11-selfie-1745503965164.jpeg', 'fotosUsuarios/11-documento-1745503965323.jpeg', '5');