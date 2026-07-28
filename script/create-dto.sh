#!/usr/bin/env bash

# Exit on error
set -e

ARG1=$1
ARG2=$2
ARG3=$3

if [ -z "$ARG1" ]; then
  echo "❌ Error: Please provide parent module, module name, and DTO name!"
  echo "Usage: ./script/create-dto.sh <parent-module> <module-name> <dto-name>"
  echo "   or: ./script/create-dto.sh <parent-module>/<module-name> <dto-name>"
  echo "Example: ./script/create-dto.sh admin user login"
  exit 1
fi

if [ -n "$ARG3" ]; then
  MODULE_PATH="$ARG1/$ARG2"
  DTO_INPUT="$ARG3"
elif [ -n "$ARG2" ]; then
  if [[ "$ARG1" == *"/"* ]]; then
    MODULE_PATH="$ARG1"
    DTO_INPUT="$ARG2"
  else
    MODULE_PATH="$ARG1/$ARG2"
    DTO_INPUT="$ARG2"
  fi
else
  if [[ "$ARG1" == *"/"* ]]; then
    MODULE_PATH=$(dirname "$ARG1")
    DTO_INPUT=$(basename "$ARG1")
  else
    echo "❌ Error: Please specify parent module and DTO name!"
    echo "Usage: ./script/create-dto.sh <parent-module> <module-name> <dto-name>"
    echo "Example: ./script/create-dto.sh admin user login"
    exit 1
  fi
fi

# Clean module path
CLEAN_PATH="$MODULE_PATH"
CLEAN_PATH="${CLEAN_PATH#src/}"
CLEAN_PATH="${CLEAN_PATH#modules/}"
CLEAN_PATH="${CLEAN_PATH#src/modules/}"
CLEAN_PATH="${CLEAN_PATH%/}"
CLEAN_PATH="${CLEAN_PATH#/}"

# Strip .dto suffix if provided
DTO_NAME="${DTO_INPUT%.dto}"
DTO_NAME=$(echo "$DTO_NAME" | tr '[:upper:]' '[:lower:]')

# Convert camel/dash-case to PascalCase (e.g., filter-user -> FilterUser)
IFS='-' read -ra WORDS <<< "$DTO_NAME"
CAP_DTO=""
for word in "${WORDS[@]}"; do
  CAP_DTO="${CAP_DTO}$(tr '[:lower:]' '[:upper:]' <<< ${word:0:1})${word:1}"
done

# Ensure Class ends with Dto
if [[ "$CAP_DTO" != *Dto ]]; then
  CLASS_NAME="${CAP_DTO}Dto"
else
  CLASS_NAME="$CAP_DTO"
fi

DIR_PATH="src/modules/$CLEAN_PATH/dto"
FILE_PATH="$DIR_PATH/$DTO_NAME.dto.ts"

# Create directory if not exists
mkdir -p "$DIR_PATH"

# Generate DTO file
cat <<EOF > "$FILE_PATH"
import { ApiProperty } from '@nestjs/swagger';

export class ${CLASS_NAME} {}
EOF

echo "✅ Successfully generated DTO '${CLASS_NAME}' in '$FILE_PATH'!"
