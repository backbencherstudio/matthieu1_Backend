import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobPortalDto } from './dto/create-job-portal.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JobUploadService } from './job-upload.service';

@Injectable()
export class JobPortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobUploadService: JobUploadService,
  ) {}

  async create(createJobPortalDto: CreateJobPortalDto) {
    await this.prisma.job.create({
      data: createJobPortalDto,
    });
    return {
      message: 'Job application submitted successfully',
      success: true,
      data: true,
    };
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.job.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
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
    const job = await this.findOne(id);

    console.log(`Deleting job ${id} with files:`, job.files);

    // Delete associated files from storage if they exist
    if (job.files) {
      await this.jobUploadService.deleteMany(job.files);
    } else {
      console.log('No files to delete for this job');
    }

    // Delete the job record from database
    return this.prisma.job.delete({
      where: { id },
    });
  }
}
