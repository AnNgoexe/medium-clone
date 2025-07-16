import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import PrismaService from '@common/service/prisma.service';
import PasswordService from '@common/service/password.service';
import UpdateUserDto from '@modules/user/update-user.dto';
import {
  ERROR_EMAIL_ALREADY_EXISTS,
  ERROR_USER_NOT_FOUND,
  ERROR_USERNAME_ALREADY_EXISTS,
} from '@common/constant/error.constant';
import TokenService from '@common/service/token.service';
import { AccessTokenPayloadInput } from '@common/type/token-payload.interface';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async updateUser(userId: number, dto: UpdateUserDto): Promise<object> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    if (dto.email && dto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (emailExists) {
        throw new ConflictException(ERROR_EMAIL_ALREADY_EXISTS);
      }
    }

    if (dto.username && dto.username !== existingUser.username) {
      const usernameExists = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });
      if (usernameExists) {
        throw new ConflictException(ERROR_USERNAME_ALREADY_EXISTS);
      }
    }

    const data: Partial<UpdateUserDto> = { ...dto };

    if (data.password) {
      data.password = await this.passwordService.hashPassword(data.password);
    }

    Object.keys(data).forEach((key) => {
      const typedKey = key as keyof UpdateUserDto;
      if (data[typedKey] === undefined || data[typedKey] === null) {
        delete data[typedKey];
      }
    });

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    const payload: AccessTokenPayloadInput = {
      userId: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
    };
    const token: string = await this.tokenService.generateAccessToken(payload);

    return {
      email: updatedUser.email,
      username: updatedUser.username,
      bio: updatedUser.bio,
      image: updatedUser.image,
      token,
    };
  }
}
