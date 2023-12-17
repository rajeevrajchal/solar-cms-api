import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './role.guard';

@Injectable()
export class JwtAndRolesGuard implements CanActivate {
  constructor(
    private readonly jwtAuthGuard: JwtAuthGuard,
    private readonly rolesGuard: RolesGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Apply JWT authentication first
    await this.jwtAuthGuard.canActivate(context);

    // Apply role-based authorization next
    return this.rolesGuard.canActivate(context);
  }
}
