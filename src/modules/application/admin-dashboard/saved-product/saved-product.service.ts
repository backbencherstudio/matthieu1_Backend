import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SavedProductService {
    constructor(private prisma: PrismaService) { }

    // 🟢 Add a base product to user's favorites
    async addFavorite(userId: string, baseProductId: string) {
        try {
            return await this.prisma.favorite.create({
                data: { userId, baseProductId },
                include: {
                    baseProduct: {
                        include: {
                            category: true,
                            subcategory: true,
                            variants: {
                                where: { isDefault: true },
                                include: { images: true },
                            },
                        },
                    },
                },
            });
        } catch (e) {
            if (e.code === 'P2002') {
                throw new BadRequestException('Product already saved as favorite');
            }
            throw new BadRequestException('Failed to save product as favorite');
        }
    }

    // 🟡 List all favorite products of a user
    async listFavorites(userId: string) {
        const favorites = await this.prisma.favorite.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                baseProduct: {
                    include: {
                        category: true,
                        subcategory: true,
                        variants: {
                            where: { isDefault: true },
                            include: { images: true },
                        },
                    },
                },
            },
        });

        return favorites.map((fav) => ({
            id: fav.id,
            savedAt: fav.createdAt,
            baseProduct: {
                id: fav.baseProduct.id,
                name: fav.baseProduct.name,
                sku: fav.baseProduct.sku,
                category: fav.baseProduct.category?.name || null,
                subcategory: fav.baseProduct.subcategory?.name || null,
                variants: fav.baseProduct.variants.map((v) => ({
                    id: v.id,
                    color: v.color,
                    size: v.size,
                    price: v.price,
                    stockQuantity: v.stockQuantity,
                    images: v.images.map((img) => ({ id: img.id, url: img.url })),
                })),
            },
        }));
    }

    // 🔴 Remove a favorite product
    async removeFavorite(userId: string, baseProductId: string) {
        const existing = await this.prisma.favorite.findUnique({
            where: { userId_baseProductId: { userId, baseProductId } },
        });

        if (!existing) throw new NotFoundException('Favorite not found');

        await this.prisma.favorite.delete({ where: { id: existing.id } });
        return { success: true, message: 'Favorite removed successfully' };
    }
}
