import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '../../../common/guard/role/role.enum';
import { Roles } from '../../../common/guard/role/roles.decorator';
import { RolesGuard } from '../../../common/guard/role/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('User')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @ApiResponse({ description: 'Create a user' })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.create(createUserDto);
      return user;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  

  // @ApiResponse({ description: 'Get all users' })
  // @Get('allusers')
  // async findAll(
  //   @Query()
  //   query: {
  //     q?: string;
  //     type?: string;
  //     approved?: string;
  //     page?: number;
  //     limit?: number;
  //   },
  // ) {
  //   try {
  //     const { q, type, approved, page = 1, limit = 10 } = query;
  //     //console.log("lalalala")
  //     const result = await this.userService.findAll({
  //       q,
  //       type,
  //       approved,
  //       page: Number(page),
  //       limit: Number(limit),
  //     });

  //     return result;
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //     };
  //   }
  // }


  @Get('allusers')
async findAll(
  @Query()
  query: {
    q?: string;
    type?: string;
    approved?: string;
    page?: number;
    limit?: number;
    date?: string; // new
    status?: string; // new
    subscription_type?: string; // new
  },
) {
  try {
    const { q, type, approved, page = 1, limit = 10,  status, subscription_type } = query;

    const result = await this.userService.findAll({
      q,
      type,
      approved,
      page: Number(page),
      limit: Number(limit),
      status,
      subscription_type,
    });

    return result;
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}


  // approve user
  @Roles(Role.ADMIN)
  @ApiResponse({ description: 'Approve a user' })
  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    try {
      const user = await this.userService.approve(id);
      return user;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // reject user
  @Roles(Role.ADMIN)
  @ApiResponse({ description: 'Reject a user' })
  @Post(':id/reject')
  async reject(@Param('id') id: string) {
    try {
      const user = await this.userService.reject(id);
      return user;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

 

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userService.update(id, updateUserDto);
      return user;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const user = await this.userService.remove(id);
      return user;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }



  @Roles(Role.ADMIN)
  @ApiResponse({ description: 'Reject a user' })
  @Get('freepremiumuserschart')
  async userChart() {
    try {
      const result = await this.userService.getUserChart();
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Roles(Role.ADMIN)
  @ApiResponse({ description: 'Reject a user' })
  @Get('revenue/chart')
  async userRevenueChart() {
    try {
      const result = await this.userService.getuserRevenueChart();
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Roles(Role.ADMIN)
  @ApiResponse({ description: 'Reject a user' })
  @Get('dashboardData')
  async dashboardDAta() {
    try {
      const result = await this.userService.getdashBoardData();
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
