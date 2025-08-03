import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Sempre retorna true, mas tenta fazer a autenticação se o token estiver presente
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Se houver erro ou não houver usuário, retorna null (permite acesso anônimo)
    // Se houver usuário, retorna o usuário
    return user || null;
  }
}
