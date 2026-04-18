import { Transform } from 'class-transformer';
import { IsOptional, IsArray, IsString } from 'class-validator';

const normalizeArray = ({ value }: { value: any }) => {
  if (Array.isArray(value)) return value;
  return [value];
};

export class UpdateSadlleDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  header_title?: string;

  @IsOptional()
  header_description?: string;

  @IsOptional()
  price?: string;

  @IsOptional()
  @Transform(normalizeArray)
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

  @IsOptional()
  description?: string;

  @IsOptional()
  @Transform(normalizeArray)
  @IsArray()
  colors?: string[];

  @IsOptional()
  @Transform(normalizeArray)
  @IsArray()
  piping_color?: string[];

  @IsOptional()
  @Transform(normalizeArray)
  @IsArray()
  leather_type?: string[];

  @IsOptional()
  @Transform(normalizeArray)
  @IsArray()
  images?: string[];
}
