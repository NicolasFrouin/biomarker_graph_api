import { PartialType } from '@nestjs/mapped-types';
import { CreateObservationDto } from './create-observation.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateObservationDto extends PartialType(CreateObservationDto) {
  @ApiProperty({
    example: 5,
  })
  value?: number;
}
