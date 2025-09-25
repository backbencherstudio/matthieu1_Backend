import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateBlogDto {
    @ApiProperty({ description: 'Blog title' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Blog content' })
    @IsString()
    content: string;

    @ApiProperty({ description: 'Blog description' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Blog image URL' })
    @IsString()
    @IsOptional()
    image?: string;

    @ApiProperty({ description: 'Blog tags' })
    @IsArray()
    @IsOptional()
    tags?: string[];

    @ApiProperty({ description: 'Blog status (draft or published)' })
    @IsString()
    @IsOptional()
    status?: string;
}
