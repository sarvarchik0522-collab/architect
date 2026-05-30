# 🏛️ Arxitektor Kundaligi

Professional arxitektorlar uchun **to'liq bepul**, **offline ishlaydigan** web platforma.

## 🚀 Ishga tushirish

```bash
# 1. Paketlar o'rnatish
npm install

# 2. Database yaratish
npx prisma migrate dev --name init

# 3. Demo ma'lumotlar kiritish
npx prisma db seed

# 4. Ishga tushirish
npm run dev
```

🔑 **Login:** `architect@demo.com` · **Parol:** `admin123`  
🌐 **URL:** `http://localhost:3000`

---

## ✅ Modullar

| Modul | Xususiyatlar |
|-------|-------------|
| 🏠 Dashboard | Statistika, bugungi deadline, faol loyihalar, oxirgi kundaliklar |
| 📐 Loyihalar | 7 status, fayl/rasm yuklash, izohlar, vazifalar tab |
| 📖 Kundalik | Timeline + ro'yxat, kayfiyat emoji, bajarilgan/muammolar/qarorlar |
| 👥 CRM | Mijoz kartasi, loyihalar, to'lov tarixi |
| ✅ Vazifalar | Kanban board (drag & drop), prioritet, deadline |
| 📁 Hujjatlar | 5 ta papka, PDF/DOCX/JPG yuklash + ko'rish |
| 💰 Moliya | Daromad/Xarajat, bar chart, oylik/yillik hisobot |
| 🔍 Qidiruv | Global real-time debounced qidiruv |
| 👤 Profil | Ma'lumot + parol yangilash |
| 🌙 Dark/Light | Tema almashtirish |

## 🛠️ Texnologiyalar

```
Next.js 14 (App Router) · TypeScript · TailwindCSS · Shadcn UI
Prisma ORM · SQLite · NextAuth.js · Recharts · Lucide Icons
```

## 📁 Tuzilma

```
architect-diary/
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── projects/[id]/
│   │   ├── diary/[id]/
│   │   ├── clients/[id]/
│   │   ├── tasks/
│   │   ├── documents/
│   │   ├── finance/
│   │   ├── search/
│   │   └── profile/
│   └── api/            ← REST API endpoints
├── components/ui/      ← Shadcn UI
├── lib/                ← prisma, auth, utils
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── public/uploads/     ← Yuklangan fayllar
```

## 🔧 .env fayli

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```
