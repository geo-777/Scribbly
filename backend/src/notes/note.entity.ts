import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Exclude } from 'class-transformer';
import { Tag } from '../tags/tag.entity';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  title!: string;

  @Column({
    type: 'text',
  })
  content!: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  isArchived!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  isPublic!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  isPinned!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  isFavourite!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.notes, { onDelete: 'CASCADE' })
  @Exclude()
  user!: User;

  @ManyToMany(() => Tag, (tag) => tag.notes)
  @JoinTable()
  tags!: Tag[];
}
