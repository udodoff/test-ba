import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as shortid from 'shortid';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @Column()
  name: string;

  @IsString()
  @Column()
  description: string;

  @IsNumber()
  @Column({ type: 'float' })
  price: number;

  @IsOptional()
  @IsNumber()
  @Column({ type: 'float', nullable: true, default: null })
  discountedPrice?: number;

  @IsString()
  @Column('varchar', { length: 10, default: () => `'${shortid.generate()}'` })
  partNumber: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true, default: null })
  imageUrl?: string;
}

export default Product;
