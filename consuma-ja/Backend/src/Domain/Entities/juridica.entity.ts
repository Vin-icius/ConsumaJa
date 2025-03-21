import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Pessoa } from './pessoa.entity';

@Entity()
export class Juridica {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  fornecedor_cnpj: string;

  @Column()
  fornecedor_num: number;

  @OneToOne(() => Pessoa)
  @JoinColumn({ name: 'PESSOA_pessoa_id' })
  pessoa: Pessoa;
}
