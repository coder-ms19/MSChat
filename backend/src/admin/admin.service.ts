import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get comprehensive dashboard statistics
     */
    async getDashboardStats() {
        const [
            totalUsers,
            totalPosts,
            totalGroups,
            totalMessages,
            totalCalls,
            bannedUsers,
            activeUsers,
            recentUsers,
            recentPosts,
            recentGroups,
        ] = await Promise.all([
            // Total users count
            this.prisma.user.count({
                where: { deletedAt: null },
            }),
            // Total posts count
            this.prisma.post.count({
                where: { deletedAt: null },
            }),
            // Total groups count
            this.prisma.conversation.count({
                where: {
                    type: 'GROUP',
                    deletedAt: null,
                },
            }),
            // Total messages count
            this.prisma.message.count({
                where: { deletedAt: null },
            }),
            // Total calls count
            this.prisma.call.count(),
            // Banned users count (soft deleted)
            this.prisma.user.count({
                where: { deletedAt: { not: null } },
            }),
            // Active users (online in last 24 hours)
            this.prisma.user.count({
                where: {
                    deletedAt: null,
                    OR: [
                        { isOnline: true },
                        {
                            lastSeen: {
                                gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                            },
                        },
                    ],
                },
            }),
            // Recent users (last 7 days)
            this.prisma.user.count({
                where: {
                    deletedAt: null,
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
            // Recent posts (last 7 days)
            this.prisma.post.count({
                where: {
                    deletedAt: null,
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
            // Recent groups (last 7 days)
            this.prisma.conversation.count({
                where: {
                    type: 'GROUP',
                    deletedAt: null,
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);

        // Get user growth data (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const userGrowth = await this.prisma.user.groupBy({
            by: ['createdAt'],
            where: {
                deletedAt: null,
                createdAt: { gte: thirtyDaysAgo },
            },
            _count: true,
        });

        // Get top active users
        const topUsers = await this.prisma.user.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                _count: {
                    select: {
                        posts: true,
                        messages: true,
                        comments: true,
                    },
                },
            },
            orderBy: {
                posts: {
                    _count: 'desc',
                },
            },
            take: 10,
        });

        return {
            overview: {
                totalUsers,
                totalPosts,
                totalGroups,
                totalMessages,
                totalCalls,
                bannedUsers,
                activeUsers,
            },
            recent: {
                newUsers: recentUsers,
                newPosts: recentPosts,
                newGroups: recentGroups,
            },
            topUsers,
            userGrowth: this.formatGrowthData(userGrowth),
        };
    }

    /**
     * Get all users with pagination and filters
     */
    async getAllUsers(page = 1, limit = 20, search?: string, role?: string, status?: 'active' | 'banned') {
        const skip = (page - 1) * limit;

        const where: any = {};

        // Search filter
        if (search) {
            where.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Role filter
        if (role) {
            where.role = role;
        }

        // Status filter
        if (status === 'banned') {
            where.deletedAt = { not: null };
        } else if (status === 'active') {
            where.deletedAt = null;
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    avatarUrl: true,
                    bio: true,
                    role: true,
                    provider: true,
                    isOnline: true,
                    lastSeen: true,
                    createdAt: true,
                    deletedAt: true,
                    _count: {
                        select: {
                            posts: true,
                            followers: true,
                            following: true,
                            messages: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get user details by ID
     */
    async getUserDetails(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: {
                        posts: true,
                        comments: true,
                        likes: true,
                        followers: true,
                        following: true,
                        messages: true,
                        conversations: true,
                        initiatedCalls: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Get recent activity
        const [recentPosts, recentMessages] = await Promise.all([
            this.prisma.post.findMany({
                where: { authorId: userId, deletedAt: null },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            this.prisma.message.findMany({
                where: { senderId: userId, deletedAt: null },
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
        ]);

        return {
            ...user,
            recentActivity: {
                posts: recentPosts,
                messages: recentMessages,
            },
        };
    }

    /**
     * Ban a user (soft delete)
     */
    async banUser(userId: string, reason?: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role === 'ADMIN') {
            throw new BadRequestException('Cannot ban admin users');
        }

        if (user.deletedAt) {
            throw new BadRequestException('User is already banned');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt: new Date(),
                isOnline: false,
            },
        });

        return {
            success: true,
            message: `User ${user.username} has been banned`,
            user: updatedUser,
        };
    }

    /**
     * Unban a user
     */
    async unbanUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.deletedAt) {
            throw new BadRequestException('User is not banned');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt: null,
            },
        });

        return {
            success: true,
            message: `User ${user.username} has been unbanned`,
            user: updatedUser,
        };
    }

    /**
     * Delete a user permanently
     */
    async deleteUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role === 'ADMIN') {
            throw new BadRequestException('Cannot delete admin users');
        }

        // Delete all user data (similar to deleteTestmailUsers)
        const stats = await this.deleteUserData([userId]);

        return {
            success: true,
            message: `User ${user.username} and all associated data has been permanently deleted`,
            stats,
        };
    }

    /**
     * Get group statistics
     */
    async getGroupStats(page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [groups, total] = await Promise.all([
            this.prisma.conversation.findMany({
                where: {
                    type: 'GROUP',
                    deletedAt: null,
                },
                select: {
                    id: true,
                    name: true,
                    iconUrl: true,
                    createdAt: true,
                    owner: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                    _count: {
                        select: {
                            users: true,
                            messages: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.conversation.count({
                where: {
                    type: 'GROUP',
                    deletedAt: null,
                },
            }),
        ]);

        return {
            groups,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Delete a group
     */
    async deleteGroup(groupId: string) {
        const group = await this.prisma.conversation.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        if (group.type !== 'GROUP') {
            throw new BadRequestException('This is not a group conversation');
        }

        // Delete all group data
        await this.prisma.$transaction([
            // Delete conversation reads
            this.prisma.conversationRead.deleteMany({
                where: { conversationId: groupId },
            }),
            // Delete message reads for messages in this conversation
            this.prisma.messageRead.deleteMany({
                where: {
                    message: {
                        conversationId: groupId,
                    },
                },
            }),
            // Delete attachments
            this.prisma.attachment.deleteMany({
                where: {
                    message: {
                        conversationId: groupId,
                    },
                },
            }),
            // Delete messages
            this.prisma.message.deleteMany({
                where: { conversationId: groupId },
            }),
            // Delete conversation users
            this.prisma.conversationUser.deleteMany({
                where: { conversationId: groupId },
            }),
            // Delete the conversation
            this.prisma.conversation.delete({
                where: { id: groupId },
            }),
        ]);

        return {
            success: true,
            message: `Group ${group.name || 'Unnamed'} has been deleted`,
        };
    }

    /**
     * Helper method to delete user data
     */
    private async deleteUserData(userIds: string[]) {
        const stats = {
            users: 0,
            posts: 0,
            comments: 0,
            likes: 0,
            attachments: 0,
            messages: 0,
            conversations: 0,
            calls: 0,
        };

        // Get all post IDs
        const userPosts = await this.prisma.post.findMany({
            where: { authorId: { in: userIds } },
            select: { id: true },
        });
        const postIds = userPosts.map((post) => post.id);

        if (postIds.length > 0) {
            const [likes, comments, attachments, postStats, posts] = await Promise.all([
                this.prisma.like.deleteMany({ where: { postId: { in: postIds } } }),
                this.prisma.comment.deleteMany({ where: { postId: { in: postIds } } }),
                this.prisma.attachment.deleteMany({ where: { postId: { in: postIds } } }),
                this.prisma.postStats.deleteMany({ where: { postId: { in: postIds } } }),
                this.prisma.post.deleteMany({ where: { id: { in: postIds } } }),
            ]);
            stats.likes = likes.count;
            stats.comments = comments.count;
            stats.attachments = attachments.count;
            stats.posts = posts.count;
        }

        // Delete messages and related data
        const userMessages = await this.prisma.message.findMany({
            where: { senderId: { in: userIds } },
            select: { id: true },
        });
        const messageIds = userMessages.map((msg) => msg.id);

        if (messageIds.length > 0) {
            const [messageReads, messageAttachments, messages] = await Promise.all([
                this.prisma.messageRead.deleteMany({ where: { messageId: { in: messageIds } } }),
                this.prisma.attachment.deleteMany({ where: { messageId: { in: messageIds } } }),
                this.prisma.message.deleteMany({ where: { id: { in: messageIds } } }),
            ]);
            stats.attachments += messageAttachments.count;
            stats.messages = messages.count;
        }

        // Delete conversations
        const [conversationReads, conversationUsers, conversations] = await Promise.all([
            this.prisma.conversationRead.deleteMany({ where: { userId: { in: userIds } } }),
            this.prisma.conversationUser.deleteMany({ where: { userId: { in: userIds } } }),
            this.prisma.conversation.deleteMany({ where: { ownerId: { in: userIds } } }),
        ]);
        stats.conversations = conversations.count;

        // Delete calls
        const userCalls = await this.prisma.call.findMany({
            where: { initiatorId: { in: userIds } },
            select: { id: true },
        });
        const callIds = userCalls.map((call) => call.id);

        if (callIds.length > 0) {
            const [callEvents, callParticipants, calls] = await Promise.all([
                this.prisma.callEvent.deleteMany({ where: { callId: { in: callIds } } }),
                this.prisma.callParticipant.deleteMany({ where: { callId: { in: callIds } } }),
                this.prisma.call.deleteMany({ where: { id: { in: callIds } } }),
            ]);
            stats.calls = calls.count;
        }

        // Delete follows
        await this.prisma.follow.deleteMany({
            where: {
                OR: [{ followerId: { in: userIds } }, { followingId: { in: userIds } }],
            },
        });

        // Delete users
        const deletedUsers = await this.prisma.user.deleteMany({
            where: { id: { in: userIds } },
        });
        stats.users = deletedUsers.count;

        return stats;
    }

    /**
     * Format growth data for charts
     */
    private formatGrowthData(data: any[]) {
        const dailyData = new Map<string, number>();

        data.forEach((item) => {
            const date = new Date(item.createdAt).toISOString().split('T')[0];
            dailyData.set(date, (dailyData.get(date) || 0) + 1);
        });

        return Array.from(dailyData.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
}
