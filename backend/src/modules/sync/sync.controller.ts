import { Body, Controller, Post, Req } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private svc: SyncService) {}

  @Post('offline-sale')
  async offlineSale(@Req() req: any, @Body() body: any) {
    const businessId = req.businessId;
    return this.svc.ingestOfflineSale(businessId, body);
  }
}
