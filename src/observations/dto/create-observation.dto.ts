import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { Observation as TObservation } from 'prisma/generated/client';

export class CreateObservationDto implements Partial<TObservation> {
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: new Date(Date.now() - 60 * 60 * 24 * 1000).toISOString(),
  })
  measuredAt!: Date;

  @IsInt()
  @IsPositive()
  @ApiProperty({ example: 1 })
  subjectId!: number;

  @IsInt()
  @IsPositive()
  @ApiProperty({ example: 1 })
  analyteId!: number;

  @IsNumber()
  @ApiProperty({ example: 42.0 })
  value!: number;

  @IsInt()
  @IsPositive()
  @ApiProperty({ example: 1 })
  analyteAllowedUnitId!: number;
}
