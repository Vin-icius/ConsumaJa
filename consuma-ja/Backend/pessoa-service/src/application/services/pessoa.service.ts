// src/application/services/pessoa.service.ts
import { Pessoa } from "../../domain/entities/pessoa.entity";
// <<< Garanta que a interface importe TODOS os tipos e métodos necessários >>>
import { PessoaRepository, CreatePessoaData, UpdatePessoaData } from "../../domain/repositories/pessoa.repository";
import { AppError } from "../../common/errors/app-error";
import { PasswordUtil } from "../../common/utils/password.util";
// <<< Garanta que os DTOs corretos estão sendo importados >>>
import { ListarPessoasQueryDto } from "../../interfaces/dtos/listar-pessoas-query.dto";
import { CreateFisicaDto } from "../../interfaces/dtos/create-fisica.dto";
import { CreateJuridicaDto } from "../../interfaces/dtos/create-juridica.dto";
import { UpdatePessoaDto } from "../../interfaces/dtos/update-pessoa.dto"; // Garanta que este DTO exista e esteja correto

export interface PaginatedServiceResponse<T> {
     data: T[];
     total: number;
     page: number;
     limit: number;
     totalPages: number;
   }

export class PessoaService {
  // Injeta o repositório
  constructor(private pessoaRepository: PessoaRepository) {}

  /**
   * Registra uma nova Pessoa (Física ou Jurídica).
   * Deriva o login do CPF/CNPJ, hasheia a senha e chama o repositório.
   */
  async registrarPessoa(dto: CreateFisicaDto | CreateJuridicaDto): Promise<Pessoa> {
      console.log("[Service] Iniciando registro para:", dto.pessoa_email);

      // 1. Checar duplicações (Email - Login/CPF/CNPJ são checados abaixo/TODO)
      const emailExists = await this.pessoaRepository.findByEmail(dto.pessoa_email);
      if (emailExists) {
          throw new AppError(`Email "${dto.pessoa_email}" já cadastrado.`, 409);
      }

      // 2. Determinar o Login a ser salvo E checar duplicação específica
      let loginParaSalvar: string = '';
      const cpf = (dto as CreateFisicaDto).pessoa_cpf?.replace(/[.\-\/]/g, '');
      const cnpj = (dto as CreateJuridicaDto).cnpj?.replace(/[.\-\/]/g, '');

      if (dto.pessoa_tipo === 'Fisica') {
          if (!cpf) throw new AppError("CPF não fornecido para Pessoa Física.", 400);
          loginParaSalvar = cpf;
          console.log(`[Service] Definindo login como CPF: ${loginParaSalvar}`);
          // TODO: Checar duplicação de CPF (requer findByCPF no repo)
      } else if (dto.pessoa_tipo === 'Juridica') {
           if (!cnpj) throw new AppError("CNPJ não fornecido para Pessoa Jurídica.", 400);
           loginParaSalvar = cnpj;
           console.log(`[Service] Definindo login como CNPJ: ${loginParaSalvar}`);
           // TODO: Checar duplicação de CNPJ (requer findByCNPJ no repo)
      } else if (dto.pessoa_tipo === 'Admin') {
           if (!dto.pessoa_login || !/^\d{1,3}$/.test(dto.pessoa_login)) {
               throw new AppError("Login Admin (1 a 3 dígitos numéricos) é obrigatório.", 400);
           }
           loginParaSalvar = dto.pessoa_login!; // Usa '!' pois validou
           const loginAdminExists = await this.pessoaRepository.findByLogin(loginParaSalvar);
           if (loginAdminExists) throw new AppError(`Login Admin "${loginParaSalvar}" já cadastrado.`, 409);
           console.log(`[Service] Usando login Admin: ${loginParaSalvar}`);
      } else {
           throw new AppError("Tipo de pessoa inválido.", 400);
      }

      // 3. Hash da senha
      const hashedPassword = await PasswordUtil.hashPassword(dto.pessoa_senha);

      // 4. Montar dados para o repositório
      const dataToCreate: CreatePessoaData = {
        pessoa_nome: dto.pessoa_nome,
        pessoa_email: dto.pessoa_email,
        pessoa_telefone: dto.pessoa_telefone ?? null,
        pessoa_tipo: dto.pessoa_tipo,
        pessoa_login: loginParaSalvar,
        pessoa_senha: hashedPassword, // Senha já hashada
        pessoa_status: 1, // Ativo por padrão
        // Dados de endereço do DTO
        cep: dto.cep.replace(/\D/g, ''), // Limpa CEP
        rua: dto.rua,
        bairro: dto.bairro,
        numero: dto.numero,
        complemento: dto.complemento ?? null,
        CIDADE_cidade_id: dto.CIDADE_cidade_id,
        // Dados específicos de Fisica/Juridica
        ...(dto.pessoa_tipo === 'Fisica' && cpf && { fisicaData: { pessoa_cpf: cpf } }),
        ...(dto.pessoa_tipo === 'Juridica' && cnpj && { juridicaData: { cnpj: cnpj, fornecedor_num: (dto as CreateJuridicaDto).fornecedor_num ?? null } }),
    };

      // Adicionar lógica para Endereço aqui, se criar junto...

      try {
          // 5. Chamar repo para criar (o método 'criar' DEVE existir no repo)
          const novaPessoa = await this.pessoaRepository.criar(dataToCreate);
          console.log(`[Service] Pessoa registrada com ID: ${novaPessoa.pessoa_id}`);
          delete novaPessoa.pessoa_senha;
          return novaPessoa;
      } catch (error) {
           if (error instanceof AppError) throw error;
           console.error("[Service] Erro ao registrar pessoa:", error);
           throw new AppError("Erro interno ao registrar usuário.", 500, false);
      }
  }

