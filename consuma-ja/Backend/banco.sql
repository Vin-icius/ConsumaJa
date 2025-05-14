-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema consumajadb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema consumajadb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `consumajadb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `consumajadb` ;

-- -----------------------------------------------------
-- Table `consumajadb`.`pessoa`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`pessoa` (
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
AUTO_INCREMENT = 15
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`estado`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`estado` (
  `estado_id` INT NOT NULL AUTO_INCREMENT,
  `estado_nome` VARCHAR(45) NOT NULL,
  `estado_sigla` VARCHAR(3) NOT NULL,
  PRIMARY KEY (`estado_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`cidade`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`cidade` (
  `cidade_id` INT NOT NULL AUTO_INCREMENT,
  `cidade_nome` VARCHAR(45) NULL DEFAULT NULL,
  `regiao_ddd` VARCHAR(4) NOT NULL,
  `ESTADO_estado_id` INT NOT NULL,
  PRIMARY KEY (`cidade_id`),
  UNIQUE INDEX `idx_cidade_unica_estado` (`cidade_nome` ASC, `ESTADO_estado_id` ASC) VISIBLE,
  INDEX `fk_CIDADE_ESTADO1_idx` (`ESTADO_estado_id` ASC) VISIBLE,
  CONSTRAINT `fk_CIDADE_ESTADO1`
    FOREIGN KEY (`ESTADO_estado_id`)
    REFERENCES `consumajadb`.`estado` (`estado_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`endereco`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`endereco` (
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
  INDEX `fk_ENDERECO_CIDADE1_idx` (`CIDADE_cidade_id` ASC) VISIBLE,
  INDEX `fk_ENDERECO_PESSOA1_idx` (`PESSOA_pessoa_id` ASC) VISIBLE,
  CONSTRAINT `fk_ENDERECO_CIDADE1`
    FOREIGN KEY (`CIDADE_cidade_id`)
    REFERENCES `consumajadb`.`cidade` (`cidade_id`),
  CONSTRAINT `fk_ENDERECO_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `consumajadb`.`pessoa` (`pessoa_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`juridica`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`juridica` (
  `cnpj` VARCHAR(18) NOT NULL,
  `fornecedor_num` INT NULL DEFAULT NULL,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`PESSOA_pessoa_id`),
  UNIQUE INDEX `pessoa_cnpj_UNIQUE` (`cnpj` ASC) VISIBLE,
  CONSTRAINT `fk_JURIDICA_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `consumajadb`.`pessoa` (`pessoa_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`promocao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`promocao` (
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
    REFERENCES `consumajadb`.`endereco` (`endereco_id`),
  CONSTRAINT `fk_PROMOCAO_JURIDICA1`
    FOREIGN KEY (`JURIDICA_PESSOA_pessoa_id`)
    REFERENCES `consumajadb`.`juridica` (`PESSOA_pessoa_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 11
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`venda`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`venda` (
  `venda_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `venda_data` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `venda_total` DECIMAL(10,2) NOT NULL,
  `venda_status` ENUM('EM ANDAMENTO', 'CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'EM ANDAMENTO',
  `PROMOCAO_promocao_id` INT NULL DEFAULT NULL,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  `ENDERECO_endereco_id` INT NOT NULL,
  PRIMARY KEY (`venda_id`),
  UNIQUE INDEX `idVENDA_UNIQUE` (`venda_id` ASC) VISIBLE,
  INDEX `fk_VENDA_PROMOCAO1_idx` (`PROMOCAO_promocao_id` ASC) VISIBLE,
  INDEX `fk_VENDA_PESSOA1_idx` (`PESSOA_pessoa_id` ASC) VISIBLE,
  INDEX `fk_VENDA_ENDERECO1_idx` (`ENDERECO_endereco_id` ASC) VISIBLE,
  CONSTRAINT `fk_VENDA_ENDERECO1`
    FOREIGN KEY (`ENDERECO_endereco_id`)
    REFERENCES `consumajadb`.`endereco` (`endereco_id`),
  CONSTRAINT `fk_VENDA_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `consumajadb`.`pessoa` (`pessoa_id`),
  CONSTRAINT `fk_VENDA_PROMOCAO1`
    FOREIGN KEY (`PROMOCAO_promocao_id`)
    REFERENCES `consumajadb`.`promocao` (`promocao_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`avaliacao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`avaliacao` (
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
    REFERENCES `consumajadb`.`pessoa` (`pessoa_id`),
  CONSTRAINT `fk_AVALIACAO_PROMOCAO1`
    FOREIGN KEY (`PROMOCAO_promocao_id`)
    REFERENCES `consumajadb`.`promocao` (`promocao_id`),
  CONSTRAINT `fk_AVALIACAO_VENDA1`
    FOREIGN KEY (`VENDA_venda_id`)
    REFERENCES `consumajadb`.`venda` (`venda_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`categoria_produto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`categoria_produto` (
  `categoria_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `categoria_nome` VARCHAR(255) NOT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`categoria_id`),
  UNIQUE INDEX `categoria_nome_UNIQUE` (`categoria_nome` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`devolucao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`devolucao` (
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
    REFERENCES `consumajadb`.`venda` (`venda_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`fisica`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`fisica` (
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
    REFERENCES `consumajadb`.`pessoa` (`pessoa_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`marca_produto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`marca_produto` (
  `marca_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `marca_nome` VARCHAR(255) NOT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`marca_id`),
  UNIQUE INDEX `marca_nome_UNIQUE` (`marca_nome` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 8
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`tipo_produto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`tipo_produto` (
  `tipo_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tipo_nome` VARCHAR(255) NOT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`tipo_id`),
  UNIQUE INDEX `tipo_nome_UNIQUE` (`tipo_nome` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 7
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`produto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`produto` (
  `produto_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `MARCA_PRODUTO_marca_id` INT UNSIGNED NOT NULL,
  `TIPO_PRODUTO_tipo_id` INT UNSIGNED NOT NULL,
  `CATEGORIA_PRODUTO_categoria_id` INT UNSIGNED NOT NULL,
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
  CONSTRAINT `fk_PRODUTO_CATEGORIA_PRODUTO1`
    FOREIGN KEY (`CATEGORIA_PRODUTO_categoria_id`)
    REFERENCES `consumajadb`.`categoria_produto` (`categoria_id`),
  CONSTRAINT `fk_PRODUTO_MARCA_PRODUTO1`
    FOREIGN KEY (`MARCA_PRODUTO_marca_id`)
    REFERENCES `consumajadb`.`marca_produto` (`marca_id`),
  CONSTRAINT `fk_PRODUTO_TIPO_PRODUTO1`
    FOREIGN KEY (`TIPO_PRODUTO_tipo_id`)
    REFERENCES `consumajadb`.`tipo_produto` (`tipo_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`loteprod`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`loteprod` (
  `lote_id` INT NOT NULL AUTO_INCREMENT,
  `produto_id` INT UNSIGNED NOT NULL,
  `lote_codigo` VARCHAR(100) NOT NULL,
  `lote_validade` DATE NOT NULL,
  `lote_quantidade_inicial` INT UNSIGNED NOT NULL,
  `lote_quantidade_atual` INT UNSIGNED NOT NULL,
  `data_entrada` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ativo` TINYINT NOT NULL DEFAULT '1',
  PRIMARY KEY (`lote_id`),
  UNIQUE INDEX `idx_lote_unico_produto` (`produto_id` ASC, `lote_codigo` ASC) VISIBLE,
  INDEX `fk_LOTEPROD_PRODUTO1_idx` (`produto_id` ASC) VISIBLE,
  CONSTRAINT `fk_LOTEPROD_PRODUTO1`
    FOREIGN KEY (`produto_id`)
    REFERENCES `consumajadb`.`produto` (`produto_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`item_devolucao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`item_devolucao` (
  `DEVOLUCAO_devolucao_id` INT UNSIGNED NOT NULL,
  `LOTEPROD_lote_id` INT NOT NULL,
  `itemDevolucao_qtde` INT NOT NULL,
  PRIMARY KEY (`DEVOLUCAO_devolucao_id`, `LOTEPROD_lote_id`),
  INDEX `fk_ITEM_DEVOLUCAO_DEVOLUCAO1_idx` (`DEVOLUCAO_devolucao_id` ASC) VISIBLE,
  INDEX `fk_ITEM_DEVOLUCAO_LOTEPROD1_idx` (`LOTEPROD_lote_id` ASC) VISIBLE,
  CONSTRAINT `fk_ITEM_DEVOLUCAO_DEVOLUCAO1`
    FOREIGN KEY (`DEVOLUCAO_devolucao_id`)
    REFERENCES `consumajadb`.`devolucao` (`devolucao_id`),
  CONSTRAINT `fk_ITEM_DEVOLUCAO_LOTEPROD1`
    FOREIGN KEY (`LOTEPROD_lote_id`)
    REFERENCES `consumajadb`.`loteprod` (`lote_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`item_promocao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`item_promocao` (
  `PROMOCAO_promocao_id` INT NOT NULL,
  `LOTEPROD_lote_id` INT NOT NULL,
  `itemPromocao_qtde` INT NOT NULL,
  `itemPromocao_valor` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`PROMOCAO_promocao_id`, `LOTEPROD_lote_id`),
  INDEX `fk_ITEM_PROMOCAO_LOTEPROD1_idx` (`LOTEPROD_lote_id` ASC) VISIBLE,
  CONSTRAINT `fk_ITEM_PROMOCAO_LOTEPROD1`
    FOREIGN KEY (`LOTEPROD_lote_id`)
    REFERENCES `consumajadb`.`loteprod` (`lote_id`),
  CONSTRAINT `fk_ITEM_PROMOCAO_PROMOCAO1`
    FOREIGN KEY (`PROMOCAO_promocao_id`)
    REFERENCES `consumajadb`.`promocao` (`promocao_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`item_venda`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`item_venda` (
  `itemVenda_qtde` INT NOT NULL,
  `itemVenda_preco` DECIMAL(10,2) NOT NULL,
  `LOTEPROD_lote_id` INT NOT NULL,
  `VENDA_venda_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`LOTEPROD_lote_id`, `VENDA_venda_id`),
  INDEX `fk_ITEM_VENDA_LOTEPROD1_idx` (`LOTEPROD_lote_id` ASC) VISIBLE,
  INDEX `fk_ITEM_VENDA_VENDA1_idx` (`VENDA_venda_id` ASC) VISIBLE,
  CONSTRAINT `fk_ITEM_VENDA_LOTEPROD1`
    FOREIGN KEY (`LOTEPROD_lote_id`)
    REFERENCES `consumajadb`.`loteprod` (`lote_id`),
  CONSTRAINT `fk_ITEM_VENDA_VENDA1`
    FOREIGN KEY (`VENDA_venda_id`)
    REFERENCES `consumajadb`.`venda` (`venda_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`perguntas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`perguntas` (
  `perguntas_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `perguntas_descricao` TEXT NOT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`perguntas_id`),
  UNIQUE INDEX `idPERGUNTAS_UNIQUE` (`perguntas_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `consumajadb`.`nota_avaliacao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consumajadb`.`nota_avaliacao` (
  `AVALIACAO_avaliacao_id` INT UNSIGNED NOT NULL,
  `PERGUNTAS_perguntas_id` INT UNSIGNED NOT NULL,
  `avaliacao_nota` TINYINT NOT NULL,
  PRIMARY KEY (`AVALIACAO_avaliacao_id`, `PERGUNTAS_perguntas_id`),
  INDEX `fk_AVALIACAO_has_PERGUNTAS_PERGUNTAS1_idx` (`PERGUNTAS_perguntas_id` ASC) VISIBLE,
  INDEX `fk_AVALIACAO_has_PERGUNTAS_AVALIACAO1_idx` (`AVALIACAO_avaliacao_id` ASC) VISIBLE,
  CONSTRAINT `fk_AVALIACAO_has_PERGUNTAS_AVALIACAO1`
    FOREIGN KEY (`AVALIACAO_avaliacao_id`)
    REFERENCES `consumajadb`.`avaliacao` (`avaliacao_id`),
  CONSTRAINT `fk_AVALIACAO_has_PERGUNTAS_PERGUNTAS1`
    FOREIGN KEY (`PERGUNTAS_perguntas_id`)
    REFERENCES `consumajadb`.`perguntas` (`perguntas_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
