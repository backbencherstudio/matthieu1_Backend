import { Injectable } from '@nestjs/common';
import { CreateSavedProductDto } from './dto/create-saved-product.dto';
import { UpdateSavedProductDto } from './dto/update-saved-product.dto';

@Injectable()
export class SavedProductService {
  create(createSavedProductDto: CreateSavedProductDto) {
    return 'This action adds a new savedProduct';
  }

  findAll() {
    return `This action returns all savedProduct`;
  }

  findOne(id: number) {
    return `This action returns a #${id} savedProduct`;
  }

  update(id: number, updateSavedProductDto: UpdateSavedProductDto) {
    return `This action updates a #${id} savedProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} savedProduct`;
  }
}