  /**
   * Salva o caminho relativo de uma foto (selfie/documento) para Pessoa Física.
   */
   async salvarCaminhoFoto(pessoaId: number, tipoFoto: 'selfie' | 'documento', filePath: string | null): Promise<boolean> {
       console.log(`[Service] Atualizando path ${tipoFoto} para user ${pessoaId}: ${filePath}`);
       const pessoa = await this.pessoaRepository.findById(pessoaId);
       if (!pessoa) throw new AppError(`Pessoa ${pessoaId} não encontrada.`, 404);
       if (pessoa.pessoa_tipo !== 'Fisica') throw new AppError(`Pessoa ${pessoaId} não é Física.`, 400);
       try {
            const updateData: { foto_selfie_path?: string; foto_documento_path?: string } = {};
            if (tipoFoto === 'selfie') updateData.foto_selfie_path = filePath ?? undefined;
            else if (tipoFoto === 'documento') updateData.foto_documento_path = filePath ?? undefined;
            else return false;
            return await this.pessoaRepository.atualizarCaminhosFotos(pessoaId, updateData);
       } catch (error) {
            if (error instanceof AppError) throw error;
            console.error(`[Service] Erro ao salvar caminho da foto ${tipoFoto}:`, error);
            throw new AppError("Erro interno ao salvar caminho da foto.", 500, false);
       }
   }

   /**
    * Busca uma pessoa por ID. Lança 404 se não encontrada ou inativa.
    */
   async buscarPessoaPorId(id: number): Promise<Pessoa> {
        console.log(`[Service] Buscando pessoa por ID: ${id}`);
        try {
            // Assume que findById busca apenas ativos ou você pode adaptar
            const pessoa = await this.pessoaRepository.findById(id);
            if (!pessoa || !pessoa.ativo) { // Checa se existe E está ativo
                throw new AppError(`Pessoa com ID ${id} não encontrada ou inativa.`, 404);
            }
            delete pessoa.pessoa_senha;
            console.log(`[Service] Pessoa encontrada:`, pessoa.pessoa_id);
            return pessoa;
        } catch (error) {
             if (error instanceof AppError) throw error;
             console.error(`[Service] Erro ao buscar pessoa ${id}:`, error);
             throw new AppError(`Erro interno ao buscar pessoa ${id}.`, 500, false);
        }
    }

