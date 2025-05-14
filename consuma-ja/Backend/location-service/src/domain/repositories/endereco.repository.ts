import { Endereco } from "../entities/endereco.entity";
import { CreateEnderecoDto } from "../../interfaces/dtos/create-endereco-dto"; // DTO para criação
import { UpdateEnderecoDto } from "../../interfaces/dtos/update-endereco.dto"; // DTO para atualização
import { ListarEnderecosQueryDto } from "../../interfaces/dtos/listar-enderecos-query.dto";

// Tipo para resposta paginada do repositório
export interface PaginatedRepositoryResponse<T> {
  data: T[];
  total: number;
}

// Dados que o repositório espera para criar (após tratamento no serviço)
export type CreateEnderecoRepoData = CreateEnderecoDto & { ativo: boolean }; // Serviço pode definir 'ativo'
// Dados que o repositório espera para atualizar
export type UpdateEnderecoRepoData = UpdateEnderecoDto;


export interface EnderecoRepository {
  criar(data: CreateEnderecoRepoData): Promise<Endereco>;
  listar(filtros: ListarEnderecosQueryDto): Promise<PaginatedRepositoryResponse<Endereco>>;
  buscarPorId(endereco_id: number, apenasAtivos?: boolean): Promise<Endereco | null>;
  // buscarPorPessoaId(pessoa_id: number, apenasAtivos?: boolean): Promise<Endereco[]>; // Implementado em listar com filtro
  atualizar(endereco_id: number, data: UpdateEnderecoRepoData): Promise<Endereco | null>;
  excluir(endereco_id: number): Promise<boolean>; // Exclusão lógica
  // Adicionar método para verificar se um endereço específico já existe para uma pessoa (rua, numero, cep, pessoa_id)
  // findByDetailsAndPessoaId(details: Pick<Endereco, 'rua' | 'numero' | 'cep' | 'PESSOA_pessoa_id'>): Promise<Endereco | null>;
}