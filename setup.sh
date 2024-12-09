#!/bin/bash

# Remove old build and modules
rm -rf dist node_modules

# Install dependencies
npm install

# Build the frontend
npm run build

# Start the server
npm start