    /**
     * Atualiza dados básicos de uma Pessoa ativa. Não permite alterar tipo ou login.
     * Hasheia a senha se fornecida.
     */
    async atualizarPessoa(id: number, dto: UpdatePessoaDto): Promise<Pessoa> {
         console.log(`[Service] Iniciando atualização para pessoa ID: ${id}`);
         await this.buscarPessoaPorId(id); // Já lança 404 se não existir ou inativo

         const dataToUpdate: UpdatePessoaData = {};
         if (dto.pessoa_nome !== undefined) dataToUpdate.pessoa_nome = dto.pessoa_nome;
         if (dto.pessoa_email !== undefined) dataToUpdate.pessoa_email = dto.pessoa_email;
         if (dto.pessoa_telefone !== undefined) dataToUpdate.pessoa_telefone = dto.pessoa_telefone ?? null;
         if (dto.pessoa_status !== undefined) dataToUpdate.pessoa_status = dto.pessoa_status;

         if (dto.pessoa_senha) {
              console.log(`[Service] Gerando novo hash para senha do usuário ${id}`);
              dataToUpdate.pessoa_senha = await PasswordUtil.hashPassword(dto.pessoa_senha);
         }

          if (dataToUpdate.pessoa_email){
              const emailExists = await this.pessoaRepository.findByEmail(dataToUpdate.pessoa_email);
              if(emailExists && emailExists.pessoa_id !== id) { throw new AppError(`Email "${dataToUpdate.pessoa_email}" pertence a outro usuário.`, 409); }
          }

         // Extrair dados de endereço do DTO
         // O frontend pode enviar os dados de duas formas:
         // 1. Campos diretos: endereco_cep, endereco_rua, etc.
         // 2. Objeto endereco: { endereco: { endereco_cep, endereco_rua, etc. } }
         const dtoAny = dto as any; // Type assertion para acessar propriedade endereco
         let enderecoData: any = {};

         if (dtoAny.endereco && typeof dtoAny.endereco === 'object' && !Array.isArray(dtoAny.endereco)) {
             // Dados vêm dentro do objeto endereco
             console.log(`[Service] Extraindo dados do objeto endereco`);
             enderecoData = {
                 endereco_cep: dtoAny.endereco.endereco_cep,
                 endereco_rua: dtoAny.endereco.endereco_rua,
                 endereco_numero: dtoAny.endereco.endereco_numero,
                 endereco_complemento: dtoAny.endereco.endereco_complemento,
                 endereco_bairro: dtoAny.endereco.endereco_bairro,
                 cidade_id: dtoAny.endereco.cidade_id,
             };
         } else {
             // Dados vêm diretamente no DTO
             console.log(`[Service] Extraindo dados diretamente do DTO`);
             enderecoData = {
                 endereco_cep: dto.endereco_cep,
                 endereco_rua: dto.endereco_rua,
                 endereco_numero: dto.endereco_numero,
                 endereco_complemento: dto.endereco_complemento,
                 endereco_bairro: dto.endereco_bairro,
                 cidade_id: dto.cidade_id,
             };
         }

         console.log(`[Service] Dados de endereço extraídos:`, enderecoData);

         const hasEnderecoData = Object.values(enderecoData).some(value => value !== undefined && value !== null && value !== '');
         console.log(`[Service] Tem dados de endereço (filtrados):`, hasEnderecoData);

         if (Object.keys(dataToUpdate).length === 0 && !hasEnderecoData) {
             console.log(`[Service] Nenhum dado fornecido para atualizar pessoa ${id}.`);
             return this.buscarPessoaPorId(id);
         }

         try {
            // Chama o repositório para atualizar dados da pessoa
            let pessoaAtualizada: Pessoa | null = null;
            if (Object.keys(dataToUpdate).length > 0) {
                pessoaAtualizada = await this.pessoaRepository.atualizar(id, dataToUpdate);
                if (!pessoaAtualizada) {
                     // Repositório retorna null se não encontrou a linha ATIVA para atualizar
                     throw new AppError(`Pessoa com ID ${id} não encontrada ou inativa durante a atualização.`, 404);
                }
            }

            // Atualizar endereço se houver dados
            if (hasEnderecoData) {
                console.log(`[Service] Atualizando endereço para pessoa ${id}`);
                const enderecoAtualizado = await this.pessoaRepository.atualizarEndereco(id, enderecoData);
                if (!enderecoAtualizado) {
                    console.warn(`[Service] Nenhum campo de endereço foi atualizado para pessoa ${id}`);
                }
            }

            // Se não atualizou dados da pessoa, buscar os dados atuais
            if (!pessoaAtualizada) {
                pessoaAtualizada = await this.buscarPessoaPorId(id);
            }

            delete pessoaAtualizada.pessoa_senha; // Remove hash
            console.log(`[Service] Pessoa ${id} atualizada com sucesso.`);
            return pessoaAtualizada;
        } catch (error) {
             if (error instanceof AppError) throw error; // Ex: 409 do repo
             console.error(`[Service] Erro ao atualizar pessoa ${id}:`, error);
             throw new AppError(`Erro interno ao atualizar pessoa ${id}.`, 500, false);
         }
    }

