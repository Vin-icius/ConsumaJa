import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne } from 'typeorm';
import { Fisica } from './fisica.entity';
import { Juridica } from './juridica.entity';

@Entity()
export class Pessoa {
  @PrimaryGeneratedColumn()
  pessoa_id: number;

  @Column()
  pessoa_nome: string;

  @Column({ unique: true })
  pessoa_email: string;

  @Column()
  pessoa_telefone: string;

  @Column({ type: 'enum', enum: ['Fisica', 'Juridica', 'Admin'] })
  pessoa_tipo: string;

  @Column({ unique: true, nullable: true })
  pessoa_login: string; // Apenas Admin terá login específico

  @Column()
  pessoa_senha: string;

  @Column({ type: 'tinyint', default: 1 })
  pessoa_status: number;

  @CreateDateColumn()
  data_criacao: Date;

  @OneToOne(() => Fisica, (fisica) => fisica.pessoa)
  fisica: Fisica;

  @OneToOne(() => Juridica, (juridica) => juridica.pessoa)
  juridica: Juridica;
}
