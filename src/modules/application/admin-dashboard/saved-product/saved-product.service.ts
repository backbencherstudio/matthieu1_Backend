import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { resolveCurrencyFromCountry } from 'src/common/utils/currency.util';
import { resolveRegionFromCountry } from 'src/common/utils/region.util';

@Injectable()
export class SavedProductService {
  constructor(private prisma: PrismaService) {}

  private formatPrice(product: any, country?: string) {
    const currency = resolveCurrencyFromCountry(country);

    if (product.price_usd && product.price_eur) {
      // For products with separate USD/EUR prices (saddles)
      const price = currency === 'USD' ? product.price_usd : product.price_eur;
      return {
        price: parseFloat(price),
        currency,
      };
    } else if (product.basePrice_usd && product.basePrice_eur) {
      // For used saddles
      const price =
        currency === 'USD' ? product.basePrice_usd : product.basePrice_eur;
      return {
        price,
        currency,
      };
    } else if (product.price_usd || product.price_eur) {
      // For variant-based products (tack products)
      const price = currency === 'USD' ? product.price_usd : product.price_eur;
      return {
        price,
        currency,
      };
    }

    return {
      price: null,
      currency,
    };
  }

  // ---------------- ADD FAVORITE ----------------
  // async addFavorite(
  //   userId: string,
  //   tackProductId?: string,
  //   saddleProductId?: string,
  // ) {
  //   if (!tackProductId && !saddleProductId) {
  //     throw new BadRequestException(
  //       'Either tackProductId or saddleProductId is required',
  //     );
  //   }

  //   if (tackProductId && saddleProductId) {
  //     throw new BadRequestException(
  //       'Only one product type can be saved at a time',
  //     );
  //   }

  //   // ---------------- TACK PRODUCT ----------------
  //   if (tackProductId) {
  //     const product = await this.prisma.tackProduct.findUnique({
  //       where: { id: tackProductId },
  //     });

  //     if (!product) {
  //       throw new NotFoundException('Tack product not found');
  //     }

  //     try {
  //       return await this.prisma.favorite.create({
  //         data: { userId, tackProductId },
  //         include: {
  //           tackProduct: {
  //             include: {
  //               variants: {
  //                 where: { isDefault: true },
  //                 include: { images: true },
  //               },
  //             },
  //           },
  //         },
  //       });
  //     } catch (e: any) {
  //       if (e.code === 'P2002') {
  //         throw new BadRequestException(
  //           'Tack product already saved as favorite',
  //         );
  //       }
  //       throw new BadRequestException('Failed to save tack product');
  //     }
  //   }

  //   // ---------------- SADDLE PRODUCT ----------------
  //   if (saddleProductId) {
  //     const product = await this.prisma.saddlesProduct.findUnique({
  //       where: { id: saddleProductId },
  //     });

  //     if (!product) {
  //       throw new NotFoundException('Saddle product not found');
  //     }

  //     try {
  //       return await this.prisma.favorite.create({
  //         data: { userId, saddleProductId },
  //         include: {
  //           saddleProduct: {
  //             include: {
  //               images: {
  //                 take: 1,
  //               },
  //             },
  //           },
  //         },
  //       });
  //     } catch (e: any) {
  //       if (e.code === 'P2002') {
  //         throw new BadRequestException(
  //           'Saddle product already saved as favorite',
  //         );
  //       }
  //       throw new BadRequestException('Failed to save saddle product');
  //     }
  //   }

  //   throw new BadRequestException('Invalid product type');
  // }

