# How to Use 🚀

## Run All Services with Docker

```bash
docker compose -f docker-compose-all.yml up
```

---

## Frontend

- เปิดที่ [http://localhost/](http://localhost/)

---

## Backend

- **Swagger UI:**  
  [http://localhost/swagger/index.html](http://localhost/swagger/index.html)

---

## Keycloak

### Admin Console

- [http://localhost/admin](http://localhost/admin)
- **Username:** `admin`
- **Password:** `admin`

### User Console

- **Username:** `test@example.com`
- **Password:** `test123`

---
>เริ่มต้นครั้ง เเรก ให้ออกจากระบบก่อนกรณีเข้าสู่ระบบค้างอยู่
> กรุณาตรวจสอบว่า Docker ทำงานอยู่ และพอร์ตไม่ถูกใช้งานซ้ำ 

---


## Services & Ports

- Web (Next.js): http://localhost/
- API (Go): ผ่าน Nginx ที่ http://localhost/api/v1 (ภายใน container เปิดที่ 8082)
- Swagger: http://localhost/swagger/index.html
- Keycloak Admin: http://localhost/admin
- Keycloak OIDC issuer: http://localhost:8080/realms/Devpool_project

## Environment Variables (สำคัญ)

ค่าเริ่มต้นถูกกำหนดใน `docker-compose-all.yml` บริการ `wongnok-web` และ `go-wongnok` เช่น

- FRONTEND (wongnok-web)
  - INTERNAL_API_BASE=http://go-wongnok:8080
  - NEXTAUTH_SECRET=…
  - NEXTAUTH_URL=http://localhost:3000
  - KEYCLOAK_CLIENT_ID=wongnok
  - KEYCLOAK_CLIENT_SECRET=…
  - KEYCLOAK_ISSUER=http://localhost:8080/realms/Devpool_project
  - KEYCLOAK_POST_LOGOUT_REDIRECT_URI=http://localhost
- BACKEND (go-wongnok)
  - DATABASE_URL=postgres://postgres:pass2word@postgres:5432/wongnok
  - KEYCLOAK_URL=http://keycloak:8080
  - KEYCLOAK_REALM=Devpool_project
  - KEYCLOAK_CLIENT_ID/SECRET=…

## Quick commands

เริ่มทุกบริการ:

```bash
docker compose -f docker-compose-all.yml up
```

หยุดทุกบริการ:

```bash
docker compose -f docker-compose-all.yml down
```

รีสตาร์ทเฉพาะเว็บ (Next.js):

```bash
docker compose -f docker-compose-all.yml restart wongnok-web
```

บิลด์ใหม่ (กรณีเปลี่ยน Dockerfile/แพ็กเกจ):

```bash
docker compose -f docker-compose-all.yml build --no-cache
```

## Testing & Lint (ภายใน container)

- Frontend unit tests: `npm test` ในคอนเทนเนอร์ `wongnok-web`
- Lint (Next.js): `npm run lint` ในคอนเทนเนอร์ `wongnok-web`

## Troubleshooting

- พอร์ตชน: ปิดโปรแกรมที่ใช้พอร์ต 80/443/3000/8080/8082/5432 หรือเปลี่ยนพอร์ตใน compose
- เข้าสู่ระบบวน/401: ออกจากระบบ Keycloak, ลบคุกกี้ไซต์ localhost แล้วลองใหม่
- Swagger เข้าไม่ได้: ตรวจสถานะคอนเทนเนอร์ `go-wongnok` และ `nginx-proxy`
- ครั้งแรกที่เปิด ควร “ออกจากระบบ” ก่อน หากเคยล็อกอินค้างไว้

## Security (Dev only)

- เปลี่ยนรหัสผ่าน Keycloak admin/test ก่อนใช้งานจริง
- เก็บค่า SECRET/CLIENT_SECRET นอกไฟล์สาธารณะ (เช่นผ่าน `.env` หรือ secret manager) ใน Production
