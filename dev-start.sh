#!/bin/bash

APP_TYPE="$1"

if [ "$APP_TYPE" == "front" ]; then
  cd srcs/frontend/app && npm run dev
elif [ "$APP_TYPE" == "back" ]; then
  cd srcs/backend/api && npm run start:dev
else
  echo "Usage: ./dev-start.sh [front|back]"
fi
