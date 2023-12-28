#!/bin/bash

APP_TYPE="$1"

if [ "$APP_TYPE" == "front" ]; then
  cd srcs/frontend/app && npm install && npm run dev
elif [ "$APP_TYPE" == "back" ]; then
  cd srcs/backend/api && npm install && npm run start:dev
else
  echo "Usage: ./dev-start.sh [front|back]"
fi
