import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Dependencies,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { includes } from 'lodash';

@Injectable()
@Dependencies(Reflector)
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {
    this.reflector = reflector;
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return includes(requiredRoles, user?.role);
  }
}
