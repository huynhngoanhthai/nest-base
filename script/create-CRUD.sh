#!/usr/bin/env bash

# Exit on error
set -e

RAW_INPUT=$1

if [ -z "$RAW_INPUT" ]; then
  echo "❌ Error: Please provide module name!"
  echo "Usage: ./script/create-CRUD.sh <module-name>"
  echo "Example: ./script/create-CRUD.sh user"
  exit 1
fi

# Clean input path by stripping leading src/ or modules/ or src/modules/
CLEAN_PATH="$RAW_INPUT"
CLEAN_PATH="${CLEAN_PATH#src/}"
CLEAN_PATH="${CLEAN_PATH#modules/}"
CLEAN_PATH="${CLEAN_PATH#src/modules/}"
CLEAN_PATH="${CLEAN_PATH%/}"

# Extract module name and capitalized name (e.g. "admin/user" -> MODULE_NAME="user", CAP_NAME="User")
MODULE_NAME=$(basename "$CLEAN_PATH" | tr '[:upper:]' '[:lower:]')
CAP_NAME="$(tr '[:lower:]' '[:upper:]' <<< ${MODULE_NAME:0:1})${MODULE_NAME:1}"

DIR_PATH="src/modules/$CLEAN_PATH"
IMPORT_PATH="./modules/$CLEAN_PATH/$MODULE_NAME.module"
ROUTE_PATH="$CLEAN_PATH"
SWAGGER_TAG="$CLEAN_PATH"

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

export class Update${CAP_NAME}Dto extends PartialType(Create${CAP_NAME}Dto) {}
EOF

# 4. Generate Service
cat <<EOF > "$DIR_PATH/$MODULE_NAME.service.ts"
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${CAP_NAME} } from './entities/${MODULE_NAME}.entity';
import { Create${CAP_NAME}Dto } from './dto/create-${MODULE_NAME}.dto';
import { Update${CAP_NAME}Dto } from './dto/update-${MODULE_NAME}.dto';

@Injectable()
export class ${CAP_NAME}Service {
  constructor(
    @InjectRepository(${CAP_NAME})
    private readonly ${MODULE_NAME}Repository: Repository<${CAP_NAME}>,
  ) {}

  create(create${CAP_NAME}Dto: Create${CAP_NAME}Dto) {
    const item = this.${MODULE_NAME}Repository.create(create${CAP_NAME}Dto as any);
    return this.${MODULE_NAME}Repository.save(item);
  }

  findAll() {
    return this.${MODULE_NAME}Repository.find({ where: { isDeleted: false } });
  }

  findOne(id: number) {
    return this.${MODULE_NAME}Repository.findOne({ where: { id, isDeleted: false } });
  }

  update(id: number, update${CAP_NAME}Dto: Update${CAP_NAME}Dto) {
    return this.${MODULE_NAME}Repository.update(id, update${CAP_NAME}Dto as any);
  }

  remove(id: number) {
    return this.${MODULE_NAME}Repository.update(id, { isDeleted: true });
  }
}
EOF

# 5. Generate Controller
cat <<EOF > "$DIR_PATH/$MODULE_NAME.controller.ts"
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ${CAP_NAME}Service } from './${MODULE_NAME}.service';
import { Create${CAP_NAME}Dto } from './dto/create-${MODULE_NAME}.dto';
import { Update${CAP_NAME}Dto } from './dto/update-${MODULE_NAME}.dto';
import { CONFIG } from 'src/config/config';
import { JWTAuth, UserAuth } from 'src/common/decorators';

@ApiTags('${ROUTE_PATH}')
@Controller(\`\${CONFIG.API_PREFIX}/${ROUTE_PATH}\`)
export class ${CAP_NAME}Controller {
  constructor(private readonly ${MODULE_NAME}Service: ${CAP_NAME}Service) {}

  @Post()
  @UserAuth(JWTAuth)
  create(@Body() create${CAP_NAME}Dto: Create${CAP_NAME}Dto) {
    return this.${MODULE_NAME}Service.create(create${CAP_NAME}Dto);
  }

  @Get()
  @UserAuth(JWTAuth)
  findAll() {
    return this.${MODULE_NAME}Service.findAll();
  }

  @Get(':id')
  @UserAuth(JWTAuth)
  findOne(@Param('id') id: string) {
    return this.${MODULE_NAME}Service.findOne(+id);
  }

  @Patch(':id')
  @UserAuth(JWTAuth)
  update(
    @Param('id') id: string,
    @Body() update${CAP_NAME}Dto: Update${CAP_NAME}Dto,
  ) {
    return this.${MODULE_NAME}Service.update(+id, update${CAP_NAME}Dto);
  }

  @Delete(':id')
  @UserAuth(JWTAuth)
  remove(@Param('id') id: string) {
    return this.${MODULE_NAME}Service.remove(+id);
  }
}
EOF

# 6. Generate Module
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

# 7. Auto register module in app.module.ts
node -e "
const fs = require('fs');
const path = 'src/app.module.ts';
let code = fs.readFileSync(path, 'utf8');
const modName = '${CAP_NAME}Module';
const importPath = '${IMPORT_PATH}';

if (!code.includes(modName)) {
  code = \"import { \" + modName + \" } from '\" + importPath + \"';\n\" + code;
  code = code.replace(/imports:\s*\[/, 'imports: [\n    ' + modName + ',');
  fs.writeFileSync(path, code);
}
"

echo "✅ Successfully generated CRUD module '$CAP_NAME' in '$DIR_PATH' & registered in app.module.ts!"
