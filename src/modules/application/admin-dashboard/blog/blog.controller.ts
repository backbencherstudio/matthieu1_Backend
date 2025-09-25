import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/role/roles.guard';
import { User } from '../../../../common/decorators/user.decorator';

@ApiTags('Blog')
@Controller('admin/blog')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new blog post' })
  async create(@Body() createBlogDto: CreateBlogDto, @User() user: any) {
    return this.blogService.create(createBlogDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blog posts' })
  async findAll(
    @Query('q') q: string,
    @Query('status') status: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.blogService.findAll({
      q,
      status,
      page: page ? parseInt(page.toString()) : 1,
      limit: limit ? parseInt(limit.toString()) : 10,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a blog post by id' })
  async findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a blog post by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a blog post' })
  async update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogService.update(id, updateBlogDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a blog post' })
  async remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
