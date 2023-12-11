#!/bin/bash

APP_TYPE="$1"
INSTALL_OPTION="$2"

# Function to run npm install if --install option is provided
run_npm_install() {
  if [ "$INSTALL_OPTION" == "--install" ]; then
    npm install
  fi
}

if [ "$APP_TYPE" == "front" ]; then
  cd srcs/frontend/app && run_npm_install && npm run dev
elif [ "$APP_TYPE" == "back" ]; then
  cd srcs/backend/api && run_npm_install && npm run start:dev
else
  echo "Usage: ./dev-start.sh [front|back] [--install]"
fi
