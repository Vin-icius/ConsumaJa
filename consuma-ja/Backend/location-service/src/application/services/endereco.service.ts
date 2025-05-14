import { Endereco } from "../../domain/entities/endereco.entity";
import { EnderecoRepository, CreateEnderecoRepoData, UpdateEnderecoRepoData, PaginatedRepositoryResponse } from "../../domain/repositories/endereco.repository";
import { CreateEnderecoDto } from "../../interfaces/dtos/create-endereco-dto";
import { UpdateEnderecoDto } from "../../interfaces/dtos/update-endereco.dto";
import { ListarEnderecosQueryDto } from "../../interfaces/dtos/listar-enderecos-query.dto";
import { AppError } from "../../common/errors/app-error";
// Importar CidadeRepository/Service para validar CIDADE_cidade_id
// Importar PessoaRepository/Service (do pessoa-service via HTTP ou repo local) para validar PESSOA_pessoa_id

// Tipo para resposta paginada do Serviço
export interface PaginatedServiceResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class EnderecoService {
    constructor(
        private enderecoRepository: EnderecoRepository
        // private cidadeRepository: CidadeRepository, // Para validar cidade
        // private pessoaHttpService: PessoaHttpService, // Para validar pessoa
    ) {}

    private async validarDependencias(cidadeId: number, pessoaId: number): Promise<void> {
        // TODO: Validar se a cidadeId existe (usando CidadeRepository/Service)
        // Ex: const cidade = await this.cidadeRepository.buscarPorId(cidadeId);
        //     if (!cidade || !cidade.ativo) throw new AppError("Cidade inválida ou inativa.", 400);

        // TODO: Validar se a pessoaId existe (usando PessoaRepository/Service - pode ser chamada HTTP)
        // Ex: const pessoa = await this.pessoaHttpService.buscarPorId(pessoaId);
        //     if (!pessoa || !pessoa.ativo) throw new AppError("Pessoa inválida ou inativa.", 400);
        console.log(`[Service Endereco] Validação de Cidade ${cidadeId} e Pessoa ${pessoaId} pendente.`);
    }

    async criarEndereco(dto: CreateEnderecoDto): Promise<Endereco> {
        await this.validarDependencias(dto.CIDADE_cidade_id, dto.PESSOA_pessoa_id);

        // Opcional: Checar se já existe um endereço idêntico para esta pessoa
        // const existente = await this.enderecoRepository.findByDetailsAndPessoaId(...);
        // if (existente) throw new AppError("Endereço já cadastrado para esta pessoa.", 409);

        const dataRepo: CreateEnderecoRepoData = {
            ...dto,
            cep: dto.cep.replace(/\D/g, ''), // Limpa CEP
            ativo: true // Novo endereço sempre ativo
        };
        try {
            return await this.enderecoRepository.criar(dataRepo);
        } catch (error) { /* ... */ if (error instanceof AppError) throw error; throw new AppError("Erro interno.", 500, false); }
    }

    async listar(filtrosDto: ListarEnderecosQueryDto): Promise<PaginatedServiceResponse<Endereco>> {
        const page = filtrosDto.page || 1;
        const limit = filtrosDto.limit || 100;
        const filtrosRepo = { ...filtrosDto } as any;
        if (filtrosDto.ativo !== undefined) {
            filtrosRepo.ativo = filtrosDto.ativo === 'true'; // Converte string para boolean
        }
        // Aqui, filtrosRepo.pessoaId ainda será o número 14 (transformado pelo @Type no DTO)
        const { data, total } = await this.enderecoRepository.listar(filtrosRepo); // Passa para o repo
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async buscarEnderecoPorId(id: number): Promise<Endereco> {
        try {
            const endereco = await this.enderecoRepository.buscarPorId(id, true); // Apenas ativos
            if (!endereco) throw new AppError(`Endereço ID ${id} não encontrado ou inativo.`, 404);
            return endereco;
        } catch (error) { /* ... */ if (error instanceof AppError) throw error; throw new AppError("Erro interno.", 500, false); }
    }

    async atualizarEndereco(id: number, dto: UpdateEnderecoDto): Promise<Endereco> {
        await this.buscarEnderecoPorId(id); // Garante que existe e está ativo

        // Se CIDADE_cidade_id está sendo alterada, validar nova cidade
        if (dto.CIDADE_cidade_id) {
            // await this.validarDependencias(dto.CIDADE_cidade_id, 0); // 0 para pessoaId pois não estamos validando-a aqui
        }
        const dataRepo: UpdateEnderecoRepoData = { ...dto };
         if (dataRepo.cep) dataRepo.cep = dataRepo.cep.replace(/\D/g, '');

        try {
            const atualizado = await this.enderecoRepository.atualizar(id, dataRepo);
            if (!atualizado) throw new AppError(`Endereço ID ${id} não encontrado ou falha ao atualizar.`, 404);
            return atualizado;
        } catch (error) { /* ... */ if (error instanceof AppError) throw error; throw new AppError("Erro interno.", 500, false); }
    }

    async excluirEndereco(id: number): Promise<void> {
        try {
            const excluido = await this.enderecoRepository.excluir(id);
            if (!excluido) throw new AppError(`Endereço ID ${id} não encontrado ou já inativo.`, 404);
        } catch (error) { /* ... */ if (error instanceof AppError) throw error; throw new AppError("Erro interno.", 500, false); }
    }
}