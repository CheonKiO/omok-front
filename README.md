# Omok Frontend

실시간 온라인 오목 게임의 프론트엔드입니다. Vue 3 기반이며 GitHub Pages에 배포되어 있습니다.

**▶ [Live Demo](https://cheonkio.github.io/)** · [Backend Repository](https://github.com/CheonKiO/omok-back)

<br>

## 기술 스택

| 구분 | 사용 기술 |
|---|---|
| Framework | Vue 3 (Composition API) |
| State | Pinia |
| Routing | Vue Router |
| Build | Vite |
| Realtime | STOMP over SockJS |
| HTTP | axios |
| Test | vitest |
| Design | 바닐라 CSS + CSS 변수 디자인 토큰 + Vue scoped style (CSS 프레임워크 없음) |
| Deploy | GitHub Pages (GitHub Actions 자동 배포) |

<br>

## 프로젝트 구조

```
src/
├── pages/
│   ├── HomePage.vue       # 로비 '대국실' — 방 목록 · 개설
│   ├── BoardPage.vue      # 게임 보드 (/room/:roomNo)
│   ├── LoginPage.vue      # 로그인 · 회원가입 · 게스트
│   ├── GamesPage.vue      # '대국 기록부' — 내 기보 목록 (/games)
│   └── ReplayPage.vue     # '복기' — 착수 재생 (/games/:id)
├── components/
│   ├── GameBoard.vue      # 15x15 보드 렌더링 (대국 · 복기 공용)
│   ├── AuthPanel.vue      # 로그인 · 회원가입 · 게스트 탭
│   ├── ModalComp.vue      # 방 개설 · 입장 모달
│   ├── RoomListCard.vue
│   ├── TimerComp.vue
│   ├── ToastMessage.vue
│   └── UserInfo.vue
├── composable/
│   ├── useGameRoom.js         # 방 상태 · 게임 액션 · 메시지 처리
│   ├── useGameMessages.js     # STOMP 메시지 파싱 · 디스패치
│   ├── useGameState.js        # 게임 상태 모델
│   ├── useGameLogic.js        # 금수 판정 (즉각 피드백용)
│   ├── useReconnectCountdown.js
│   └── useToast.js
├── api/
│   ├── rooms.js           # 방 REST
│   ├── games.js           # 기보 REST
│   └── interceptors.js    # JWT 부착 + 401 자동 refresh 재시도
├── stores/                # auth · player(user.js) · server · websocket (Pinia)
└── router/
    └── index.js           # 라우트 + 인증 가드
```

<br>

## 주요 기능

### 인증 (JWT)

로그인 · 회원가입 · 게스트 세 방식을 지원합니다. 발급된 accessToken / refreshToken은 `localStorage`에 저장하고 `auth` 스토어가 관리합니다.

axios 인터셉터(`src/api/interceptors.js`)가 모든 요청에 `Bearer` 헤더를 부착하고, 401 응답 시 **single-flight**로 refresh를 1회만 수행한 뒤 원래 요청을 재시도합니다. refresh 토큰이 없는 게스트는 바로 로그아웃 처리합니다. 라우터 가드(`src/router/index.js`)가 미인증 접근을 로그인 페이지로 리다이렉트합니다.

### 기보 · 복기

종료된 대국은 서버에 기보로 남습니다. `/games`('대국 기록부')에서 내 기보 목록(회원만)을 조회하고, `/games/:id`('복기')에서 재생합니다.

복기 화면은 대국용 `GameBoard.vue`를 재사용해 착수마다 **수 번호가 적힌 돌**을 렌더링하고, 처음/이전/다음/끝 스텝퍼와 **←/→ 키**로 수를 넘깁니다. REST 호출은 `src/api/games.js`에 모여 있습니다.

### 디자인 시스템 (antique)

바둑 · 장기의 우드톤, 종이 질감 배경, 반투명 패널로 통일한 고풍 테마입니다. 색·폰트 등 토큰은 `src/assets/main.css`의 CSS 변수로 정의합니다.

- **폰트**: 제목 `ChosunGs`(serif) + 본문 `Pretendard`
- **버튼 색 위계**: 일반 = 호두 갈색 / 방 개설 = 군청 / 입장 = 주홍 (무광 · 반투명)
- 모달 · 로그인 · 기록부 · 복기 화면까지 같은 톤으로 통일

<br>

## 설계 판단 기록

### 1. `BoardPage.vue` 355줄 → 90줄

게임 화면 하나에 방 상태 관리, WebSocket 메시지 처리, 게임 액션, 렌더링이 모두 들어 있었습니다. 상태 흐름을 추적하기 어려웠고 수정할 때마다 다른 부분이 깨졌습니다.

로직 전체를 `useGameRoom.js` composable로 추출해 **컴포넌트는 화면 표현만** 담당하도록 분리했습니다. 결과적으로 355줄이 90줄로 줄었고, 게임 상태 관련 수정이 한 파일에 모이게 됐습니다.

### 2. 프론트에서도 금수 판정을 하는 이유

`useGameLogic.js`의 금수 판정은 **서버 판정을 대체하지 않습니다.**

착수할 때마다 서버 왕복을 기다리면 "돌을 놓을 수 없다"는 피드백이 늦어 사용자 경험이 나빠집니다. 그래서 프론트에서 먼저 판정해 즉시 피드백을 주되, **실제 게임 상태는 서버 판정 결과로만 갱신**합니다.

즉 프론트 판정은 UX를 위한 것이고, 신뢰는 전적으로 서버에 둡니다. 두 로직은 동일한 규칙을 구현하되 서로를 신뢰하지 않는 관계입니다.

### 3. GitHub Pages에서 SPA 라우팅 처리

GitHub Pages는 정적 호스팅이라 `/room/abc` 같은 경로로 직접 접속하면 404가 납니다.

`public/404.html`에서 요청 경로를 `sessionStorage`에 저장하고 루트로 리다이렉트한 뒤, 앱 로드 시점에 `history.replaceState`로 경로를 복원하는 방식으로 우회했습니다.

<br>

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run lint
```

### 환경 변수

| 파일 | 용도 | `VITE_API_URL` |
|---|---|---|
| `.env` | 로컬 개발 | `http://localhost:8080` |
| `.env.production` | 빌드 | `https://omok.api-cheonkio.monster` |

<br>

## 배포

`main` 브랜치에 push하면 GitHub Actions가 빌드 후 `CheonKiO.github.io`로 자동 배포합니다.

<br>

## 향후 계획

- [ ] 방 URL 직접 공유 (링크 접속 시 로그인 후 해당 방으로 자동 이동)
- [ ] 한수 무르기 (서버 연동 + 상대방 동의 플로우)
- [ ] 재연결 후 타이머 동기화
