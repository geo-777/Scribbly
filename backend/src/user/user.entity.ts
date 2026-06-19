import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
  })
  username!: string;
  @Column({
    type: 'varchar',
    length: 254,
    unique: true,
  })
  email!: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  @Exclude()
  password!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
