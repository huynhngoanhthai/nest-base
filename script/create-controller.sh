#!/usr/bin/env bash

# Exit on error
set -e

RAW_INPUT=$1

if [ -z "$RAW_INPUT" ]; then
  echo "❌ Error: Please provide module name!"
  echo "Usage: ./script/create-controller.sh <module-name>"
  echo "Example: ./script/create-controller.sh user"
  exit 1
fi

# Clean input path by stripping leading src/ or modules/ or src/modules/
CLEAN_PATH="$RAW_INPUT"
CLEAN_PATH="${CLEAN_PATH#src/}"
CLEAN_PATH="${CLEAN_PATH#modules/}"
CLEAN_PATH="${CLEAN_PATH#src/modules/}"
CLEAN_PATH="${CLEAN_PATH%/}"

# Extract module name and capitalized name (e.g. "user" -> MODULE_NAME="user", CAP_NAME="User")
MODULE_NAME=$(basename "$CLEAN_PATH" | tr '[:upper:]' '[:lower:]')
CAP_NAME="$(tr '[:lower:]' '[:upper:]' <<< ${MODULE_NAME:0:1})${MODULE_NAME:1}"

DIR_PATH="src/modules/$CLEAN_PATH"
IMPORT_PATH="./modules/$CLEAN_PATH/$MODULE_NAME.module"
ROUTE_PATH="$CLEAN_PATH"

echo "🚀 Generating Controller module '$CAP_NAME' in '$DIR_PATH'..."

# Create directory structure
mkdir -p "$DIR_PATH/dto"

# 1. Generate Create DTO
cat <<EOF > "$DIR_PATH/dto/create-$MODULE_NAME.dto.ts"
export class Create${CAP_NAME}Dto {}
EOF

# 2. Generate Update DTO
cat <<EOF > "$DIR_PATH/dto/update-$MODULE_NAME.dto.ts"
import { PartialType } from '@nestjs/swagger';
import { Create${CAP_NAME}Dto } from './create-${MODULE_NAME}.dto';

export class Update${CAP_NAME}Dto extends PartialType(Create${CAP_NAME}Dto) {}
EOF

# 3. Generate Service
cat <<EOF > "$DIR_PATH/$MODULE_NAME.service.ts"
import { Injectable } from '@nestjs/common';
import { Create${CAP_NAME}Dto } from './dto/create-${MODULE_NAME}.dto';
import { Update${CAP_NAME}Dto } from './dto/update-${MODULE_NAME}.dto';

@Injectable()
export class ${CAP_NAME}Service {
  create(create${CAP_NAME}Dto: Create${CAP_NAME}Dto) {
    return 'This action adds a new ${MODULE_NAME}';
  }

  findAll() {
    return 'This action returns all ${MODULE_NAME}';
  }

  findOne(id: number) {
    return \`This action returns a #\${id} ${MODULE_NAME}\`;
  }

  update(id: number, update${CAP_NAME}Dto: Update${CAP_NAME}Dto) {
    return \`This action updates a #\${id} ${MODULE_NAME}\`;
  }

  remove(id: number) {
    return \`This action removes a #\${id} ${MODULE_NAME}\`;
  }
}
EOF

# 4. Generate Controller
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

  @Get()
  @UserAuth(JWTAuth)
  findAll() {
    return this.${MODULE_NAME}Service.findAll();
  }
}
EOF

# 5. Generate Module
cat <<EOF > "$DIR_PATH/$MODULE_NAME.module.ts"
import { Module } from '@nestjs/common';
import { ${CAP_NAME}Service } from './${MODULE_NAME}.service';
import { ${CAP_NAME}Controller } from './${MODULE_NAME}.controller';

@Module({
  controllers: [${CAP_NAME}Controller],
  providers: [${CAP_NAME}Service],
  exports: [${CAP_NAME}Service],
})
export class ${CAP_NAME}Module {}
EOF

# 6. Auto register module in app.module.ts
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

echo "✅ Successfully generated Controller module '$CAP_NAME' in '$DIR_PATH' & registered in app.module.ts!"
