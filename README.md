# E-Station Rental OS

Система управления арендой рабочих станций EasyWorkStation / E-Station.

## Стек

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **PostgreSQL** + **Prisma 7** ORM
- **Tailwind CSS 4** + **shadcn/ui**
- **Supabase Auth**
- **Zod 4** для валидации

## Быстрый старт

```bash
# 1. PostgreSQL (Docker или локально)
docker compose up -d
# или используйте локальный PostgreSQL

# 2. Переменные окружения
cp .env.example .env
# Заполните DATABASE_URL и Supabase ключи

# 3. Зависимости
npm install

# 4. Генерация Prisma Client
npx prisma generate

# 5. Миграции
npx prisma migrate dev

# 6. Демо-данные
npx prisma db seed

# 7. Запуск
npm run dev
```

Открыть http://localhost:3000

## Структура проекта

```
src/
├── app/              # Next.js pages (App Router)
│   ├── (dashboard)/  # Основные страницы (sidebar layout)
│   └── login/        # Авторизация
├── actions/          # Server Actions (create, update, delete)
├── components/       # React компоненты
│   ├── ui/           # shadcn/ui
│   ├── layout/       # Sidebar, Header
│   ├── assets/       # Формы и фильтры станций
│   ├── accessories/  # Формы и фильтры аксессуаров
│   ├── clients/      # Формы и фильтры клиентов
│   ├── inventory/    # Корректировки склада
│   └── shared/       # PageHeader, StatusBadge
├── domain/           # Zod-схемы валидации
├── services/         # Бизнес-логика + Prisma queries
├── lib/              # Утилиты, константы, Supabase/Prisma клиенты
└── generated/        # Сгенерированный Prisma Client
```

## Реализованные модули (Фазы 1-2)

- **Dashboard** — KPI карточки (станции, доступные, в аренде, клиенты)
- **Станции** — CRUD, фильтры по статусу, поиск, карточка с историей аренд
- **Аксессуары** — CRUD, категории, остатки на складе
- **Клиенты** — CRUD, паспортные данные, теги, история сделок
- **Склад** — остатки, корректировки (поступление/списание/возврат), лог движений
- **Sidebar** — навигация по всем модулям, responsive
- **Auth** — Supabase, middleware-защита маршрутов

## Следующие фазы

- **3**: Сделки / Аренды + проверка пересечений дат + резерв аксессуаров
- **4**: Платежи / Расходы + KPI расчёты
- **5**: Dashboard KPI + Календарь + алерты
- **6**: Генерация документов (DOCX)
- **7**: Импорт CSV
- **8**: Отчёты (окупаемость, простой, утилизация)
- **9**: Уведомления (in-app + Telegram)

## Модель данных

17 таблиц: User, Asset, Accessory, InventoryItem, Configuration, ConfigurationLine, Client, Deal, Rental, RentalPeriod, RentalAccessoryLine, DeliveryTask, Payment, Expense, Document, InventoryMovement, AuditLog.

Все цены хранятся в **копейках** (integer).
