# React Vite

This project it a skeleton of **React** and **Vite** (and **Typescript**)! It was created to ensure a clean slate, with production grade features such as properly configured **eslint**, using **Vite** and **SWC** for a faster development experience and hot reloads. **Vite** also uses **Rollup** as a bundler, which is much more efficient than standard **Webpack**.

## Commands

- npm start - run your project in development mode
- npm run lint - check your project for any warnings via **eslint**
- npm run format - format your project using **prettier**
- npm run build - build your project
- npm run preview - test your built project

## Types folder

The **tsconfig.json** is already set up to handle types from a `@types` folder inside the `src` directory.

## Environment Variables

프로젝트를 실행하기 전에 환경 변수를 설정해야 합니다.

### 개발 환경
`.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# WebSocket 설정
VITE_WS_URL=ws://localhost:3000

# API 설정
VITE_API_URL=http://localhost:3000
```

### 프로덕션 환경
프로덕션 환경에서는 환경 변수를 설정하지 않으면 자동으로 현재 도메인을 사용합니다.
- HTTPS 환경: `wss://yourdomain.com`
- HTTP 환경: `ws://yourdomain.com`

## WebSocket 사용법

```typescript
import { createBisWebSocket, createSisWebSocket } from './src/utils/websocket';

// BIS WebSocket 연결
const bisWs = createBisWebSocket();

// SIS WebSocket 연결
const sisWs = createSisWebSocket();

// 메시지 수신
bisWs.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('BIS 업데이트:', data);
};
```
