-- -----------------------------------------------------
-- Tabelas adicionais necessárias para o sistema de configurações
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`NOTIFICACOES_PREFERENCIAS`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`NOTIFICACOES_PREFERENCIAS` (
  `notificacao_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  `email_notificacoes` TINYINT(1) NOT NULL DEFAULT '1',
  `sms_notificacoes` TINYINT(1) NOT NULL DEFAULT '0',
  `marketing_notificacoes` TINYINT(1) NOT NULL DEFAULT '1',
  `push_notificacoes` TINYINT(1) NOT NULL DEFAULT '1',
  `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`notificacao_id`),
  UNIQUE INDEX `idx_notificacao_pessoa_unica` (`PESSOA_pessoa_id` ASC) VISIBLE,
  INDEX `fk_NOTIFICACOES_PREFERENCIAS_PESSOA1_idx` (`PESSOA_pessoa_id` ASC) VISIBLE,
  CONSTRAINT `fk_NOTIFICACOES_PREFERENCIAS_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`METODOS_PAGAMENTO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`METODOS_PAGAMENTO` (
  `pagamento_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  `tipo_pagamento` ENUM('cartao_credito', 'cartao_debito', 'pix', 'boleto', 'paypal') NOT NULL,
  `nome_titular` VARCHAR(255) NULL DEFAULT NULL,
  `numero_cartao` VARCHAR(255) NULL DEFAULT NULL, -- Criptografado
  `data_expiracao` VARCHAR(10) NULL DEFAULT NULL, -- MM/AA
  `cvv` VARCHAR(255) NULL DEFAULT NULL, -- Criptografado
  `chave_pix` VARCHAR(255) NULL DEFAULT NULL,
  `email_paypal` VARCHAR(255) NULL DEFAULT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT '1',
  `padrao` TINYINT(1) NOT NULL DEFAULT '0',
  `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`pagamento_id`),
  INDEX `fk_METODOS_PAGAMENTO_PESSOA1_idx` (`PESSOA_pessoa_id` ASC) VISIBLE,
  CONSTRAINT `fk_METODOS_PAGAMENTO_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`CONFIGURACOES_SEGURANCA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`CONFIGURACOES_SEGURANCA` (
  `seguranca_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  `autenticacao_2fa` TINYINT(1) NOT NULL DEFAULT '0',
  `codigo_2fa` VARCHAR(255) NULL DEFAULT NULL, -- Criptografado
  `tentativas_login` INT NOT NULL DEFAULT '0',
  `bloqueado_ate` TIMESTAMP NULL DEFAULT NULL,
  `ultima_alteracao_senha` TIMESTAMP NULL DEFAULT NULL,
  `senha_temporaria` TINYINT(1) NOT NULL DEFAULT '0',
  `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`seguranca_id`),
  UNIQUE INDEX `idx_seguranca_pessoa_unica` (`PESSOA_pessoa_id` ASC) VISIBLE,
  INDEX `fk_CONFIGURACOES_SEGURANCA_PESSOA1_idx` (`PESSOA_pessoa_id` ASC) VISIBLE,
  CONSTRAINT `fk_CONFIGURACOES_SEGURANCA_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`HISTORICO_PAGAMENTOS`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`HISTORICO_PAGAMENTOS` (
  `historico_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  `METODOS_PAGAMENTO_pagamento_id` INT UNSIGNED NULL DEFAULT NULL,
  `VENDA_venda_id` INT UNSIGNED NULL DEFAULT NULL,
  `tipo_transacao` ENUM('compra', 'reembolso', 'estorno') NOT NULL,
  `valor` DECIMAL(10,2) NOT NULL,
  `moeda` VARCHAR(3) NOT NULL DEFAULT 'BRL',
  `status` ENUM('pendente', 'aprovado', 'recusado', 'cancelado', 'reembolsado') NOT NULL,
  `gateway_transacao_id` VARCHAR(255) NULL DEFAULT NULL,
  `descricao` VARCHAR(255) NULL DEFAULT NULL,
  `data_transacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`historico_id`),
  INDEX `fk_HISTORICO_PAGAMENTOS_PESSOA1_idx` (`PESSOA_pessoa_id` ASC) VISIBLE,
  INDEX `fk_HISTORICO_PAGAMENTOS_METODOS_PAGAMENTO1_idx` (`METODOS_PAGAMENTO_pagamento_id` ASC) VISIBLE,
  INDEX `fk_HISTORICO_PAGAMENTOS_VENDA1_idx` (`VENDA_venda_id` ASC) VISIBLE,
  CONSTRAINT `fk_HISTORICO_PAGAMENTOS_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_HISTORICO_PAGAMENTOS_METODOS_PAGAMENTO1`
    FOREIGN KEY (`METODOS_PAGAMENTO_pagamento_id`)
    REFERENCES `ConsumaJaDB`.`METODOS_PAGAMENTO` (`pagamento_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_HISTORICO_PAGAMENTOS_VENDA1`
    FOREIGN KEY (`VENDA_venda_id`)
    REFERENCES `ConsumaJaDB`.`VENDA` (`venda_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`SESSOES_USUARIO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`SESSOES_USUARIO` (
  `sessao_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `PESSOA_pessoa_id` INT UNSIGNED NOT NULL,
  `token_sessao` VARCHAR(500) NOT NULL,
  `device_info` JSON NULL DEFAULT NULL,
  `ip_address` VARCHAR(45) NULL DEFAULT NULL,
  `user_agent` VARCHAR(500) NULL DEFAULT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT '1',
  `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_expiracao` TIMESTAMP NULL DEFAULT NULL,
  `ultima_atividade` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`sessao_id`),
  UNIQUE INDEX `idx_token_sessao_unico` (`token_sessao` ASC) VISIBLE,
  INDEX `fk_SESSOES_USUARIO_PESSOA1_idx` (`PESSOA_pessoa_id` ASC) VISIBLE,
  CONSTRAINT `fk_SESSOES_USUARIO_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `ConsumaJaDB`.`LOGS_AUDITORIA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ConsumaJaDB`.`LOGS_AUDITORIA` (
  `log_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `PESSOA_pessoa_id` INT UNSIGNED NULL DEFAULT NULL,
  `acao` VARCHAR(100) NOT NULL,
  `tabela_afetada` VARCHAR(100) NULL DEFAULT NULL,
  `registro_id` INT NULL DEFAULT NULL,
  `dados_anteriores` JSON NULL DEFAULT NULL,
  `dados_novos` JSON NULL DEFAULT NULL,
  `ip_address` VARCHAR(45) NULL DEFAULT NULL,
  `user_agent` VARCHAR(500) NULL DEFAULT NULL,
  `data_acao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  INDEX `fk_LOGS_AUDITORIA_PESSOA1_idx` (`PESSOA_pessoa_id` ASC) VISIBLE,
  INDEX `idx_logs_data_acao` (`data_acao` ASC) VISIBLE,
  INDEX `idx_logs_acao` (`acao` ASC) VISIBLE,
  CONSTRAINT `fk_LOGS_AUDITORIA_PESSOA1`
    FOREIGN KEY (`PESSOA_pessoa_id`)
    REFERENCES `ConsumaJaDB`.`PESSOA` (`pessoa_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Dados de exemplo para testes
