import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ColorSizeService } from './color-size.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';

@Controller("add")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ColorSizeController {
    constructor(private readonly service: ColorSizeService) { }

    // Color endpoints
    @Post('color')
    createColor(@Body() dto: CreateColorDto) {
        return this.service.createColor(dto);
    }

    @Get('color')
    findAllColors() {
        return this.service.findAllColors();
    }

    @Delete('color/:id')
    async removeColor(@Param('id') id: string) {
        return {
            success: true,
            message: 'Color deleted successfully',
            data: await this.service.removeColor(id)
        }

    }

    // Size endpoints
    @Post('size')
    createSize(@Body() dto: CreateSizeDto) {
        return this.service.createSize(dto);
    }

    @Get('size')
    findAllSizes() {
        return this.service.findAllSizes();
    }

    @Delete('size/:id')
    async removeSize(@Param('id') id: string) {
        return {
            success: true,
            message: 'Size deleted successfully',
            data: await this.service.removeSize(id)
        }
    }
}
