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
import { ApiProperty } from '@nestjs/swagger';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id!: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  @ApiProperty()
  title!: string;

  @Column({
    type: 'text',
  })
  @ApiProperty()
  content!: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  @ApiProperty()
  isArchived!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  @ApiProperty()
  isPublic!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  @ApiProperty()
  isPinned!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  @ApiProperty()
  isFavourite!: boolean;

  @CreateDateColumn()
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  @ApiProperty({ type: String, format: 'date-time', required: false })
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.notes, { onDelete: 'CASCADE' })
  @Exclude()
  user!: User;

  @ManyToMany(() => Tag, (tag) => tag.notes)
  @JoinTable()
  @ApiProperty({ type: () => Tag, isArray: true })
  tags!: Tag[];
}
