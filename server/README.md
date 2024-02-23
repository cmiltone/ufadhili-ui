# simple-app-server

A node simple server for quickly launching your vue, react and other static websites in production.

# environment

Create .env file and ecosystem.config.js

# Add the following to .env

SERVER_PORT=PORT_RUNNING_SERVER
MORGAN_LOG_LEVEL='tiny'
PATH_TO_PUBLIC_FOLDER='[PATH_TO_PUBLIC_FOLDER]'

# Add the following to ecosystem.config.js

exports.apps = [{ name: 'agizo-vendor-ui, script: './app.js' }]

## Run app in production

```yarn serve```
