import { ApiProperty } from '@nestjs/swagger';

export class GetResponseDto<T> {
  @ApiProperty()
  readonly data: T;

  constructor(data: T) {
    this.data = data;
  }
}
