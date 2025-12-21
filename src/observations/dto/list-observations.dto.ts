import { UnprocessableEntityException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class ListObservationsDto {
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      throw new UnprocessableEntityException('Invalid filter parameter');
    }
  })
  @IsOptional()
  @ApiProperty({
    description: 'Filter criteria',
    required: false,
    type: String,
    examples: {
      Empty: {
        value: null,
      },
      Filtered: {
        value: {
          subjectId: 1,
          analyteId: [3, 4],
          measuredAtFrom: '2025-01-01',
          measuredAtTo: '2025-12-31',
        },
      },
    },
  })
  filter?: {
    subjectId?: number;
    analyteId?: number[];
    measuredAtFrom?: string;
    measuredAtTo?: string;
  };

  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      throw new UnprocessableEntityException('Invalid sort parameter');
    }
  })
  @IsOptional()
  @ApiProperty({
    description: 'Sort order',
    required: false,
    type: String,
    examples: {
      Empty: {
        value: null,
      },
      Sorted: {
        value: { analyteId: 'desc', measuredAt: 'desc' },
      },
    },
  })
  sort?: {
    subjectId?: 'asc' | 'desc';
    analyteId?: 'asc' | 'desc';
    measuredAt?: 'asc' | 'desc';
  };

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({
    description: 'Page number',
    default: 1,
    required: false,
    type: Number,
  })
  page?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({
    description: 'Number of items per page',
    default: 20,
    required: false,
    type: Number,
  })
  limit?: number;
}