  async addFavorite(
    userId: string,
    tackProductId?: string,
    saddleProductId?: string,
    usedSaddleProductId?: string, // Added usedSaddleProductId
  ) {
    if (!tackProductId && !saddleProductId && !usedSaddleProductId) {
      throw new BadRequestException(
        'Either tackProductId, saddleProductId, or usedSaddleProductId is required',
      );
    }

    if (
      (tackProductId && saddleProductId) ||
      (tackProductId && usedSaddleProductId) ||
      (saddleProductId && usedSaddleProductId)
    ) {
      throw new BadRequestException(
        'Only one product type can be saved at a time',
      );
    }

    // ---------------- TACK PRODUCT ----------------
    if (tackProductId) {
      const product = await this.prisma.tackProduct.findUnique({
        where: { id: tackProductId },
      });

      if (!product) {
        throw new NotFoundException('Tack product not found');
      }

      try {
        return await this.prisma.favorite.create({
          data: { userId, tackProductId },
          include: {
            tackProduct: {
              include: {
                variants: {
                  where: { isDefault: true },
                  include: { images: true },
                },
              },
            },
          },
        });
      } catch (e: any) {
        if (e.code === 'P2002') {
          throw new BadRequestException(
            'Tack product already saved as favorite',
          );
        }
        throw new BadRequestException('Failed to save tack product');
      }
    }

    // ---------------- SADDLE PRODUCT ----------------
    if (saddleProductId) {
      const product = await this.prisma.saddlesProduct.findUnique({
        where: { id: saddleProductId },
      });

      if (!product) {
        throw new NotFoundException('Saddle product not found');
      }

      try {
        return await this.prisma.favorite.create({
          data: { userId, saddleProductId },
          include: {
            saddleProduct: {
              include: {
                images: {
                  take: 1,
                },
              },
            },
          },
        });
      } catch (e: any) {
        if (e.code === 'P2002') {
          throw new BadRequestException(
            'Saddle product already saved as favorite',
          );
        }
        throw new BadRequestException('Failed to save saddle product');
      }
    }

    // ---------------- USED SADDLE PRODUCT ----------------
    if (usedSaddleProductId) {
      const product = await this.prisma.usedSaddle.findUnique({
        where: { id: usedSaddleProductId },
      });

      if (!product) {
        throw new NotFoundException('Used saddle product not found');
      }

      try {
        return await this.prisma.favorite.create({
          data: { userId, usedSaddleProductId }, // Include usedSaddleProductId here
          include: {
            usedSaddleProduct: {
              // Include used saddle product in response
              include: {
                images: true, // Adjust as per your product structure
              },
            },
          },
        });
      } catch (e: any) {
        if (e.code === 'P2002') {
          throw new BadRequestException(
            'Used saddle product already saved as favorite',
          );
        }
        throw new BadRequestException('Failed to save used saddle product');
      }
    }

    throw new BadRequestException('Invalid product type');
  }

  // ---------------- LIST FAVORITES ----------------
  async listFavorites(userId: string, country?: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        tackProduct: {
          include: {
            variants: {
              where: { isDefault: true },
              include: { images: true },
            },
          },
        },
        saddleProduct: {
          include: {
            images: {
              take: 1,
            },
          },
        },
        usedSaddleProduct: {
          // Include used saddle product
          include: {
            images: true,
          },
        },
      },
    });

    return favorites
      .map((fav) => {
        // -------- TACK PRODUCT --------
        if (fav.tackProduct) {
          const variant = fav.tackProduct.variants[0];

          return {
            id: fav.id,
            type: 'TACK_PRODUCT',
            savedAt: fav.createdAt,
            product: {
              id: fav.tackProduct.id,
              name: fav.tackProduct.name,
              sku: fav.tackProduct.sku,
              category: fav.tackProduct.category || null,
              subcategory: fav.tackProduct.subcategory || null,
              image: variant?.images[0]?.url || null,
              ...this.formatPrice(variant, country),
            },
          };
        }

        // -------- SADDLE PRODUCT --------
        if (fav.saddleProduct) {
          return {
            id: fav.id,
            type: 'SADDLE_PRODUCT',
            savedAt: fav.createdAt,
            product: {
              id: fav.saddleProduct.id,
              name: fav.saddleProduct.name,
              sku: fav.saddleProduct.sku,
              subcategory: fav.saddleProduct.subcategory,
              image: fav.saddleProduct.images[0]?.url || null,
              ...this.formatPrice(fav.saddleProduct, country),
            },
          };
        }

        // -------- USED SADDLE PRODUCT --------
        if (fav.usedSaddleProduct) {
          return {
            id: fav.id,
            type: 'USED_SADDLE_PRODUCT',
            savedAt: fav.createdAt,
            product: {
              id: fav.usedSaddleProduct.id,
              name: fav.usedSaddleProduct.title,
              sku: fav.usedSaddleProduct.sku,
              category: fav.usedSaddleProduct.category,
              subcategory: fav.usedSaddleProduct.usedsaddlecategory,
              image: fav.usedSaddleProduct.images[0]?.url || null,
              ...this.formatPrice(fav.usedSaddleProduct, country),
            },
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  // ---------------- REMOVE FAVORITE ----------------
  async removeFavoriteById(userId: string, favoriteId: string) {
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        id: favoriteId,
        userId, // security
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return { success: true, message: 'Favorite removed successfully' };
  }
}
