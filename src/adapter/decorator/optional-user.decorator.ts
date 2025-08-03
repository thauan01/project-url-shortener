import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const OptionalUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Por simplicidade, vamos buscar o userId do header 'x-user-id'
    // Em um projeto real, você usaria JWT tokens ou sessões
    const userId = request.headers['x-user-id'];
    return userId || null;
  },
);