-- -----------------------------------------------------

-- Inserir preferências de notificação padrão para usuários existentes
INSERT IGNORE INTO `ConsumaJaDB`.`NOTIFICACOES_PREFERENCIAS`
(`PESSOA_pessoa_id`, `email_notificacoes`, `sms_notificacoes`, `marketing_notificacoes`, `push_notificacoes`)
SELECT
  p.pessoa_id,
  1 as email_notificacoes,
  0 as sms_notificacoes,
  1 as marketing_notificacoes,
  1 as push_notificacoes
FROM `ConsumaJaDB`.`PESSOA` p
LEFT JOIN `ConsumaJaDB`.`NOTIFICACOES_PREFERENCIAS` np ON p.pessoa_id = np.PESSOA_pessoa_id
WHERE np.notificacao_id IS NULL;

-- Inserir configurações de segurança padrão para usuários existentes
INSERT IGNORE INTO `ConsumaJaDB`.`CONFIGURACOES_SEGURANCA`
(`PESSOA_pessoa_id`, `autenticacao_2fa`, `tentativas_login`)
SELECT
  p.pessoa_id,
  0 as autenticacao_2fa,
  0 as tentativas_login
FROM `ConsumaJaDB`.`PESSOA` p
LEFT JOIN `ConsumaJaDB`.`CONFIGURACOES_SEGURANCA` cs ON p.pessoa_id = cs.PESSOA_pessoa_id
WHERE cs.seguranca_id IS NULL;