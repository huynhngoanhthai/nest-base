#!/usr/bin/env bash

# Exit on error
set -e

RAW_MODULE=$1
RAW_DTO=$2

if [ -z "$RAW_MODULE" ]; then
  echo "❌ Error: Please provide module name and DTO name!"
  echo "Usage: ./script/create-dto.sh <module-name> [dto-name]"
  echo "Example 1: ./script/create-dto.sh user login"
  echo "Example 2: ./script/create-dto.sh user/filter-user"
  exit 1
fi

# If module has a slash (e.g. user/login) and $2 is empty
if [[ "$RAW_MODULE" == *"/"* ]] && [ -z "$RAW_DTO" ]; then
  MODULE_PATH=$(dirname "$RAW_MODULE")
  DTO_INPUT=$(basename "$RAW_MODULE")
else
  MODULE_PATH="$RAW_MODULE"
  DTO_INPUT="${RAW_DTO:-$RAW_MODULE}"
fi

# Clean module path
CLEAN_PATH="$MODULE_PATH"
CLEAN_PATH="${CLEAN_PATH#src/}"
CLEAN_PATH="${CLEAN_PATH#modules/}"
CLEAN_PATH="${CLEAN_PATH#src/modules/}"
CLEAN_PATH="${CLEAN_PATH%/}"

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
export class ${CLASS_NAME} {}
EOF

echo "✅ Successfully generated DTO '${CLASS_NAME}' in '$FILE_PATH'!"
