import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { User } from '../../entities/user.entity';
import { Business } from '../../entities/business.entity';
import { Location } from '../../entities/location.entity';
import { UserSession } from '../../entities/user-session.entity';
import { BusinessStatistic } from '../../entities/business-statistic.entity';
import { SaleInvoice } from '../../entities/sale-invoice.entity';
import { Product } from '../../entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Business,
      Location,
      UserSession,
      BusinessStatistic,
      SaleInvoice,
      Product,
    ]),
  ],
  controllers: [OwnerController],
  providers: [OwnerService],
  exports: [OwnerService],
})
export class OwnerModule {}
