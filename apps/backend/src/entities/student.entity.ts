import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum StudentState {
  NORMAL = 'NORMAL',
  GRADUATE = 'GRADUATE',
  DELETED = 'DELETED',
}

export enum StudentType {
  EXAMINEE = 'EXAMINEE',
  DROPPER = 'DROPPER',
  ADULT = 'ADULT',
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: StudentState, default: StudentState.NORMAL })
  state: StudentState = StudentState.NORMAL;

  @Column({ type: 'enum', enum: StudentType })
  type!: StudentType;

  @Column()
  region!: string;

  @Column()
  age!: number;

  @Column({ nullable: true, default: '' })
  description: string = '';

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ nullable: true, type: 'date' })
  endDate!: Date;

  @Column()
  parentInfo!: string;

  @Column()
  phoneNumber!: string;
}
