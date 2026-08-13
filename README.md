# The Copper Grill

A restaurant ordering and kitchen management app, built to demonstrate role-based
access control with three roles: Admin, Kitchen, and Customer. The use case is
real enough to actually use — customers order food, kitchen staff work through
tickets on a live board, and admins run the place, including placing an order for
a customer who called in or is having trouble with the app.

Order updates push over WebSockets, so the kitchen board updates the moment an
order comes in or changes status — no polling, no manual refresh.

## Roles

| Role     | Can do                                                                                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin    | Manage the menu and categories, manage staff accounts, place orders on behalf of any customer, update or cancel any order, view every order, view the audit log |
| Kitchen  | View the live kitchen board, move orders through Pending → Preparing → Ready → Completed                                                                        |
| Customer | Browse the menu, build a cart, place an order, track it live, cancel it while it's still pending                                                                |

Permissions are enforced on the backend, not the frontend. Every route runs
through an `authorize()` middleware check, and Socket.io events go through the
same check on the socket handshake. The frontend just hides buttons a role
shouldn't see — that's for a clean UI, not for security. Hitting the API
directly with the wrong role gets a 403 no matter what.

The one endpoint worth calling out specifically: `POST /api/orders/on-behalf`.
Admin-only. It creates an order under a chosen customer's account and records
which admin placed it (`placedByStaffId`), so it shows up correctly in that
customer's order history while staying traceable in the audit log.

## Stack

- Frontend: Next.js 14 (App Router), TypeScript, Tailwind, Zustand, Socket.io-client
- Backend: Node.js, Express, TypeScript, Socket.io
- Database: PostgreSQL via Prisma
- Auth: JWT (access + refresh) in httpOnly cookies. Staff sign in with email +
  password (bcrypt-hashed). Customers sign in with just name + phone number —
  no password. This is simplified for the assessment; a real deployment would
  add SMS-based OTP verification on the phone step instead of trusting it
  outright.
- Validation: Zod on every route that accepts a body
- Tests: Jest + Supertest, covering role enforcement on both the REST API and
  the customer phone-login flow
- Docker + docker-compose
- GitHub Actions CI (build + test on push)

## Running it

### Docker

```bash
docker compose up --build
```

Then, once containers are up:

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

Frontend: http://localhost:3000
API: http://localhost:4000/api

### Locally

**Backend**

```bash
cd backend
cp .env.example .env      # set DATABASE_URL, JWT secrets
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev                # http://localhost:4000
```

**Frontend**

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                # http://localhost:3000
```

**Tests**

```bash
cd backend
npm test
```

## Test accounts

Created by the seed script.

| Role     | Sign in with                                           |
| -------- | ------------------------------------------------------ |
| Admin    | admin@foodapp.com / Password@123                       |
| Kitchen  | kitchen@foodapp.com / Password@123                     |
| Customer | phone 9999999999 (no password — just enter the number) |

Any new phone number works too — first time signing in, it'll ask for a name
and create the account on the spot. There's no public way to create an Admin
or Kitchen account; those only get created by an existing Admin from the Staff
& Users page, so nobody can escalate their own access through the login form.

## A few decisions worth explaining

Role isn't just trusted from the JWT — every authenticated request re-fetches
the user's current role and active status from the database. So if an Admin
deactivates someone mid-session, that takes effect on their very next request
instead of waiting for their token to expire.

Same idea for sockets: which rooms a socket joins (`kitchen`, `customer:<id>`,
etc.) is decided server-side from the verified token during the handshake. A
client can't ask to join the kitchen room by itself.

Order status can't skip steps. Pending can go to Preparing or Cancelled, but
not straight to Completed — that's enforced in the order service, not just
suggested by the UI.

When an Admin places an order for a customer, the order still belongs to that
customer (it shows up in their history, counts toward their totals), but the
record of who actually placed it is kept separately. Seemed like the more
honest way to model "staff helped with this" without pretending the customer
placed it themselves.

Socket.io broadcasts are optional at the code level — if sockets haven't been
started (like in the test suite, which hits the Express app directly without
booting the full server), the app just skips the live update instead of
crashing the request. In the actual running app, sockets are always on, so
this only matters for tests and any lightweight script that imports the app
directly.

On the visual side: the app leans into a warm orange-to-berry gradient
(inspired by a food-delivery app reference I was pointed to) across every
screen — login, menu, cart, kitchen board, and the admin pages — with content
sitting in white or dark cards on top so text stays readable against it. The
cart and kitchen board specifically borrow the look of a physical order slip:
a die-cut notch, dashed tear lines, monospace pricing.

## Folder structure

```
backend/
  prisma/            schema, migrations, seed
  src/
    modules/         auth, users, menu, orders, audit
    middleware/       authenticate, authorize, validate, errorHandler
    sockets/          Socket.io setup, JWT handshake auth, role-based rooms
    utils/            jwt signing, audit log writer
  tests/              integration tests (Jest + Supertest)

frontend/
  app/
    (auth)/login                     staff + customer sign-in, tabbed
    menu, cart, orders/[id]          customer-facing
    kitchen                          kitchen board (Kitchen + Admin)
    admin/                           menu management, staff, place-order, audit logs
  components/         RoleGuard, Navbar, OrderCard, CartFlyAnimation
  hooks/              useAuth, useSocket
  lib/                api client, socket client, cart store
```

## Extras beyond the minimum

Dockerized, integration tests around role enforcement, a GitHub Actions
pipeline, an audit log the Admin can browse, search/filter/pagination on the
menu and audit logs, and live updates over WebSockets instead of polling.
