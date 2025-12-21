import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { GetSummaryDto } from './dto/get-summary.dto';
import { SummaryService } from './summary.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('summary')
export class SummaryController {
  constructor(
    private readonly summaryService: SummaryService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Return latest value and trend analysis for a given subject and analyte',
  })
  async getSummary(@Query() getSummaryDto: GetSummaryDto) {
    const { subjectId, loinc, window } = getSummaryDto;

    const subject = await this.prismaService.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject) {
      throw new BadRequestException('Invalid subjectId');
    }

    const analyte = await this.prismaService.analyte.findFirst({
      where: { loincCode: loinc },
    });
    if (!analyte) {
      throw new BadRequestException('Invalid loinc');
    }

    return this.summaryService.getSummary(subject, analyte, window);
  }
}
