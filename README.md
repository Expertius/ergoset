# E-Station Rental OS

Система управления арендой рабочих станций EasyWorkStation / E-Station.

## Стек

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **PostgreSQL** + **Prisma 7** ORM
- **Tailwind CSS 4** + **shadcn/ui**
- **JWT Auth** (кастомная, cookie-based)
- **Zod 4** для валидации
- **docxtemplater** для генерации DOCX

## Быстрый старт

```bash
# 1. PostgreSQL (Docker или локально)
docker compose up -d

# 2. Переменные окружения
cp .env.example .env
# Заполните DATABASE_URL, JWT_SECRET

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
│   │   ├── assets/       # Станции CRUD
│   │   ├── accessories/  # Аксессуары CRUD
│   │   ├── clients/      # Клиенты CRUD
│   │   ├── deals/        # Сделки + аренды
│   │   ├── payments/     # Платежи + расходы
│   │   ├── calendar/     # Календарь аренд
│   │   ├── documents/    # Документы
│   │   ├── reports/      # Отчёты + аналитика
│   │   ├── inventory/    # Склад
│   │   ├── import/       # CSV импорт
│   │   └── settings/     # Настройки
│   └── login/            # Авторизация
├── actions/          # Server Actions
├── components/       # React компоненты
│   ├── ui/           # shadcn/ui
│   ├── layout/       # Sidebar, Header
│   ├── deals/        # Формы + действия сделок
│   ├── payments/     # Формы платежей/расходов
│   ├── documents/    # Генерация документов
│   ├── import/       # CSV импорт визард
│   ├── notifications/ # Панель уведомлений
│   └── shared/       # PageHeader, StatusBadge
├── domain/           # Zod-схемы валидации
├── services/         # Бизнес-логика + Prisma queries
├── lib/              # Утилиты, auth, RBAC, аудит
└── generated/        # Сгенерированный Prisma Client
```

## Реализованные модули

### Фаза 1-2: Фундамент + CRUD
- **Auth** — JWT cookie-based, middleware-защита маршрутов
- **Dashboard** — KPI карточки, финансовые метрики, уведомления
- **Станции** — CRUD, фильтры, детальная страница с историей аренд
- **Аксессуары** — CRUD, категории, остатки на складе
- **Клиенты** — CRUD, паспортные данные, теги, история сделок
- **Склад** — остатки, корректировки, лог движений

### Фаза 3: Сделки и аренды
- **Deals** — создание/просмотр/фильтры, привязка к клиенту и станции
- **Rentals** — периоды аренды, конфликты дат, workflow (extend/return/buyout/cancel)
- **Asset conflict validation** — предотвращение двойного бронирования

### Фаза 4: Финансы
- **Payments** — CRUD, типы (аренда/доставка/сборка/залог), статусы, способы оплаты
- **Expenses** — расходы по категориям с привязкой к станциям
- **Finance summary** — доход/расход/прибыль

### Фаза 5: Dashboard + Календарь
- **Dashboard KPIs** — станции, доступность, утилизация, доход/расход/прибыль за месяц
- **Upcoming returns** — предстоящие возвраты (7/3/1 день)
- **Calendar** — визуализация аренд на сетке, все события за 2 месяца

### Фаза 6: Документы
- **DOCX generation** — генерация из шаблонов (docxtemplater)
- **Document types** — договор аренды, акт приёма-передачи, акт возврата, договор выкупа
- **Document management** — список, статусы, привязка к сделкам

### Фаза 7: CSV импорт
- **Import wizard** — загрузка файла, маппинг колонок, превью данных
- **Entity import** — станции, аксессуары, клиенты, платежи
- **Error logging** — логирование ошибок по строкам

### Фаза 8: Отчёты
- **Asset report** — доход, расходы, прибыль, простой, потери от простоя, окупаемость
- **Client report** — оплаченные суммы, количество сделок/аренд
- **Utilization report** — утилизация и доход по месяцам (6 мес.)

### Фаза 9: Уведомления
- **In-app notifications** — панель на дашборде с приоритезацией
- **Alert types** — возвраты, простой, нехватка аксессуаров, неоплаченные платежи
- **Telegram** — интеграция (настраивается через .env)

### Сквозные фичи
- **RBAC** — роли Admin/Manager/Logistics, route-level enforcement в middleware
- **Audit Log** — запись всех критичных действий (create/update/delete/extend/return/buyout/cancel)

## Модель данных

17 таблиц: User, Asset, Accessory, InventoryItem, Configuration, ConfigurationLine, Client, Deal, Rental, RentalPeriod, RentalAccessoryLine, DeliveryTask, Payment, Expense, Document, InventoryMovement, AuditLog.

Все цены хранятся в **копейках** (integer).

## Роли

| Роль | Доступ |
|------|--------|
| ADMIN | Полный доступ |
| MANAGER | Клиенты, сделки, платежи, документы, календарь, отчёты |
| LOGISTICS | Станции, аксессуары, склад, календарь |
