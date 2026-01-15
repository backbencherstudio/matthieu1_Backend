import { Injectable } from '@nestjs/common';
import { CreateSadlleDto } from './dto/create-sadlle.dto';
import { UpdateSadlleDto } from './dto/update-sadlle.dto';

@Injectable()
export class SadllesService {
  create(createSadlleDto: CreateSadlleDto) {
    return 'This action adds a new sadlle';
  }

  findAll() {
    return `This action returns all sadlles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sadlle`;
  }

  update(id: number, updateSadlleDto: UpdateSadlleDto) {
    return `This action updates a #${id} sadlle`;
  }

  remove(id: number) {
    return `This action removes a #${id} sadlle`;
  }
}
