# Prisma

## Generate Client

```bash
pnpm --filter web db:generate
```

## Apply Schema Locally

초기 개발 단계에서는 아래 명령으로 로컬 DB에 스키마를 반영합니다.

```bash
pnpm --filter web db:push
```

마이그레이션 이력이 필요한 시점부터는 아래 명령을 사용합니다.

```bash
pnpm --filter web db:migrate
```

## Open Studio

```bash
pnpm --filter web db:studio
```

## Notes

- `schema.prisma`는 ERD v0.4 기준 MVP 데이터 구조의 v0.1 초안입니다.
- 실제 API 연동 과정에서 필드명과 enum은 변경될 수 있습니다.
- DB 변경의 최종 소유자는 팀장이 관리합니다.
