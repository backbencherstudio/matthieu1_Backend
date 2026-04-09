import { Injectable } from '@nestjs/common';
import { CreateSaddleAlertDto } from './dto/create-saddle-alert.dto';
import { UpdateSaddleAlertDto } from './dto/update-saddle-alert.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { Role } from 'src/common/guard/role/role.enum';
import appConfig from 'src/config/app.config';

@Injectable()
export class SaddleAlertService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private generateAlertId(): string {
    const randomDigits = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, '0');
    return `ALT-${randomDigits}`;
  }

  private async generateUniqueAlertId(): Promise<string> {
    let alertId: string;
    let isUnique = false;

    while (!isUnique) {
      alertId = this.generateAlertId();
      const existingAlert = await this.prisma.customerAlert.findUnique({
        where: { alertId },
      });
      isUnique = !existingAlert;
    }

    return alertId;
  }

  private buildSearchConditions(search: string) {
    const searchWords = search
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const searchUpper = search.toUpperCase();

    const stringFieldConditions = [
      { customerFirstName: { contains: search, mode: 'insensitive' as const } },
      { customerLastName: { contains: search, mode: 'insensitive' as const } },
      { customerEmail: { contains: search, mode: 'insensitive' as const } },
      { phoneNumber: { contains: search, mode: 'insensitive' as const } },
      { seatsSize: { contains: search, mode: 'insensitive' as const } },
      { brand: { contains: search, mode: 'insensitive' as const } },
    ];

    const wordBasedConditions =
      searchWords.length > 1
        ? searchWords.flatMap((word) => [
            {
              customerFirstName: {
                contains: word,
                mode: 'insensitive' as const,
              },
            },
            {
              customerLastName: {
                contains: word,
                mode: 'insensitive' as const,
              },
            },
            { customerEmail: { contains: word, mode: 'insensitive' as const } },
            { phoneNumber: { contains: word, mode: 'insensitive' as const } },
            { seatsSize: { contains: word, mode: 'insensitive' as const } },
            { brand: { contains: word, mode: 'insensitive' as const } },
          ])
        : [];

    const enumConditions = [];

    if (searchUpper.includes('BLACK') || searchUpper.includes('BLAC')) {
      enumConditions.push({ color: 'BLACK' as any });
    }
    if (searchUpper.includes('LIGHT') || searchUpper.includes('BROWN')) {
      enumConditions.push({ color: 'LIGHT_BROWN' as any });
    }
    if (searchUpper.includes('DARK') && searchUpper.includes('BROWN')) {
      enumConditions.push({ color: 'DARK_BROWN' as any });
    }

    if (searchUpper.includes('JUMP') || searchUpper.includes('JUMPING')) {
      enumConditions.push({ discpline: 'JUMPING' as any });
    }
    if (searchUpper.includes('DRESS') || searchUpper.includes('DRESSAGE')) {
      enumConditions.push({ discpline: 'DRESSAGE' as any });
    }
    if (searchUpper.includes('CROSS') || searchUpper.includes('COUNTRY')) {
      enumConditions.push({ discpline: 'CROSS_COUNTRY' as any });
    }

    return {
      OR: [...stringFieldConditions, ...wordBasedConditions, ...enumConditions],
    };
  }

  async create(createSaddleAlertDto: CreateSaddleAlertDto) {
    const alertId = await this.generateUniqueAlertId();

    const alert = await this.prisma.customerAlert.create({
      data: {
        ...createSaddleAlertDto,
        alertId,
      },
    });

    try {
      const receiverEmail = appConfig().mail.saddle_alert_receiver;

      if (receiverEmail) {
        const formattedDate = new Date(alert.createdAt).toLocaleString(
          'en-US',
          {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          },
        );

        await this.mailService.sendSaddleAlertToAdmin({
          email: receiverEmail,
          data: {
            ...alert,
            createdAt: formattedDate,
          },
        });
      }
    } catch (error) {
      console.log('Error sending saddle alert email:', error);
    }

    return alert;
  }

  async findAllAlerts(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    // Build search conditions with word-based matching
    const searchConditions = search ? this.buildSearchConditions(search) : {};

    // Get total count and paginated data in parallel
    const [total, alerts] = await Promise.all([
      this.prisma.customerAlert.count({
        where: searchConditions,
      }),
      this.prisma.customerAlert.findMany({
        where: searchConditions,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const formattedAlerts = alerts.map((alert) => ({
      alert_id: alert.alertId,
      id: alert.id,
      customer: `${alert.customerFirstName} ${alert.customerLastName} , ${alert.customerEmail}`,
      preferences: `${alert.brand}, ${alert.discpline}, ${alert.seatsSize}, ${alert.color}`,
      price_range: `${alert.priceMin} - ${alert.priceMax}`,
      created_date: alert.createdAt,
    }));

    return {
      data: formattedAlerts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneAlert(id: string) {
    const alert = await this.prisma.customerAlert.findUnique({
      where: { id },
    });

    console.log('Retrieved alert:', alert);

    if (!alert) {
      return null;
    }

    return {
      customer_name: `${alert.customerFirstName} ${alert.customerLastName}`,
      Email: alert.customerEmail,
      phone_number: alert.phoneNumber,
      town: alert.town,
      state: alert.state,
      Preferences: `${alert.brand}, ${alert.discpline}`,
      Price_range: `${alert.priceMin} - ${alert.priceMax}`,
      Seat_Sizes: alert.seatsSize,
      Color: alert.color,
      Additional_notes: alert.notes,
    };
  }

  async remove(id: string) {
    return await this.prisma.customerAlert.delete({
      where: { id },
    });
  }
}
