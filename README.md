hướng đã tạo CRUD

```bash
# tạo crud
 sh ./script/create-CRUD.sh <module>
```

```bash
# tạo controller
 ./script/create-controller.sh <module-name>
```

```bash
# tạo dto nhanh
 sh ./script/create-dto.sh <module-name> <dto-name>
 # Ví dụ: sh ./script/create-dto.sh user login
```

để ấn 1 property trong response thì ta dùng @ApiHideProperty()

```typescript
import { ApiHideProperty } from '@nestjs/swagger';

@ApiHideProperty()
email: string;
```

file types để update lại Request của express

```typescript
import 'express';

declare global {
  namespace Express {
    interface Request {
      // update types ở đẩy
      user?: User;
    }
  }
}
```

JWT chỉnh cấu trúc file

```typescript
// src/common/guards/jwt-auth.guard.ts

// Bỏ extends BaseEntity
@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Unauthorized('Token không hợp lệ');
    }

    const token = authHeader.split(' ')[1];
    const payload = JWT.verify<Payload>(token);

    // Lấy user từ payload - KHÔNG DÙNG DB
    // payload đã chứa tất cả thông tin cần thiết
    // Bạn có thể thêm user vào request nếu muốn
    request.user = {
      id: payload.id,
      username: payload.username,
      role: payload.role,
    };

    return true;
  }
}
```
