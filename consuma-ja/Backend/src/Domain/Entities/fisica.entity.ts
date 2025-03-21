import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Pessoa } from './pessoa.entity';

@Entity()
export class Fisica {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  pessoa_cpf: string;

  @Column({ type: 'tinyint', default: 0 })
  pessoa_documentoValidado: number;

  @Column({ type: 'tinyint', default: 0 })
  pessoa_fotoValidada: number;

  @OneToOne(() => Pessoa)
  @JoinColumn({ name: 'PESSOA_pessoa_id' })
  pessoa: Pessoa;
}
