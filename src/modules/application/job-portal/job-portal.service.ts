import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobPortalDto } from './dto/create-job-portal.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JobPortalService {

  constructor(private readonly prisma: PrismaService) { }

  async create(createJobPortalDto: CreateJobPortalDto) {
    return this.prisma.job.create({
      data: createJobPortalDto,
    });
  }

  async findAll() {
    return this.prisma.job.findMany();
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }

    return job;
  }


  async remove(id: string) {
    // Check if job exists first
    await this.findOne(id);

    return this.prisma.job.delete({
      where: { id },
    });
  }
}
