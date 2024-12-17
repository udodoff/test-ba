import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Product from 'src/_entity/product.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), ConfigModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
