import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'businesses' })
export class Business {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ nullable: true })
  name: string;
}
