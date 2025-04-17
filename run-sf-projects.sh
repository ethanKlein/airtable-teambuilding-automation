#!/bin/bash

# Change to the project directory
cd /Users/eklein@ideo.com/Documents/Sites/airtable-automate

# Ensure we're using the right Node version (if you're using nvm)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Run the script
npm run build && node dist/listSFProjects.js 