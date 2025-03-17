show databases;

CREATE SCHEMA IF NOT EXISTS `ConsumaJaDB` ;
USE `ConsumaJaDB` ;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`PESSOA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`PESSOA` (
  `pessoa_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pessoa_nome` VARCHAR(255) NOT NULL,
  `pessoa_email` VARCHAR(255) NOT NULL,
  `pessoa_telefone` VARCHAR(20),
  `pessoa_tipo` ENUM('Fisica', 'Juridica', 'Admin') NOT NULL,
  `pessoa_login` VARCHAR(100) NOT NULL,
  `pessoa_senha` VARCHAR(100) NOT NULL,
  `pessoa_status` TINYINT NOT NULL,
  PRIMARY KEY (`pessoa_id`)
);


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`FISICA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`FISICA` (
  `pessoa_cpf` VARCHAR(14) NOT NULL,
  `pessoa_documentoValidado` TINYINT NOT NULL DEFAULT 0,
  `pessoa_fotoValidada` TINYINT NOT NULL DEFAULT 0,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  UNIQUE INDEX `pessoa_cpf_UNIQUE` (`pessoa_cpf` ASC),
  PRIMARY KEY (`PESSOA_pessoa_id`),
  CONSTRAINT `fk_FISICA_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`JURIDICA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`JURIDICA` (
  `cnpj` VARCHAR(18) NOT NULL,
  `fornecedor_num` INT NOT NULL,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  UNIQUE INDEX `pessoa_cnpj_UNIQUE` (`cnpj` ASC),
  PRIMARY KEY (`PESSOA_pessoa_id`),
  CONSTRAINT `fk_JURIDICA_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`TIPO_PRODUTO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`TIPO_PRODUTO` (
  `tipo_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tipo_nome` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`tipo_id`),
  UNIQUE INDEX `produto_id_UNIQUE` (`tipo_id` ASC) ,
  UNIQUE INDEX `tipo_nome_UNIQUE` (`tipo_nome` ASC) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`CATEGORIA_PRODUTO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`CATEGORIA_PRODUTO` (
  `categoria_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `categoria_nome` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`categoria_id`),
  UNIQUE INDEX `idCATEGORIA_PRODUTO_UNIQUE` (`categoria_id` ASC) ,
  UNIQUE INDEX `categoria_nome_UNIQUE` (`categoria_nome` ASC) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`MARCA_PRODUTO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`MARCA_PRODUTO` (
  `marca_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `marca_nome` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`marca_id`),
  UNIQUE INDEX `marca_nome_UNIQUE` (`marca_nome` ASC) ,
  UNIQUE INDEX `marca_id_UNIQUE` (`marca_id` ASC) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`PRODUTO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`PRODUTO` (
  `produto_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `MARCA_PRODUTO_marca_id` INT UNSIGNED NOT NULL,
  `TIPO_PRODUTO_tipo_id` INT UNSIGNED NOT NULL,
  `CATEGORIA_PRODUTO_categoria_id` INT UNSIGNED NOT NULL,
  `produto_nome` VARCHAR(255) NOT NULL,
  `produto_status` ENUM("APROVADO", "PENDENTE", "REJEITADO") NOT NULL,
  `produto_medida` VARCHAR(45) NOT NULL,
  `produto_precoOriginal` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`produto_id`),
  UNIQUE INDEX `idPRODUTO_UNIQUE` (`produto_id` ASC) ,
  INDEX `fk_PRODUTO_MARCA_PRODUTO1_idx` (`MARCA_PRODUTO_marca_id` ASC) ,
  INDEX `fk_PRODUTO_TIPO_PRODUTO1_idx` (`TIPO_PRODUTO_tipo_id` ASC) ,
  INDEX `fk_PRODUTO_CATEGORIA_PRODUTO1_idx` (`CATEGORIA_PRODUTO_categoria_id` ASC) ,
  CONSTRAINT `fk_PRODUTO_MARCA_PRODUTO1`
    FOREIGN KEY (`MARCA_PRODUTO_marca_id`)
    REFERENCES `ConsumaJaDB`.`MARCA_PRODUTO` (`marca_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_PRODUTO_TIPO_PRODUTO1`
    FOREIGN KEY (`TIPO_PRODUTO_tipo_id`)
    REFERENCES `ConsumaJaDB`.`TIPO_PRODUTO` (`tipo_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_PRODUTO_CATEGORIA_PRODUTO1`
    FOREIGN KEY (`CATEGORIA_PRODUTO_categoria_id`)
    REFERENCES `ConsumaJaDB`.`CATEGORIA_PRODUTO` (`categoria_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`ESTADO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`ESTADO` (
  `estado_id` INT NOT NULL,
  `estado_nome` VARCHAR(45) NOT NULL,
  `estado_sigla` VARCHAR(3) NOT NULL,
  PRIMARY KEY (`estado_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`CIDADE`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`CIDADE` (
  `cidade_id` INT NOT NULL,
  `cidade_nome` VARCHAR(45) NULL,
  `Estado_estado_id` INT NOT NULL,
  PRIMARY KEY (`cidade_id`),
  INDEX `fk_Cidade_Estado1_idx` (`Estado_estado_id` ASC) ,
  CONSTRAINT `fk_Cidade_Estado1`
    FOREIGN KEY (`Estado_estado_id`)
    REFERENCES `ConsumaJaDB`.`ESTADO` (`estado_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`Endereço`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`Endereço` (
  `id` INT NOT NULL,
  `rua` VARCHAR(60) NOT NULL,
  `bairro` VARCHAR(45) NOT NULL,
  `numero` INT NOT NULL,
  `cep` VARCHAR(10) NOT NULL,
  `complemento` VARCHAR(80) NULL,
  `CIDADE_cidade_id` INT NOT NULL,
  `regiao(DDD)` VARCHAR(4) NULL,
  `CNPJ` VARCHAR(45) NULL,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`, `PESSOA_pessoa_id`),
  INDEX `fk_Endereço_CIDADE1_idx` (`CIDADE_cidade_id` ASC) ,
  INDEX `fk_Endereço_PESSOA1_idx` (`PESSOA_pessoa_id` ASC) ,
  CONSTRAINT `fk_Endereço_CIDADE1`
    FOREIGN KEY (`CIDADE_cidade_id`)
    REFERENCES `ConsumaJaDB`.`CIDADE` (`cidade_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Endereço_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`PROMOCAO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`PROMOCAO` (
  `promocao_id` INT NOT NULL,
  `fornecedor_cnpj` VARCHAR(18) NOT NULL,
  `Endereço_id` INT NOT NULL,
  PRIMARY KEY (`promocao_id`),
  INDEX `fk_PROMOCAO_FORNECEDOR1_idx` (`fornecedor_cnpj` ASC) ,
  INDEX `fk_PROMOCAO_Endereço1_idx` (`Endereço_id` ASC) ,
  CONSTRAINT `fk_PROMOCAO_FORNECEDOR1`
    FOREIGN KEY (`fornecedor_cnpj`)
    REFERENCES `ConsumaJaDB`.`JURIDICA` (`cnpj`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_PROMOCAO_Endereço1`
    FOREIGN KEY (`Endereço_id`)
    REFERENCES `ConsumaJaDB`.`Endereço` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`VENDA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`VENDA` (
  `venda_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `venda_data` DATE NOT NULL,
  `venda_total` DECIMAL(10,2) NOT NULL,
  `venda_status` ENUM('EM ANDAMENTO', 'CONCLUIDA', 'CANCELADA') NOT NULL,
  `PROMOCAO_promocao_id` INT NOT NULL,
  `ITEM_VENDA_itemVenda_id` INT UNSIGNED NOT NULL,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  `Endereço_id` INT NOT NULL,
  PRIMARY KEY (`venda_id`, `ITEM_VENDA_itemVenda_id`),
  UNIQUE INDEX `idVENDA_UNIQUE` (`venda_id` ASC) ,
  INDEX `fk_VENDA_PROMOCAO1_idx` (`PROMOCAO_promocao_id` ASC) ,
  INDEX `fk_VENDA_PESSOA1_idx` (`PESSOA_pessoa_id` ASC) ,
  INDEX `fk_VENDA_Endereço1_idx` (`Endereço_id` ASC) ,
  CONSTRAINT `fk_VENDA_PROMOCAO1`
    FOREIGN KEY (`PROMOCAO_promocao_id`)
    REFERENCES `ConsumaJaDB`.`PROMOCAO` (`promocao_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_VENDA_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_VENDA_Endereço1`
    FOREIGN KEY (`Endereço_id`)
    REFERENCES `ConsumaJaDB`.`Endereço` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`LOTEPROD`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`LOTEPROD` (
  `lote_id` INT NOT NULL,
  `produto_id` INT UNSIGNED NOT NULL,
  `lote_validade` DATE NOT NULL,
  PRIMARY KEY (`lote_id`, `produto_id`),
  INDEX `fk_LoteProd_PRODUTO1_idx` (`produto_id` ASC) ,
  CONSTRAINT `fk_LoteProd_PRODUTO1`
    FOREIGN KEY (`produto_id`)
    REFERENCES `ConsumaJaDB`.`PRODUTO` (`produto_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`ITEM_VENDA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`ITEM_VENDA` (
  `itemVenda_qtde` INT NOT NULL,
  `itemVenda_preco` DECIMAL(10,2) NOT NULL,
  `LOTEPROD_lote_id` INT NOT NULL,
  `LOTEPROD_produto_id` INT UNSIGNED NOT NULL,
  `VENDA_venda_id` INT UNSIGNED NOT NULL,
  `VENDA_ITEM_VENDA_itemVenda_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`LOTEPROD_lote_id`, `LOTEPROD_produto_id`, `VENDA_venda_id`, `VENDA_ITEM_VENDA_itemVenda_id`),
  INDEX `fk_ITEM_VENDA_LOTEPROD1_idx` (`LOTEPROD_lote_id` ASC, `LOTEPROD_produto_id` ASC) ,
  INDEX `fk_ITEM_VENDA_VENDA1_idx` (`VENDA_venda_id` ASC, `VENDA_ITEM_VENDA_itemVenda_id` ASC) ,
  CONSTRAINT `fk_ITEM_VENDA_LOTEPROD1`
    FOREIGN KEY (`LOTEPROD_lote_id` , `LOTEPROD_produto_id`)
    REFERENCES `ConsumaJaDB`.`LOTEPROD` (`lote_id` , `produto_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_ITEM_VENDA_VENDA1`
    FOREIGN KEY (`VENDA_venda_id` , `VENDA_ITEM_VENDA_itemVenda_id`)
    REFERENCES `ConsumaJaDB`.`VENDA` (`venda_id` , `ITEM_VENDA_itemVenda_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`DEVOLUCAO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`DEVOLUCAO` (
  `devolucao_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `devolucao_data` DATE NOT NULL,
  `devolucao_motivo` TEXT NOT NULL,
  `devolucao_status` ENUM('PENDENTE', 'FINALIZADA') NOT NULL,
  `venda_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`devolucao_id`),
  UNIQUE INDEX `idDEVOLUCAO_UNIQUE` (`devolucao_id` ASC) ,
  INDEX `venda_id_idx` (`venda_id` ASC) ,
  CONSTRAINT `venda_id`
    FOREIGN KEY (`venda_id`)
    REFERENCES `ConsumaJaDB`.`VENDA` (`venda_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`ITEM_DEVOLUCAO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`ITEM_DEVOLUCAO` (
  `devolucao_id` INT UNSIGNED NOT NULL,
  `item_venda_qtde` INT NOT NULL,
  `item_venda_preco` DECIMAL(10,2) NOT NULL,
  `LOTEPROD_lote_id` INT NOT NULL,
  `LOTEPROD_produto_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`devolucao_id`, `LOTEPROD_lote_id`, `LOTEPROD_produto_id`),
  INDEX `fk_ITEM_DEVOLUCAO_DEVOLUCAO1_idx` (`devolucao_id` ASC) ,
  INDEX `fk_ITEM_DEVOLUCAO_LOTEPROD1_idx` (`LOTEPROD_lote_id` ASC, `LOTEPROD_produto_id` ASC) ,
  CONSTRAINT `fk_ITEM_DEVOLUCAO_DEVOLUCAO1`
    FOREIGN KEY (`devolucao_id`)
    REFERENCES `ConsumaJaDB`.`DEVOLUCAO` (`devolucao_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_ITEM_DEVOLUCAO_LOTEPROD1`
    FOREIGN KEY (`LOTEPROD_lote_id` , `LOTEPROD_produto_id`)
    REFERENCES `ConsumaJaDB`.`LOTEPROD` (`lote_id` , `produto_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`ITEM_PROMOCAO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`ITEM_PROMOCAO` (
  `PROMOCAO_promocao_id` INT NOT NULL,
  `LOTEPROD_lote_id` INT NOT NULL,
  `LOTEPROD_produto_id` INT UNSIGNED NOT NULL,
  `itemPromocao_qtde` INT NOT NULL,
  `itemPromocao_valor` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`PROMOCAO_promocao_id`, `LOTEPROD_lote_id`, `LOTEPROD_produto_id`),
  INDEX `fk_PROMOCAO_has_LOTEPROD_LOTEPROD1_idx` (`LOTEPROD_lote_id` ASC, `LOTEPROD_produto_id` ASC) ,
  INDEX `fk_PROMOCAO_has_LOTEPROD_PROMOCAO1_idx` (`PROMOCAO_promocao_id` ASC) ,
  CONSTRAINT `fk_PROMOCAO_has_LOTEPROD_PROMOCAO1`
    FOREIGN KEY (`PROMOCAO_promocao_id`)
    REFERENCES `ConsumaJaDB`.`PROMOCAO` (`promocao_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_PROMOCAO_has_LOTEPROD_LOTEPROD1`
    FOREIGN KEY (`LOTEPROD_lote_id` , `LOTEPROD_produto_id`)
    REFERENCES `ConsumaJaDB`.`LOTEPROD` (`lote_id` , `produto_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`AVALIACAO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`AVALIACAO` (
  `avaliacao_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `avaliacao_descricao` TEXT NOT NULL,
  `avaliacao_classificacao` ENUM('1', '2', '3', '4', '5') NOT NULL,
  `PROMOCAO_promocao_id` INT NOT NULL,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`avaliacao_id`),
  UNIQUE INDEX `idAVALIACAO_UNIQUE` (`avaliacao_id` ASC) ,
  INDEX `fk_AVALIACAO_PROMOCAO1_idx` (`PROMOCAO_promocao_id` ASC) ,
  INDEX `fk_AVALIACAO_PESSOA1_idx` (`PESSOA_pessoa_id` ASC) ,
  CONSTRAINT `fk_AVALIACAO_PROMOCAO1`
    FOREIGN KEY (`PROMOCAO_promocao_id`)
    REFERENCES `ConsumaJaDB`.`PROMOCAO` (`promocao_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_AVALIACAO_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`PERGUNTAS`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`PERGUNTAS` (
  `perguntas_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `perguntas_descricao` TEXT NOT NULL,
  PRIMARY KEY (`perguntas_id`),
  UNIQUE INDEX `idPERGUNTAS_UNIQUE` (`perguntas_id` ASC) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`nota_avaliacao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`nota_avaliacao` (
  `AVALIACAO_avaliacao_id` INT UNSIGNED NOT NULL,
  `PERGUNTAS_perguntas_id` INT UNSIGNED NOT NULL,
  `avaliacao_nota` INT NULL,
  PRIMARY KEY (`AVALIACAO_avaliacao_id`, `PERGUNTAS_perguntas_id`),
  INDEX `fk_AVALIACAO_has_PERGUNTAS_PERGUNTAS1_idx` (`PERGUNTAS_perguntas_id` ASC) ,
  INDEX `fk_AVALIACAO_has_PERGUNTAS_AVALIACAO1_idx` (`AVALIACAO_avaliacao_id` ASC) ,
  CONSTRAINT `fk_AVALIACAO_has_PERGUNTAS_AVALIACAO1`
    FOREIGN KEY (`AVALIACAO_avaliacao_id`)
    REFERENCES `ConsumaJaDB`.`AVALIACAO` (`avaliacao_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_AVALIACAO_has_PERGUNTAS_PERGUNTAS1`
    FOREIGN KEY (`PERGUNTAS_perguntas_id`)
    REFERENCES `ConsumaJaDB`.`PERGUNTAS` (`perguntas_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

insert into PESSOA values(1, 'Admin', 'admin@email.com', '111111111', 'Admin', 1, 1, 1);
select * from PESSOA;