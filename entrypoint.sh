#!/bin/bash

# Start the first process
cd /geminiApp/api
npm run start &
  
# Start the second process
cd /geminiApp/client/client-app
npm run start 