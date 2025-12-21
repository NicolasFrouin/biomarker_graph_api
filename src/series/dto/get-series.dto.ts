import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class GetSeriesDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({ example: 1, type: Number })
  subjectId!: number;

  @IsNotEmpty()
  @ApiProperty({ example: '2161-8', type: String })
  loinc!: string;

  @IsOptional()
  @ApiProperty({ example: 'mg/dL', type: String, required: false })
  targetUnit!: string;
}
