# Express TypeScript Starter

A simple Express.js backend setup using TypeScript.

## Step 1: Create Project

```bash
mkdir typescript
cd typescript
npm init -y
```

## Step 2: Install Packages

### Production Dependencies

```bash
npm install express dotenv
```

### Development Dependencies

```bash
npm install -D typescript ts-node-dev @types/node @types/express
```

## Step 3: Create TypeScript Config

```bash
npx tsc --init
```

Replace `tsconfig.json` with:

```json

{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": ".",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["index.ts", "src/**/*.ts"]
}


```



## Step 4: Create src/app.ts

```ts
import express, { Request, Response } from "express";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello Server");
});

export default app;
```

## Step 6: Create index.ts

```ts
import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

## Step 7: Update package.json Scripts

```json

{
  "name": "typescript",
  "version": "1.0.0",
  "description": "",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "dotenv": "^17.4.2",
    "express": "^5.2.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^25.9.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^6.0.3"
  }
}

```

## Step 8: Run Development Server

```bash
npm run dev
```

## Step 9: Build Project

```bash
npm run build
```

This converts:

```txt
src/index.ts
src/app.ts
```

into:

```txt
dist/index.js
dist/app.js
```

## Step 10: Start Production

```bash
npm start
```

Output:

```bash
Server running on http://localhost:3000
```

## Useful Commands

### Install Packages

```bash
npm install
```

### Run Development

```bash
npm run dev
```

### Build Project

```bash
npm run build
```

### Start Production

```bash
npm start
```

### Check TypeScript Errors

```bash
npx tsc --noEmit
```

## Author

Piyush Kumar

## License

MIT
