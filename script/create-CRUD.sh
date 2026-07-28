#!/usr/bin/env bash

# Exit on error
set -e

ARG1=$1
ARG2=$2

if [ -z "$ARG1" ]; then
  echo "❌ Error: Please provide parent module and module name!"
  echo "Usage: ./script/create-CRUD.sh <parent-module> <module-name>"
  echo "   or: ./script/create-CRUD.sh <parent-module>/<module-name>"
  echo "Example: ./script/create-CRUD.sh admin user"
  exit 1
fi

if [ -n "$ARG2" ]; then
  FULL_INPUT="$ARG1/$ARG2"
else
  FULL_INPUT="$ARG1"
fi

# Clean input path by stripping leading src/ or modules/ or src/modules/
CLEAN_PATH="$FULL_INPUT"
CLEAN_PATH="${CLEAN_PATH#src/}"
CLEAN_PATH="${CLEAN_PATH#modules/}"
CLEAN_PATH="${CLEAN_PATH#src/modules/}"
CLEAN_PATH="${CLEAN_PATH%/}"
CLEAN_PATH="${CLEAN_PATH#/}"

# Parse PARENT_MODULE and SUB_MODULE
if [[ "$CLEAN_PATH" == *"/"* ]]; then
  PARENT_MODULE=$(dirname "$CLEAN_PATH")
  SUB_MODULE=$(basename "$CLEAN_PATH")
else
  echo "❌ Error: Please specify parent module (e.g. admin, customer, public)!"
  echo "Usage: ./script/create-CRUD.sh <parent-module> <module-name>"
  echo "Example: ./script/create-CRUD.sh admin $CLEAN_PATH"
  exit 1
fi

MODULE_NAME=$(echo "$SUB_MODULE" | tr '[:upper:]' '[:lower:]')
CAP_NAME="$(tr '[:lower:]' '[:upper:]' <<< ${MODULE_NAME:0:1})${MODULE_NAME:1}"

PARENT_NAME=$(echo "$PARENT_MODULE" | tr '[:upper:]' '[:lower:]')
CAP_PARENT_NAME="$(tr '[:lower:]' '[:upper:]' <<< ${PARENT_NAME:0:1})${PARENT_NAME:1}"

DIR_PATH="src/modules/$PARENT_MODULE/$MODULE_NAME"
ROUTE_PATH="$PARENT_MODULE/$MODULE_NAME"
SWAGGER_TAG="$PARENT_MODULE - $MODULE_NAME"

echo "🚀 Generating CRUD module '$CAP_NAME' in '$DIR_PATH'..."

# Create directory structure
mkdir -p "$DIR_PATH/dto"
mkdir -p "$DIR_PATH/entities"

# 1. Generate Entity
cat <<EOF > "$DIR_PATH/entities/$MODULE_NAME.entity.ts"
import { CoreEntity } from 'src/base/CoreEntity';
import { Entity } from 'typeorm';

@Entity('${MODULE_NAME}s')
export class ${CAP_NAME} extends CoreEntity {}
EOF

# 2. Generate Create DTO
cat <<EOF > "$DIR_PATH/dto/create-$MODULE_NAME.dto.ts"
import { ${CAP_NAME} } from '../entities/${MODULE_NAME}.entity';

export class Create${CAP_NAME}Dto {
  ${MODULE_NAME}: ${CAP_NAME};
}
EOF

# 3. Generate Update DTO
cat <<EOF > "$DIR_PATH/dto/update-$MODULE_NAME.dto.ts"
import { PartialType } from '@nestjs/swagger';
import { Create${CAP_NAME}Dto } from './create-${MODULE_NAME}.dto';
import { ${CAP_NAME} } from '../entities/${MODULE_NAME}.entity';

export class Update${CAP_NAME}Dto extends PartialType(Create${CAP_NAME}Dto) {
  ${MODULE_NAME}: ${CAP_NAME};
}
EOF

# 4. Generate Findall DTO
cat <<EOF > "$DIR_PATH/dto/find-all.dto.ts"
export class FindallDto {
  search: string;
  page: number;
  limit: number;
}
EOF

# 5. Generate Service
cat <<EOF > "$DIR_PATH/$MODULE_NAME.service.ts"
import { Injectable } from '@nestjs/common';
import { ${CAP_NAME} } from './entities/${MODULE_NAME}.entity';
import { Create${CAP_NAME}Dto } from './dto/create-${MODULE_NAME}.dto';
import { Update${CAP_NAME}Dto } from './dto/update-${MODULE_NAME}.dto';
import { FindallDto } from './dto/find-all.dto';
import { ResponseAPI } from 'src/common/responses';

@Injectable()
export class ${CAP_NAME}Service {
  constructor() {}

  async create(create${CAP_NAME}Dto: Create${CAP_NAME}Dto) {
    const item = create${CAP_NAME}Dto.${MODULE_NAME};
    await item.save();
    return ResponseAPI.sendOK(item);
  }

