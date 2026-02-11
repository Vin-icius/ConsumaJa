Excelente! Agora temos o "quebra-cabeça" completo: a **estrutura técnica**, o **propósito do negócio** e o **processo de trabalho (Workflow)** que a equipe já utiliza.

O guia de inicialização que você passou revela um detalhe importante: vocês utilizam um fluxo de **Cherry-pick** para a `main`, o que é um pouco diferente do Git Flow tradicional, mas muito útil para manter o histórico limpo.

Abaixo, consolidei tudo em um **README.md Mestre**. Ele foi desenhado para ser o "Portal de Entrada" do projeto.

---

# 🛒 Consuma Já! - Marketplace de Sustentabilidade

> **Projeto de Estágio Supervisionado 2** > Plataforma para combate ao desperdício de alimentos, conectando empresas e consumidores.

Este repositório contém o ecossistema completo do Consuma Já!, dividido em uma arquitetura de microsserviços para o Backend e um aplicativo mobile robusto.

---

## 🏗️ 1. Arquitetura e Tecnologias

### **Backend (Microsserviços em Node.js)**

Seguimos o padrão de **Clean Architecture** (Arquitetura Limpa), garantindo que a lógica de negócio seja independente de ferramentas externas.

* **Serviços:**
* `location-service`: Gestão de endereços e integração ViaCEP.
* `pessoa-service`: Autenticação (JWT/2FA) e perfis de usuário.
* `product-service`: Gestão de catálogo, estoque, vendas e avaliações.


* **Camadas (dentro de cada `src/`):**
* `Domain`: Entidades e regras de negócio.
* `Application`: Serviços e Casos de Uso.
* `Infrastructure`: Conexão com MySQL e implementações técnicas.
* `Interfaces`: Rotas e Controllers (API REST).



### **Frontend (Mobile em React Native/Expo)**

* **Navegação:** React Navigation.
* **Estado:** Context API (Auth, Cart).
* **Estilização:** Styled Components.

---

## 🚀 2. Guia de Inicialização Rápida

### **Pré-requisitos**

* Node.js instalado.
* VS Code com a extensão **GitLens — Git supercharged**.
* Banco de Dados MySQL configurado.
* Expo Go instalado no smartphone (para testes mobile).

### **Instalação**

1. Clone o projeto:
```bash
git clone https://github.com/Vin-icius/ConsumaJa.git

```


2. Abra a pasta no VS Code.

---

## 🛠️ 3. Como Rodar o Projeto

### **Passo 1: Banco de Dados**

Localize os arquivos SQL em `Backend/bd/` e execute-os no seu MySQL (primeiro o `banco.sql`, depois o `updated_inserts.sql`).

### **Passo 2: Subindo o Backend**

Você deve subir cada microsserviço que for utilizar em terminais separados:

```bash
cd Backend/[nome-do-serviço]
npm install
npm run build   # Obrigatório para gerar a pasta dist/
npm run dev     # Ou npm start

```

### **Passo 3: Subindo o Mobile**

```bash
cd Frontend
npm install
npm start --clear

```

---

## 🔄 4. Processo de Contribuição (Workflow)

Para manter a organização do projeto, todo desenvolvedor deve seguir este fluxo:

1. **Issue:** Crie uma Issue no GitHub detalhando a tarefa.
2. **Branch:** Crie uma branch a partir da `main` (ex: `feature/nova-funcionalidade`).
3. **Vínculo:** No GitHub, atribua sua branch à Issue criada na seção "Development".
4. **Desenvolvimento:**
* Realize as alterações.
* **Atenção:** Se alterou arquivos TypeScript, você **DEVE** rodar `npm run build` antes do commit para atualizar a pasta `dist/`.


5. **Commit:** Faça o commit na sua branch local.
6. **Integração (Cherry-pick):**
* Mude para a branch `main`.
* Atualize a main: `git fetch --prune`.
* Aplique sua alteração: `git cherry-pick <SHA-do-seu-commit>`.


7. **Sincronização:** Clique em "Sync Changes" para enviar o Pull Request.

---

## 🔐 5. Variáveis de Ambiente (.env)

Cada microsserviço no backend possui um arquivo `.env`. Certifique-se de configurá-los corretamente. Abaixo, um exemplo de modelo:

```env
# Exemplo para Product-Service ou Pessoa-Service
PORT=3000
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=consuma_ja
JWT_SECRET=sua_chave_secreta_aqui

```

---

## ⚠️ 6. Notas de Manutenção (Liderança)

* **Mistura de Linguagens:** O projeto possui arquivos `.js` e `.ts`. Novos arquivos **devem** ser criados em TypeScript.
* **Pastas Dist:** Não edite arquivos dentro das pastas `dist/`. Eles são gerados automaticamente pelo comando `build`.
* **Commits:** Sempre revise suas alterações no Source Control antes de confirmar o commit para evitar subir arquivos desnecessários.

---

### Por que este novo README é melhor para você?

1. **Centralização:** Ele une o guia de "Como rodar" com o "Como contribuir".
2. **Visibilidade de Líder:** Você deixou claro que **novos arquivos devem ser TS**, o que resolve o problema da bagunça que a pessoa anterior deixou.
3. **Segurança Técnica:** Expliquei a Clean Architecture. Assim, se alguém colocar lógica de banco de dados dentro de um Controller, você pode apontar o README e pedir para corrigir.

**Dica Extra:** Salve esse conteúdo no arquivo `README.md` principal do projeto. Se quiser, posso te ajudar a criar uma **"Checklist de Code Review"** para você usar quando os outros estagiários enviarem código para você aprovar! Aceita?