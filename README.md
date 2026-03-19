# HobbyHop

**Author:** Sungsu Kim  

Web app to discover and host **local hobby meetups**: search by title, category, and distance; create groups with schedule and map location; join requests include **email + phone** for the host.

---

## Milestone #1 — 개요·기술·패턴

- **이름:** HobbyHop  
- **목적:** 공통 취미와 지리적 근접성으로 지역 모임을 발견·생성·참여. Google Maps로 온라인에서 오프라인 만남까지 연결.  
- **사용자:** 성인 취미/사교 사용자, 전문성 공유(운동·음악·학습 등).  
- **기술:** TypeScript, Node.js, **Next.js (App Router)**, **MongoDB**, Google Maps API.  
- **패턴 (코드):**  
  - **Factory** — `lib/factories/group-factory.ts` (카테고리별 기본 설명·태그).  
  - **Mediator** — `lib/mediator/search-mediator.ts` (검색 + 랭킹 + 참가 상태 한 번에).  
  - **Repository** — `lib/repository/group-repository.ts`, `participant-repository.ts` (Mongo 세부 캡슐화).

## Milestone #2 — 요구사항·시나리오·물리·데이터

**기능:** 이메일/비밀번호 가입·로그인; 그룹 생성(제목·설명·**카테고리**·정원·일정·위치); 검색·지도·목록·상세; **연락처로 참가 신청**; 호스트 승인/거부.

**비기능:** 검색은 MongoDB 인덱스·프로젝션으로 응답 시간 단축을 목표(문서 기준 2초 이내).

**3계층:** 브라우저(클라이언트) → Next.js `app/api/*`(컨트롤러) → **MongoDB**; 외부 Google Maps.

**컬렉션 개요:**

| 컬렉션        | 내용 |
|---------------|------|
| `users`       | 이메일, 이름, 비밀번호 해시 |
| `groups`      | 호스트, 제목, 카테고리, 태그, 일정, 정원, 주소·좌표, GeoJSON `location` |
| `participants`| 그룹·사용자, **contactEmail/contactPhone**, 상태(pending/approved/rejected) |

자격 증명은 저장소에 **커밋하지 마세요**. `.env.example`만 참고하세요.

## Milestone #3 — MVC·프로세스

- **Model:** Mongo + Repository + `lib/types.ts` (`Group`, `GroupParticipant`).  
- **View:** `app/*`, `components/*`.  
- **Controller:** `app/api/groups/*`, `app/api/participants/*`, `app/api/auth/*`.

**검색 흐름:** Discover → `POST /api/groups/search` → `executeGroupSearch` → `GroupRepository.findByFilters` → 목록·지도 동일 JSON.

**참가:** `POST /api/participants` with `groupId`, `userId`, `contactEmail`, `contactPhone` → 호스트가 `PATCH /api/participants/:id` 로 승인/거부.

## UI 테마

전역 **블루** 테마: `app/globals.css` 디자인 토큰, 컴포넌트·`public/logo.svg`·`icon.svg` 정합.

## Getting started

1. Node 18+, [pnpm](https://pnpm.io).  
2. `cp .env.example .env.local` 후 `MONGODB_URI` 설정.  
3. `pnpm install`  
4. `pnpm db:init` — MongoDB 인덱스 생성  
5. `pnpm dev` → [http://localhost:3000](http://localhost:3000)

## API docs

`/api-docs` — Swagger UI (`/api/swagger-doc`).

## Scripts

- `pnpm db:init` — `scripts/init-db.ts` (Mongo 인덱스)

---

Questions: open an issue on your repository.
