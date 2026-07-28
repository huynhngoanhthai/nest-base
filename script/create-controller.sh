#!/usr/bin/env bash

# Exit on error
set -e

ARG1=$1
ARG2=$2

if [ -z "$ARG1" ]; then
  echo "❌ Error: Please provide parent module and module name!"
  echo "Usage: ./script/create-controller.sh <parent-module> <module-name>"
  echo "   or: ./script/create-controller.sh <parent-module>/<module-name>"
  echo "Example: ./script/create-controller.sh admin user"
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
  echo "Usage: ./script/create-controller.sh <parent-module> <module-name>"
  echo "Example: ./script/create-controller.sh admin $CLEAN_PATH"
  exit 1
fi

MODULE_NAME=$(echo "$SUB_MODULE" | tr '[:upper:]' '[:lower:]')
CAP_NAME="$(tr '[:lower:]' '[:upper:]' <<< ${MODULE_NAME:0:1})${MODULE_NAME:1}"

PARENT_NAME=$(echo "$PARENT_MODULE" | tr '[:upper:]' '[:lower:]')
CAP_PARENT_NAME="$(tr '[:lower:]' '[:upper:]' <<< ${PARENT_NAME:0:1})${PARENT_NAME:1}"

DIR_PATH="src/modules/$PARENT_MODULE/$MODULE_NAME"
ROUTE_PATH="$PARENT_MODULE/$MODULE_NAME"
SWAGGER_TAG="$PARENT_MODULE - $MODULE_NAME"

echo "🚀 Generating Controller module '$CAP_NAME' in '$DIR_PATH'..."

# Create directory structure
mkdir -p "$DIR_PATH/dto"

# 1. Generate Findall DTO
cat <<EOF > "$DIR_PATH/dto/find-all.dto.ts"
export class FindallDto {
  search: string;
  page: number;
  limit: number;
}
EOF

# 2. Generate Service
cat <<EOF > "$DIR_PATH/$MODULE_NAME.service.ts"
import { Injectable } from '@nestjs/common';
import { FindallDto } from './dto/find-all.dto';
import { ResponseAPI } from 'src/common/responses';

@Injectable()
export class ${CAP_NAME}Service {
  constructor() {}

  async findAll(query: FindallDto) {
    return ResponseAPI.sendOK([]);
  }
}
EOF

# 3. Generate Controller
cat <<EOF > "$DIR_PATH/$MODULE_NAME.controller.ts"
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ${CAP_NAME}Service } from './${MODULE_NAME}.service';
import { CONFIG } from 'src/config/config';
import { JWTAuth, UserAuth } from 'src/common/decorators';
import { FindallDto } from './dto/find-all.dto';

@ApiTags('${SWAGGER_TAG}')
@Controller(\`\${CONFIG.API_PREFIX}/${ROUTE_PATH}\`)
export class ${CAP_NAME}Controller {
  constructor(private readonly ${MODULE_NAME}Service: ${CAP_NAME}Service) {}

  @Get()
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách ${MODULE_NAME}' })
  findAll(@Query() query: FindallDto) {
    return this.${MODULE_NAME}Service.findAll(query);
  }
}
EOF

# 4. Generate Module
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

# 5. Auto-register in parent module (e.g., src/modules/admin/admin.module.ts)
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

echo "✅ Successfully generated Controller module '$CAP_NAME' in '$DIR_PATH' & registered in '${PARENT_MODULE}.module.ts'!"
