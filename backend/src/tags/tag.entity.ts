import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
  ManyToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Exclude } from 'class-transformer';
import { Note } from '../notes/note.entity';
import { ApiProperty } from '@nestjs/swagger';

//this means that a user can have a tag with unique name only
//user b tag_name and user a tag_name can exist
@Unique(['user', 'name'])
@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id!: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  @ApiProperty()
  name!: string;

  @CreateDateColumn()
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.tags, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  user!: User;

  @ManyToMany(() => Note, (note) => note.tags)
  @Exclude()
  notes!: Note[];
}
