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
