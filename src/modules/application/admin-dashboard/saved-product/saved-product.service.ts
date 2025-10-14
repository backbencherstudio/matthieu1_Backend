import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SavedProductService {
    constructor(private prisma: PrismaService) { }

    async addFavorite(userId: string, productId: string) {
        try {
            return await this.prisma.favorite.create({
                data: { userId, productId },
                include: { product: { include: { images: true, subcategory: true } } },
            });
        } catch (e) {
            // Unique constraint => already favorited
            throw new BadRequestException('Product already saved as favorite');
        }
    }

    async listFavorites(userId: string) {
        const favorites = await this.prisma.favorite.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { product: { include: { images: true, subcategory: true } } },
        });

        return favorites.map(f => ({
            id: f.id,
            productId: f.productId,
            savedAt: f.createdAt,
            product: {
                id: f.product.id,
                name: f.product.name,
                sku: f.product.sku,
                price: f.product.price,
                discountPrice: f.product.discountPrice,
                color: f.product.color,
                size: f.product.size,
                subcategory: f.product.subcategory,
                images: f.product.images,
            },
        }));
    }

    async removeFavorite(userId: string, productId: string) {
        const existing = await this.prisma.favorite.findUnique({
            where: { userId_productId: { userId, productId } },
        });
        if (!existing) throw new NotFoundException('Favorite not found');

        await this.prisma.favorite.delete({ where: { id: existing.id } });
        return { success: true };
    }
}
