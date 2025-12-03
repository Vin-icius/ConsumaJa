import { SessaoUsuario, SessaoUsuarioCreate } from '../entities/sessao-usuario.entity';

export interface SessaoUsuarioRepository {
  criarSessao(payload: SessaoUsuarioCreate): Promise<SessaoUsuario>;
  encontrarSessaoPorId(sessaoId: string): Promise<SessaoUsuario | null>;
  encontrarSessaoAtivaPorPessoa(pessoaId: number): Promise<SessaoUsuario | null>;
  atualizarUltimaValidacao(sessaoId: string): Promise<void>;
  invalidarSessao(sessaoId: string): Promise<void>;
  invalidarSessoesPorPessoa(pessoaId: number): Promise<void>;
}
