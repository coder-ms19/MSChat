import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Query,
    UseGuards,
    Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../generated/prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // ==================== DASHBOARD & STATISTICS ====================

    @Get('dashboard')
    @Roles(Role.ADMIN)
    @ApiOperation({
        summary: 'Get admin dashboard statistics',
        description:
            'Get comprehensive dashboard statistics including user counts, posts, groups, and activity metrics.',
    })
    @ApiResponse({
        status: 200,
        description: 'Dashboard statistics retrieved successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    async getDashboardStats() {
        return await this.adminService.getDashboardStats();
    }

    // ==================== USER MANAGEMENT ====================

    @Get('users')
    @Roles(Role.ADMIN)
    @ApiOperation({
        summary: 'Get all users with pagination and filters',
        description:
            'Retrieve paginated list of users with optional search, role, and status filters.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'role', required: false, enum: ['USER', 'ADMIN'] })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: ['active', 'banned'],
    })
    @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    async getAllUsers(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('role') role?: string,
        @Query('status') status?: 'active' | 'banned',
    ) {
        return await this.adminService.getAllUsers(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
            search,
            role,
            status,
        );
    }

    @Get('users/:id')
    @Roles(Role.ADMIN)
    @ApiOperation({
        summary: 'Get user details',
        description: 'Get detailed information about a specific user.',
    })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User details retrieved' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getUserDetails(@Param('id') id: string) {
        return await this.adminService.getUserDetails(id);
    }

    @Post('users/:id/ban')
    @Roles(Role.ADMIN)
    @ApiOperation({
        summary: 'Ban a user',
        description: 'Soft delete a user (ban them from the platform).',
    })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User banned successfully' })
    @ApiResponse({ status: 400, description: 'Cannot ban admin users' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async banUser(
        @Param('id') id: string,
        @Body() body?: { reason?: string },
    ) {
        return await this.adminService.banUser(id, body?.reason);
    }

    @Post('users/:id/unban')
    @Roles(Role.ADMIN)
    @ApiOperation({
        summary: 'Unban a user',
        description: 'Restore a banned user.',
    })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User unbanned successfully' })
    @ApiResponse({ status: 400, description: 'User is not banned' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async unbanUser(@Param('id') id: string) {
        return await this.adminService.unbanUser(id);
    }

    @Delete('users/:id')
    @Roles(Role.ADMIN)
    @ApiOperation({
        summary: 'Delete a user permanently',
        description:
            'Permanently delete a user and all their associated data (posts, messages, etc.).',
    })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User deleted permanently',
    })
    @ApiResponse({ status: 400, description: 'Cannot delete admin users' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async deleteUser(@Param('id') id: string) {
        return await this.adminService.deleteUser(id);
    }

    // ==================== GROUP MANAGEMENT ====================

    @Get('groups')
    @Roles(Role.ADMIN)
    @ApiOperation({
        summary: 'Get all groups with statistics',
        description: 'Retrieve paginated list of all groups with member and message counts.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Groups retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    async getGroupStats(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return await this.adminService.getGroupStats(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    @Delete('groups/:id')
    @Roles(Role.ADMIN)
    @ApiOperation({
        summary: 'Delete a group',
        description: 'Permanently delete a group and all its messages.',
    })
    @ApiParam({ name: 'id', description: 'Group ID' })
    @ApiResponse({ status: 200, description: 'Group deleted successfully' })
    @ApiResponse({ status: 400, description: 'Not a group conversation' })
    @ApiResponse({ status: 404, description: 'Group not found' })
    async deleteGroup(@Param('id') id: string) {
        return await this.adminService.deleteGroup(id);
    }
}

