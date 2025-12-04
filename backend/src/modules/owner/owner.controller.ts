import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { OwnerService } from './owner.service';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  // Dashboard
  @Get('dashboard')
  async getDashboard(
    @Request() req,
    @Query('location_id') locationId?: string,
  ) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    return this.ownerService.getDashboardStats(businessId, locationId);
  }

  // User Management
  @Get('users')
  async getAllUsers(@Request() req) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    return this.ownerService.findAllUsers(businessId);
  }

  @Post('users')
  async createUser(@Body() data: any, @Request() req) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    const userId = req.user?.userId || req.headers['x-user-id'];
    return this.ownerService.createUser(data, businessId, userId);
  }

  @Put('users/:id')
  async updateUser(
    @Param('id') userId: string,
    @Body() data: any,
    @Request() req,
  ) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    return this.ownerService.updateUser(userId, data, businessId);
  }

  @Put('users/:id/status')
  async updateUserStatus(
    @Param('id') userId: string,
    @Body() body: { status: string },
    @Request() req,
  ) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    return this.ownerService.updateUserStatus(userId, body.status, businessId);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string, @Request() req) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    await this.ownerService.deleteUser(userId, businessId);
    return { message: 'User deactivated successfully' };
  }

  // Business Settings
  @Get('business')
  async getBusinessInfo(@Request() req) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    return this.ownerService.getBusinessInfo(businessId);
  }

  @Put('business')
  async updateBusinessInfo(@Body() data: any, @Request() req) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    return this.ownerService.updateBusinessInfo(businessId, data);
  }

  // Active Sessions
  @Get('sessions')
  async getActiveSessions(@Request() req) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    return this.ownerService.getActiveSessions(businessId);
  }

  // Reports
  @Get('reports/sales')
  async getSalesReport(
    @Request() req,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('location_id') locationId?: string,
  ) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    return this.ownerService.getSalesReport(
      businessId,
      startDate,
      endDate,
      locationId,
    );
  }
}
