-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema ConsumaJaDB
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema ConsumaJaDB
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `ConsumaJaDB` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `ConsumaJaDB` ;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`pessoa`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`PESSOA` (
  `pessoa_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pessoa_nome` VARCHAR(255) NOT NULL,
  `pessoa_email` VARCHAR(255) NOT NULL,
  `pessoa_telefone` VARCHAR(20) NULL DEFAULT NULL,
  `pessoa_tipo` ENUM('Fisica', 'Juridica', 'Admin') NOT NULL,
  `pessoa_login` VARCHAR(100) NOT NULL,
  `pessoa_senha` VARCHAR(100) NOT NULL,
  `pessoa_status` TINYINT NOT NULL,
  `data_criacao` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`pessoa_id`),
  UNIQUE INDEX `idPESSOA_UNIQUE` (`pessoa_id` ASC) VISIBLE,
  UNIQUE INDEX `pessoa_email_UNIQUE` (`pessoa_email` ASC) VISIBLE,
  UNIQUE INDEX `pessoa_login_UNIQUE` (`pessoa_login` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 1000
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`estado`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`ESTADO` (
  `estado_id` INT NOT NULL AUTO_INCREMENT,
  `estado_nome` VARCHAR(45) NOT NULL,
  `estado_sigla` VARCHAR(3) NOT NULL,
  PRIMARY KEY (`estado_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`cidade`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`CIDADE` (
  `cidade_id` INT NOT NULL AUTO_INCREMENT,
  `cidade_nome` VARCHAR(45) NULL DEFAULT NULL,
  `regiao_ddd` VARCHAR(4) NOT NULL,
  `ESTADO_estado_id` INT NOT NULL,
  PRIMARY KEY (`cidade_id`),
  UNIQUE INDEX `idx_cidade_unica_estado` (`cidade_nome` ASC, `ESTADO_estado_id` ASC) VISIBLE,
  INDEX `fk_CIDADE_ESTADO1_idx` (`ESTADO_estado_id` ASC) VISIBLE,
  CONSTRAINT `fk_CIDADE_ESTADO1`
    FOREIGN KEY (`ESTADO_estado_id`)
    REFERENCES `ConsumaJaDB`.`ESTADO` (`estado_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


--- -----------------------------------------------------
--- Table `ConsumaJaDB`.`SESSOES_USUARIO`
--- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`ENDERECO` (
  `endereco_id` INT NOT NULL AUTO_INCREMENT,
  `rua` VARCHAR(60) NOT NULL,
  `bairro` VARCHAR(45) NOT NULL,
  `numero` VARCHAR(10) NOT NULL,
  `cep` VARCHAR(10) NOT NULL,
  `complemento` VARCHAR(80) NULL DEFAULT NULL,
  `CIDADE_cidade_id` INT NOT NULL,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`endereco_id`),
  INDEX `fk_ENDERECO_CIDADE1_idx` (`CIDADE_cidade_id`),
  INDEX `fk_ENDERECO_PESSOA1_idx` (`PESSOA_pessoa_id`),
  CONSTRAINT `fk_ENDERECO_CIDADE1`
    FOREIGN KEY (`CIDADE_cidade_id`)
    REFERENCES `ConsumaJaDB`.`CIDADE` (`cidade_id`),
  CONSTRAINT `fk_ENDERECO_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`juridica`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`JURIDICA` (
  `cnpj` VARCHAR(18) NOT NULL,
  `fornecedor_num` INT NULL DEFAULT NULL,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  `taxa_entrega` DECIMAL(10,2) NULL DEFAULT NULL,
  `parcelas_config` JSON NULL DEFAULT NULL,
  PRIMARY KEY (`PESSOA_pessoa_id`),
  UNIQUE INDEX `pessoa_cnpj_UNIQUE` (`cnpj` ASC) VISIBLE,
  CONSTRAINT `fk_JURIDICA_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`promocao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`PROMOCAO` (
  `promocao_id` INT NOT NULL AUTO_INCREMENT,
  `promocao_descricao` VARCHAR(255) NOT NULL,
  `inicio` DATETIME NOT NULL,
  `fim` DATETIME NULL DEFAULT NULL,
  `JURIDICA_PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  `endereco_id` INT NOT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`promocao_id`),
  INDEX `fk_PROMOCAO_JURIDICA1_idx` (`JURIDICA_PESSOA_pessoa_id` ASC) VISIBLE,
  INDEX `fk_PROMOCAO_ENDERECO1_idx` (`endereco_id` ASC) VISIBLE,
  CONSTRAINT `fk_PROMOCAO_ENDERECO1`
    FOREIGN KEY (`endereco_id`)
    REFERENCES `ConsumaJaDB`.`ENDERECO` (`endereco_id`),
  CONSTRAINT `fk_PROMOCAO_JURIDICA1`
    FOREIGN KEY (`JURIDICA_PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`JURIDICA` (`PESSOA_pessoa_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`venda`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`VENDA` (
  `venda_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `venda_data` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `venda_total` DECIMAL(10,2) NOT NULL,
  `venda_status` ENUM('EM ANDAMENTO', 'CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'EM ANDAMENTO',
  `venda_etapa` ENUM('SEPARANDO_PRODUTOS', 'LOGISTICA_TRANSPORTADORA', 'PRODUTOS_A_CAMINHO', 'PRODUTOS_ENTREGUES') NOT NULL DEFAULT 'SEPARANDO_PRODUTOS',
  `PROMOCAO_promocao_id` INT NULL DEFAULT NULL,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  `fornecedor_pessoa_id` INT UNSIGNED NOT NULL,
  `ENDERECO_endereco_id` INT NULL DEFAULT NULL,
  `retirada_no_fornecedor` TINYINT(1) NOT NULL DEFAULT '0',
  `metodo_pagamento` VARCHAR(50) NULL DEFAULT NULL,
  `parcelas` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `detalhes_pagamento` JSON NULL DEFAULT NULL,
  PRIMARY KEY (`venda_id`),
  UNIQUE INDEX `idVENDA_UNIQUE` (`venda_id` ASC) VISIBLE,
  INDEX `fk_VENDA_PROMOCAO1_idx` (`PROMOCAO_promocao_id` ASC) VISIBLE,
  INDEX `fk_VENDA_PESSOA1_idx` (`PESSOA_pessoa_id` ASC) VISIBLE,
  INDEX `fk_VENDA_FORNECEDOR_idx` (`fornecedor_pessoa_id` ASC) VISIBLE,
  INDEX `fk_VENDA_ENDERECO1_idx` (`ENDERECO_endereco_id` ASC) VISIBLE,
  CONSTRAINT `fk_VENDA_ENDERECO1`
    FOREIGN KEY (`ENDERECO_endereco_id`)
    REFERENCES `ConsumaJaDB`.`ENDERECO` (`endereco_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_VENDA_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_VENDA_FORNECEDOR`
    FOREIGN KEY (`fornecedor_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`JURIDICA` (`PESSOA_pessoa_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_VENDA_PROMOCAO1`
    FOREIGN KEY (`PROMOCAO_promocao_id`)
    REFERENCES `ConsumaJaDB`.`PROMOCAO` (`promocao_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- Histórico de pagamentos
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`HISTORICO_PAGAMENTOS` (
  `historico_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `VENDA_venda_id` INT UNSIGNED NOT NULL,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  `metodo` VARCHAR(50) NOT NULL,
  `detalhes` JSON NULL DEFAULT NULL,
  `valor` DECIMAL(10,2) NOT NULL,
  `data` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`historico_id`),
  INDEX `fk_HIST_PAG_VENDA_idx` (`VENDA_venda_id` ASC) VISIBLE,
  CONSTRAINT `fk_HIST_PAG_VENDA`
    FOREIGN KEY (`VENDA_venda_id`)
    REFERENCES `ConsumaJaDB`.`VENDA` (`venda_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Notificações para usuários
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`NOTIFICACAO` (
  `notificacao_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `mensagem` TEXT NOT NULL,
  `notificacao_tipo` ENUM('VENDA_NOVA', 'VENDA_ATUALIZADA', 'VENDA_CONCLUIDA', 'VENDA_NOVA_FORNECEDOR', 'VENDA_ETAPA_ATUALIZADA', 'VENDA_RECLAMACAO', 'VENDA_RECLAMACAO_ATUALIZADA', 'VENDA_AVALIACAO') NOT NULL DEFAULT 'VENDA_NOVA',
  `destinatario_tipo` ENUM('CLIENTE', 'FORNECEDOR', 'ADMIN') NOT NULL DEFAULT 'CLIENTE',
  `venda_id` INT UNSIGNED NULL DEFAULT NULL,
  `rota_destino` VARCHAR(120) NULL DEFAULT NULL,
  `payload` JSON NULL DEFAULT NULL,
  `lida` TINYINT(1) NOT NULL DEFAULT 0,
  `data_criacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notificacao_id`),
  INDEX `fk_NOT_PESSOA_idx` (`PESSOA_pessoa_id` ASC) VISIBLE,
  INDEX `fk_NOT_VENDA_idx` (`venda_id` ASC) VISIBLE,
  CONSTRAINT `fk_NOT_PESSOA`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_NOT_VENDA`
    FOREIGN KEY (`venda_id`)
    REFERENCES `ConsumaJaDB`.`VENDA` (`venda_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`VENDA_ETAPA_HISTORICO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`VENDA_ETAPA_HISTORICO` (
  `historico_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `VENDA_venda_id` INT UNSIGNED NOT NULL,
  `etapa` ENUM('SEPARANDO_PRODUTOS', 'LOGISTICA_TRANSPORTADORA', 'PRODUTOS_A_CAMINHO', 'PRODUTOS_ENTREGUES') NOT NULL,
  `descricao` VARCHAR(255) NULL DEFAULT NULL,
  `registrado_por` INT UNSIGNED NULL DEFAULT NULL,
  `data_registro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`historico_id`),
  INDEX `fk_HIST_VENDA_idx` (`VENDA_venda_id` ASC) VISIBLE,
  CONSTRAINT `fk_HIST_VENDA`
    FOREIGN KEY (`VENDA_venda_id`)
    REFERENCES `ConsumaJaDB`.`VENDA` (`venda_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_HIST_PESSOA`
    FOREIGN KEY (`registrado_por`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`avaliacao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`AVALIACAO` (
  `avaliacao_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `avaliacao_descricao` TEXT NULL DEFAULT NULL,
  `PROMOCAO_promocao_id` INT NULL DEFAULT NULL,
  `VENDA_venda_id` INT UNSIGNED NULL DEFAULT NULL,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  `avaliacao_data` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`avaliacao_id`),
  UNIQUE INDEX `idAVALIACAO_UNIQUE` (`avaliacao_id` ASC) VISIBLE,
  INDEX `fk_AVALIACAO_PROMOCAO1_idx` (`PROMOCAO_promocao_id` ASC) VISIBLE,
  INDEX `fk_AVALIACAO_PESSOA1_idx` (`PESSOA_pessoa_id` ASC) VISIBLE,
  INDEX `fk_AVALIACAO_VENDA1_idx` (`VENDA_venda_id` ASC) VISIBLE,
  CONSTRAINT `fk_AVALIACAO_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`),
  CONSTRAINT `fk_AVALIACAO_PROMOCAO1`
    FOREIGN KEY (`PROMOCAO_promocao_id`)
    REFERENCES `ConsumaJaDB`.`PROMOCAO` (`promocao_id`),
  CONSTRAINT `fk_AVALIACAO_VENDA1`
    FOREIGN KEY (`VENDA_venda_id`)
    REFERENCES `ConsumaJaDB`.`VENDA` (`venda_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`categoria_produto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`CATEGORIA_PRODUTO` (
  `categoria_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `categoria_nome` VARCHAR(255) NOT NULL,
  `fornecedor_pessoa_id` INT UNSIGNED NULL DEFAULT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`categoria_id`),
  UNIQUE INDEX `idx_categoria_fornecedor_nome` (`fornecedor_pessoa_id` ASC, `categoria_nome` ASC) VISIBLE,
  INDEX `fk_CATEGORIA_FORNECEDOR_idx` (`fornecedor_pessoa_id` ASC) VISIBLE,
  CONSTRAINT `fk_CATEGORIA_FORNECEDOR`
    FOREIGN KEY (`fornecedor_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`JURIDICA` (`PESSOA_pessoa_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`devolucao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`DEVOLUCAO` (
  `devolucao_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `devolucao_data` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `devolucao_motivo` TEXT NOT NULL,
  `devolucao_status` ENUM('PENDENTE', 'ANALISE', 'APROVADA', 'REJEITADA') NOT NULL DEFAULT 'PENDENTE',
  `VENDA_venda_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`devolucao_id`),
  UNIQUE INDEX `idDEVOLUCAO_UNIQUE` (`devolucao_id` ASC) VISIBLE,
  INDEX `fk_DEVOLUCAO_VENDA1_idx` (`VENDA_venda_id` ASC) VISIBLE,
  CONSTRAINT `fk_DEVOLUCAO_VENDA1`
    FOREIGN KEY (`VENDA_venda_id`)
    REFERENCES `ConsumaJaDB`.`VENDA` (`venda_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`fisica`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`FISICA` (
  `pessoa_cpf` VARCHAR(14) NOT NULL,
  `pessoa_documentoValidado` TINYINT NOT NULL DEFAULT '0',
  `pessoa_fotoValidada` TINYINT NOT NULL DEFAULT '0',
  `foto_selfie_path` VARCHAR(512) NULL DEFAULT NULL COMMENT 'Caminho relativo da foto da selfie no servidor',
  `foto_documento_path` VARCHAR(512) NULL DEFAULT NULL COMMENT 'Caminho relativo da foto do documento no servidor',
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`PESSOA_pessoa_id`),
  UNIQUE INDEX `pessoa_cpf_UNIQUE` (`pessoa_cpf` ASC) VISIBLE,
  CONSTRAINT `fk_FISICA_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`marca_produto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`MARCA_PRODUTO` (
  `marca_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `marca_nome` VARCHAR(255) NOT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`marca_id`),
  UNIQUE INDEX `marca_nome_UNIQUE` (`marca_nome` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`tipo_produto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`TIPO_PRODUTO` (
  `tipo_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tipo_nome` VARCHAR(255) NOT NULL,
  `fornecedor_pessoa_id` INT UNSIGNED NULL DEFAULT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`tipo_id`),
  UNIQUE INDEX `idx_tipo_fornecedor_nome` (`fornecedor_pessoa_id` ASC, `tipo_nome` ASC) VISIBLE,
  INDEX `fk_TIPO_FORNECEDOR_idx` (`fornecedor_pessoa_id` ASC) VISIBLE,
  CONSTRAINT `fk_TIPO_FORNECEDOR`
    FOREIGN KEY (`fornecedor_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`JURIDICA` (`PESSOA_pessoa_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`produto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`PRODUTO` (
  `produto_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `MARCA_PRODUTO_marca_id` INT UNSIGNED NOT NULL,
  `TIPO_PRODUTO_tipo_id` INT UNSIGNED NOT NULL,
  `CATEGORIA_PRODUTO_categoria_id` INT UNSIGNED NOT NULL,
  `fornecedor_pessoa_id` INT UNSIGNED NOT NULL,
  `produto_nome` VARCHAR(255) NOT NULL,
  `produto_status` ENUM('APROVADO', 'PENDENTE', 'REJEITADO') NOT NULL DEFAULT 'PENDENTE',
  `produto_medida` VARCHAR(45) NOT NULL,
  `produto_precoOriginal` DECIMAL(10,2) NOT NULL,
  `motivo` VARCHAR(200) NULL DEFAULT NULL,
  `descricao` VARCHAR(500) NULL DEFAULT NULL,
  `data_registro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_aprovacao` DATETIME NULL DEFAULT NULL,
  `data_exclusao` DATETIME NULL DEFAULT NULL,
  `produto_imagem_url` VARCHAR(512) NULL DEFAULT NULL COMMENT 'URL da imagem principal do produto',
  `ativo` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`produto_id`),
  UNIQUE INDEX `idPRODUTO_UNIQUE` (`produto_id` ASC) VISIBLE,
  INDEX `fk_PRODUTO_MARCA_PRODUTO1_idx` (`MARCA_PRODUTO_marca_id` ASC) VISIBLE,
  INDEX `fk_PRODUTO_TIPO_PRODUTO1_idx` (`TIPO_PRODUTO_tipo_id` ASC) VISIBLE,
  INDEX `fk_PRODUTO_CATEGORIA_PRODUTO1_idx` (`CATEGORIA_PRODUTO_categoria_id` ASC) VISIBLE,
  INDEX `fk_PRODUTO_FORNECEDOR_idx` (`fornecedor_pessoa_id` ASC) VISIBLE,
  CONSTRAINT `fk_PRODUTO_CATEGORIA_PRODUTO1`
    FOREIGN KEY (`CATEGORIA_PRODUTO_categoria_id`)
    REFERENCES `ConsumaJaDB`.`CATEGORIA_PRODUTO` (`categoria_id`),
  CONSTRAINT `fk_PRODUTO_MARCA_PRODUTO1`
    FOREIGN KEY (`MARCA_PRODUTO_marca_id`)
    REFERENCES `ConsumaJaDB`.`MARCA_PRODUTO` (`marca_id`),
  CONSTRAINT `fk_PRODUTO_TIPO_PRODUTO1`
    FOREIGN KEY (`TIPO_PRODUTO_tipo_id`)
    REFERENCES `ConsumaJaDB`.`TIPO_PRODUTO` (`tipo_id`),
  CONSTRAINT `fk_PRODUTO_FORNECEDOR`
    FOREIGN KEY (`fornecedor_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`JURIDICA` (`PESSOA_pessoa_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`loteprod`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`LOTEPROD` (
  `lote_id` INT NOT NULL AUTO_INCREMENT,
  `produto_id` INT UNSIGNED NOT NULL,
  `fornecedor_pessoa_id` INT UNSIGNED NOT NULL,
  `lote_codigo` VARCHAR(100) NOT NULL,
  `lote_validade` DATE NOT NULL,
  `lote_quantidade_inicial` INT UNSIGNED NOT NULL,
  `lote_quantidade_atual` INT UNSIGNED NOT NULL,
  `data_entrada` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ativo` TINYINT NOT NULL DEFAULT '1',
  PRIMARY KEY (`lote_id`),
  UNIQUE INDEX `idx_lote_unico_produto` (`produto_id` ASC, `lote_codigo` ASC) VISIBLE,
  INDEX `fk_LOTEPROD_PRODUTO1_idx` (`produto_id` ASC) VISIBLE,
  INDEX `fk_LOTEPROD_FORNECEDOR_idx` (`fornecedor_pessoa_id` ASC) VISIBLE,
  CONSTRAINT `fk_LOTEPROD_PRODUTO1`
    FOREIGN KEY (`produto_id`)
    REFERENCES `ConsumaJaDB`.`PRODUTO` (`produto_id`),
  CONSTRAINT `fk_LOTEPROD_FORNECEDOR`
    FOREIGN KEY (`fornecedor_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`JURIDICA` (`PESSOA_pessoa_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`item_devolucao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`ITEM_DEVOLUCAO` (
  `DEVOLUCAO_devolucao_id` INT UNSIGNED NOT NULL,
  `LOTEPROD_lote_id` INT NOT NULL,
  `itemDevolucao_qtde` INT NOT NULL,
  PRIMARY KEY (`DEVOLUCAO_devolucao_id`, `LOTEPROD_lote_id`),
  INDEX `fk_ITEM_DEVOLUCAO_DEVOLUCAO1_idx` (`DEVOLUCAO_devolucao_id` ASC) VISIBLE,
  INDEX `fk_ITEM_DEVOLUCAO_LOTEPROD1_idx` (`LOTEPROD_lote_id` ASC) VISIBLE,
  CONSTRAINT `fk_ITEM_DEVOLUCAO_DEVOLUCAO1`
    FOREIGN KEY (`DEVOLUCAO_devolucao_id`)
    REFERENCES `ConsumaJaDB`.`DEVOLUCAO` (`devolucao_id`),
  CONSTRAINT `fk_ITEM_DEVOLUCAO_LOTEPROD1`
    FOREIGN KEY (`LOTEPROD_lote_id`)
    REFERENCES `ConsumaJaDB`.`LOTEPROD` (`lote_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`item_promocao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`ITEM_PROMOCAO` (
  `PROMOCAO_promocao_id` INT NOT NULL,
  `LOTEPROD_lote_id` INT NOT NULL,
  `itemPromocao_qtde` INT NOT NULL,
  `itemPromocao_valor` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`PROMOCAO_promocao_id`, `LOTEPROD_lote_id`),
  INDEX `fk_ITEM_PROMOCAO_LOTEPROD1_idx` (`LOTEPROD_lote_id` ASC) VISIBLE,
  CONSTRAINT `fk_ITEM_PROMOCAO_LOTEPROD1`
    FOREIGN KEY (`LOTEPROD_lote_id`)
    REFERENCES `ConsumaJaDB`.`LOTEPROD` (`lote_id`),
  CONSTRAINT `fk_ITEM_PROMOCAO_PROMOCAO1`
    FOREIGN KEY (`PROMOCAO_promocao_id`)
    REFERENCES `ConsumaJaDB`.`PROMOCAO` (`promocao_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`item_venda`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`ITEM_VENDA` (
  `itemVenda_qtde` INT NOT NULL,
  `itemVenda_preco` DECIMAL(10,2) NOT NULL,
  `LOTEPROD_lote_id` INT NOT NULL,
  `VENDA_venda_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`LOTEPROD_lote_id`, `VENDA_venda_id`),
  INDEX `fk_ITEM_VENDA_LOTEPROD1_idx` (`LOTEPROD_lote_id` ASC) VISIBLE,
  INDEX `fk_ITEM_VENDA_VENDA1_idx` (`VENDA_venda_id` ASC) VISIBLE,
  CONSTRAINT `fk_ITEM_VENDA_LOTEPROD1`
    FOREIGN KEY (`LOTEPROD_lote_id`)
    REFERENCES `ConsumaJaDB`.`LOTEPROD` (`lote_id`),
  CONSTRAINT `fk_ITEM_VENDA_VENDA1`
    FOREIGN KEY (`VENDA_venda_id`)
    REFERENCES `ConsumaJaDB`.`VENDA` (`venda_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`perguntas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`PERGUNTAS` (
  `perguntas_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `perguntas_descricao` TEXT NOT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`perguntas_id`),
  UNIQUE INDEX `idPERGUNTAS_UNIQUE` (`perguntas_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`nota_avaliacao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`NOTA_AVALIACAO` (
  `AVALIACAO_avaliacao_id` INT UNSIGNED NOT NULL,
  `PERGUNTAS_perguntas_id` INT UNSIGNED NOT NULL,
  `avaliacao_nota` TINYINT NOT NULL,
  PRIMARY KEY (`AVALIACAO_avaliacao_id`, `PERGUNTAS_perguntas_id`),
  INDEX `fk_AVALIACAO_has_PERGUNTAS_PERGUNTAS1_idx` (`PERGUNTAS_perguntas_id` ASC) VISIBLE,
  INDEX `fk_AVALIACAO_has_PERGUNTAS_AVALIACAO1_idx` (`AVALIACAO_avaliacao_id` ASC) VISIBLE,
  CONSTRAINT `fk_AVALIACAO_has_PERGUNTAS_AVALIACAO1`
    FOREIGN KEY (`AVALIACAO_avaliacao_id`)
    REFERENCES `ConsumaJaDB`.`AVALIACAO` (`avaliacao_id`),
  CONSTRAINT `fk_AVALIACAO_has_PERGUNTAS_PERGUNTAS1`
    FOREIGN KEY (`PERGUNTAS_perguntas_id`)
    REFERENCES `ConsumaJaDB`.`PERGUNTAS` (`perguntas_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;