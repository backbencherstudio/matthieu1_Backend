import { Controller, Patch, UseGuards, Req } from '@nestjs/common';
import { AccountPrivacyService } from './account-privacy.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';


@Controller('account-privacy')
export class AccountPrivacyController {
  constructor(private readonly accountPrivacyService: AccountPrivacyService) {}

  @Patch('toggle')
  @UseGuards(JwtAuthGuard)  
  async togglePrivacy( @User() user: any) {
    const userId = user.userId;  

    const result = await this.accountPrivacyService.togglePrivacy(userId);
    
    return result;
  }
}
