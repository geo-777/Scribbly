import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Tag } from '../tags/tag.entity';

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

  @OneToMany(() => Tag, (tag) => tag.user)
  tags!: Tag[];
}
