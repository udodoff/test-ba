import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import Product from 'src/_entity/product.entity';
import { Repository } from 'typeorm';
import { PageDto, PageMetaDto, PageOptionsDto } from 'src/_dto/pagination.dto';
import { StorageService } from 'src/storage/storage.service';
import { GetResponseDto } from 'src/_dto/get-response.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly storageService: StorageService,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    if (!createProductDto.image) {
      return this.productsRepository
        .createQueryBuilder()
        .insert()
        .values(createProductDto)
        .returning('*')
        .execute();
    }

    const uploadImageResult = await this.storageService.uploadImage(createProductDto.image);

    const url: string =
      uploadImageResult && !Array.isArray(uploadImageResult)
        ? uploadImageResult.Location
        : uploadImageResult[0].Location;

    return this.productsRepository
      .createQueryBuilder()
      .insert()
      .values({ ...createProductDto, imageUrl: url })
      .returning('*')
      .execute();
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<Product>> {
    const queryBuilder = this.productsRepository.createQueryBuilder('product');

    queryBuilder
      .where('product.name ILIKE :search', { search: `%${pageOptionsDto.search}%` })
      .orderBy('product.price', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  async findOne(id: number): Promise<GetResponseDto<Product> | null> {
    const product = await this.productsRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .getOne();

    return new GetResponseDto(product);
  }

  async update(updateProductDto: UpdateProductDto) {
    const queryBuilder = this.productsRepository.createQueryBuilder('product');

    if (!updateProductDto.image) {
      return this.productsRepository
        .createQueryBuilder()
        .update(Product)
        .set(updateProductDto as Omit<UpdateProductDto, 'imageUrl'>)
        .where('id = :id', { id: updateProductDto.id })
        .returning('*')
        .execute();
    }

    const { imageUrl } = await queryBuilder.where('id = :id', { id: updateProductDto.id }).getOne();

    if (imageUrl && imageUrl.length) this.storageService.deleteImage(imageUrl);

    const uploadImageResult = await this.storageService.uploadImage(updateProductDto.image);

    const url: string =
      uploadImageResult && !Array.isArray(uploadImageResult)
        ? uploadImageResult.Location
        : uploadImageResult[0].Location;

    delete updateProductDto.image;

    return this.productsRepository
      .createQueryBuilder()
      .update(Product)
      .set({ ...updateProductDto, imageUrl: url })
      .where('id = :id', { id: updateProductDto.id })
      .returning('*')
      .execute();
  }

  async remove(id: number): Promise<void> {
    const { imageUrl } = await this.productsRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .getOne();
    if (imageUrl && imageUrl.length) this.storageService.deleteImage(imageUrl);

    await this.productsRepository.createQueryBuilder().delete().where('id = :id', { id }).execute();
  }
}
