
Run:
tsc app.ts
-> app.js

npm init
npm install
npm install --save-dev lite-server
npm install --save-dev @types/w3c-web-usb

check package.json has line:
   "start": "lite-server"

To start server:
npm start

Serves to URL:
http://locahost:3000

Run:
tsc app.js
After each change

tsc app.ts --watch
tsc app.ts -w

To make ts project folder run:
tsc --init

This creates:
tsconfig.json

Now run just run 'tsc' or 'tsc -w' to compile all ts files in project

In tsconfig.json usually want (altho this is default anyhow):
},
"exclude": [
    "node_modules"
]

In tsconfig.json check out "compilerOptions" for configurable options

    "outDir": "./dist",     /* Redirect output structure to the directory. */
    "rootDir": "./src",     /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */
Don't forget to update HTML with /dist/...

    "sourceMap": true,      /* Generates corresponding '.map' file. */
    - allows ts debugging in browser

Dev Env
ESLint
Prettier - Code formatter
Debugger for Chrome

Google
------
chrome://device-log/
chrome://usb-internals

Links
-----
https://stackoverflow.com/questions/46124465/chrome-webusb-api-returns-no-device-when-using-navigator-usb-getdevices
https://stackoverflow.com/questions/67253699/webusb-api-not-able-to-find-compatible-device
