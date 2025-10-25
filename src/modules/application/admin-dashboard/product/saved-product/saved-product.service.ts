import { Injectable } from '@nestjs/common';
import { CreateSavedProductDto } from './dto/create-saved-product.dto';
import { UpdateSavedProductDto } from './dto/update-saved-product.dto';

@Injectable()
export class SavedBaseProductService {
  create(createSavedProductDto: CreateSavedProductDto) {
    return 'This action adds a new savedBaseProduct';
  }

  findAll() {
    return `This action returns all savedBaseProducts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} savedBaseProduct`;
  }

  update(id: number, updateSavedProductDto: UpdateSavedProductDto) {
    return `This action updates a #${id} savedBaseProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} savedBaseProduct`;
  }
}
