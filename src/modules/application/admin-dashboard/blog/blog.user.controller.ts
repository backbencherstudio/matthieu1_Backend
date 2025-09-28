import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { BlogsService } from './blog.service';

@Controller('blogs')
@UseGuards(JwtAuthGuard) // user must be authenticated to view blogs
export class BlogsPublicController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  findAll() {
    return this.blogsService.findAllUser();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOneUser(id);
  }
}
