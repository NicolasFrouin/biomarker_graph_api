import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class GetSummaryDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({ example: 1, type: Number })
  subjectId!: number;

  @IsNotEmpty()
  @ApiProperty({ example: '2161-8', type: String })
  loinc!: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({
    description: 'Time window in days',
    type: Number,
    required: false,
    examples: {
      Empty: { value: null },
      '2 days': { value: 2 },
      '5 days': { value: 5 },
    },
  })
  window?: number;
}
