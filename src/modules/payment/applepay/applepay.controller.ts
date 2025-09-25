import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApplepayService } from './applepay.service';
import { CreateApplepayDto } from './dto/create-applepay.dto';
import { UpdateApplepayDto } from './dto/update-applepay.dto';

@Controller('applepay')
export class ApplepayController {
  constructor(private readonly applepayService: ApplepayService) {}



  
}