  async findAll(query: FindallDto) {
    const { search, page, limit } = query;
    let where = \`${MODULE_NAME}.isDeleted = false\`;
    if (search) {
      where += \` AND CONCAT(${MODULE_NAME}.name) LIKE :search\`;
    }
    const [${MODULE_NAME}s, total] = await ${CAP_NAME}.createQueryBuilder('${MODULE_NAME}')
      .where(where, {
        search: \`%\${search}%\`,
      })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('${MODULE_NAME}.id', 'DESC')
      .getManyAndCount();

    return ResponseAPI.sendOK({ ${MODULE_NAME}s, total });
  }

  async findOne(id: number) {
    const item = await ${CAP_NAME}.findOneOrThrowId(id);
    return ResponseAPI.sendOK(item);
  }

  async update(id: number, update${CAP_NAME}Dto: Update${CAP_NAME}Dto) {
    const item = update${CAP_NAME}Dto.${MODULE_NAME};
    item.id = +id;
    await item.save();
    return ResponseAPI.sendOK(item);
  }

  async remove(id: number) {
    const item = new ${CAP_NAME}();
    item.id = +id;
    item.isDeleted = true;
    await item.save();
    return ResponseAPI.sendOK(item);
  }
}
EOF

# 6. Generate Controller
cat <<EOF > "$DIR_PATH/$MODULE_NAME.controller.ts"
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ${CAP_NAME}Service } from './${MODULE_NAME}.service';
import { Create${CAP_NAME}Dto } from './dto/create-${MODULE_NAME}.dto';
import { Update${CAP_NAME}Dto } from './dto/update-${MODULE_NAME}.dto';
import { CONFIG } from 'src/config/config';
import { JWTAuth, UserAuth } from 'src/common/decorators';
import { FindallDto } from './dto/find-all.dto';

@ApiTags('${SWAGGER_TAG}')
@Controller(\`\${CONFIG.API_PREFIX}/${ROUTE_PATH}\`)
export class ${CAP_NAME}Controller {
  constructor(private readonly ${MODULE_NAME}Service: ${CAP_NAME}Service) {}

  @Post()
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo mới ${MODULE_NAME}' })
  create(@Body() create${CAP_NAME}Dto: Create${CAP_NAME}Dto) {
    return this.${MODULE_NAME}Service.create(create${CAP_NAME}Dto);
  }

  @Get()
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách ${MODULE_NAME}' })
  findAll(@Query() query: FindallDto) {
    return this.${MODULE_NAME}Service.findAll(query);
  }

  @Get(':id')
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy chi tiết ${MODULE_NAME}' })
  findOne(@Param('id') id: string) {
    return this.${MODULE_NAME}Service.findOne(+id);
  }

  @Patch(':id')
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cập nhật ${MODULE_NAME}' })
  update(
    @Param('id') id: string,
    @Body() update${CAP_NAME}Dto: Update${CAP_NAME}Dto,
  ) {
    return this.${MODULE_NAME}Service.update(+id, update${CAP_NAME}Dto);
  }

  @Delete(':id')
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xóa ${MODULE_NAME}' })
  remove(@Param('id') id: string) {
    return this.${MODULE_NAME}Service.remove(+id);
  }
}
EOF

# 7. Generate Module
cat <<EOF > "$DIR_PATH/$MODULE_NAME.module.ts"
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${CAP_NAME}Service } from './${MODULE_NAME}.service';
import { ${CAP_NAME}Controller } from './${MODULE_NAME}.controller';
import { ${CAP_NAME} } from './entities/${MODULE_NAME}.entity';

@Module({
  imports: [TypeOrmModule.forFeature([${CAP_NAME}])],
  controllers: [${CAP_NAME}Controller],
  providers: [${CAP_NAME}Service],
  exports: [${CAP_NAME}Service, TypeOrmModule],
})
export class ${CAP_NAME}Module {}
EOF

# 8. Auto-register in parent module (e.g., src/modules/admin/admin.module.ts)
node -e "
const fs = require('fs');
const parentDir = 'src/modules/${PARENT_MODULE}';
const parentModuleFile = parentDir + '/${PARENT_MODULE}.module.ts';
const parentModName = '${CAP_PARENT_NAME}Module';
const childModName = '${CAP_NAME}Module';
const childImportPath = './${MODULE_NAME}/${MODULE_NAME}.module';

// Ensure parent module file exists
if (!fs.existsSync(parentModuleFile)) {
  fs.mkdirSync(parentDir, { recursive: true });
  const initialContent = \`import { Module } from '@nestjs/common';

@Module({
  imports: [],
  exports: [],
})
export class \${parentModName} {}
\`;
  fs.writeFileSync(parentModuleFile, initialContent);

  // Register parent module in app.module.ts if not registered
  const appPath = 'src/app.module.ts';
  if (fs.existsSync(appPath)) {
    let appCode = fs.readFileSync(appPath, 'utf8');
    const parentImportPath = './modules/${PARENT_MODULE}/${PARENT_MODULE}.module';
    if (!appCode.includes(parentModName)) {
      appCode = \"import { \" + parentModName + \" } from '\" + parentImportPath + \"';\n\" + appCode;
      appCode = appCode.replace(/imports:\s*\[/, 'imports: [\n    ' + parentModName + ',');
      fs.writeFileSync(appPath, appCode);
    }
  }
}

// Add child module to parent module
let code = fs.readFileSync(parentModuleFile, 'utf8');
if (!code.includes(childModName)) {
  code = \"import { \" + childModName + \" } from '\" + childImportPath + \"';\n\" + code;
  code = code.replace(/imports:\s*\[/, 'imports: [\n    ' + childModName + ',');
  if (code.includes('exports: [')) {
    code = code.replace(/exports:\s*\[/, 'exports: [\n    ' + childModName + ',');
  }
  fs.writeFileSync(parentModuleFile, code);
}
"

echo "✅ Successfully generated CRUD module '$CAP_NAME' in '$DIR_PATH' & registered in '${PARENT_MODULE}.module.ts'!"