    /**
     * Realiza a exclusão lógica de uma Pessoa (define status como inativo).
     */
    async excluirPessoa(id: number): Promise<void> {
        console.log(`[Service] Tentando desativar pessoa ID: ${id}`);
        // Opcional: buscar primeiro para dar 404 se não existir nem inativo
        // const pessoa = await this.pessoaRepository.findById(id);
        // if (!pessoa) throw new AppError(`Pessoa com ID ${id} não encontrada.`, 404);
        // if (!pessoa.ativo) throw new AppError(`Pessoa com ID ${id} já está inativa.`, 400);

        try {
             // Tenta realizar a exclusão lógica
             const excluido = await this.pessoaRepository.excluir(id);
             // Se repositório retorna false, significa que não achou usuário ativo para excluir
             if (!excluido) {
                  throw new AppError(`Pessoa com ID ${id} não encontrada ou já está inativa.`, 404);
             }
             console.log(`[Service] Pessoa ${id} desativada.`);
             // Retorna void em caso de sucesso
        } catch (error) {
             if (error instanceof AppError) throw error;
             console.error(`[Service] Erro ao excluir pessoa ${id}:`, error);
             throw new AppError(`Erro interno ao excluir pessoa ${id}.`, 500, false);
         }
    }

    /**
     * Lista pessoas (apenas ativos por padrão).
     */
    async listarPessoas(filtrosDto: ListarPessoasQueryDto): Promise<PaginatedServiceResponse<Pessoa>> {
     console.log(`[Service Pessoa] Listando pessoas com filtros DTO:`, filtrosDto);
 
     const page = filtrosDto.page || 1;
     const limit = filtrosDto.limit || 10; // Limite padrão
 
     // Passa o DTO diretamente para o repositório, que sabe como usar seus campos
     try {
       const { data, total } = await this.pessoaRepository.listar(filtrosDto);
 
       const totalPages = Math.ceil(total / limit);
       console.log(`[Service Pessoa] Pessoas listadas: ${data.length} de ${total}. Página ${page}/${totalPages}.`);
 
       return {
           data,
           total,
           page,
           limit,
           totalPages
       };
     } catch (error) {
       if (error instanceof AppError) throw error;
       console.error("[Service Pessoa] Erro ao listar pessoas:", error);
       throw new AppError("Erro interno ao listar pessoas.", 500, false);
     }
   }

}