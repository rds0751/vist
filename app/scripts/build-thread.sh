#!/bin/bash
node node_modules/react-native/local-cli/cli.js bundle --dev false --assets-dest ./android/app/src/main/res/ --entry-file NativeWorker.js --platform android --bundle-output ./android/app/src/main/assets/threads/NativeWorker.bundle
