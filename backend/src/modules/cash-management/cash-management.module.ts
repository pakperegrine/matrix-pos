import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashManagementController } from './cash-management.controller';
import { CashManagementService } from './cash-management.service';
import { CashShift } from '../../entities/cash-shift.entity';
import { CashMovement } from '../../entities/cash-movement.entity';
import { DrawerEvent } from '../../entities/drawer-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CashShift, CashMovement, DrawerEvent])
  ],
  controllers: [CashManagementController],
  providers: [CashManagementService],
  exports: [CashManagementService]
})
export class CashManagementModule {}
