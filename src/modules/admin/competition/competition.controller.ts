import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards
} from '@nestjs/common';
import { CompetitionService } from './competition.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';

@ApiBearerAuth()
@ApiTags('Competition')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('competitions')
export class CompetitionController {
  constructor(private readonly competitionService: CompetitionService) { }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateCompetitionDto) {
    return this.competitionService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
    @Query('location') location?: string,
    @Query('discipline') discipline?: string
  ) {
    return this.competitionService.findAll(
      parseInt(page),
      parseInt(limit),
      search,
      location,
      discipline
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.competitionService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCompetitionDto) {
    return this.competitionService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.competitionService.remove(id);
  }
}

