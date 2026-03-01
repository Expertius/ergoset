# AI Changelog

## 2026-03-01 — Предрелизный аудит и рефакторинг

### Безопасность (P0)
- Добавлена авторизация в `addDeliveryCommentAction`, `updateDeliveryRateAction`, `estimateDeliveryCostsAction`
- Убран hardcoded JWT secret fallback — теперь throw если `JWT_SECRET` не задан
- Удалён мёртвый код `src/lib/supabase/` и зависимость `jsonwebtoken`

### Стабильность (P1)
- Добавлены `error.tsx`, `loading.tsx`, `not-found.tsx` для всех route groups
- Исправлен баг в `adjustInventory` — обёрнуто в транзакцию, добавлена проверка отрицательного баланса
- Все `fs.*Sync` заменены на async в `documents.ts` и `download/route.ts`
- Добавлен `take` (200) в getClients, getLeads, getAssets, getAccessories, getDocuments
- Исправлен N+1 в `deals.ts` — batch-запросы вместо per-item циклов
- Zod-валидация добавлена в auth, cabinet, documents, leads actions
- Rate limiting на `POST /api/public/leads` (5/мин) и `/api/public/contract` (10/мин)

### Производительность (P2-P3)
- `pg.Pool` — добавлен `max` (конфигурируется через `DB_POOL_MAX`)
- Добавлены `@@index` в Prisma schema (Deal, Rental, Payment, Document, Expense, DeliveryTask, Lead)
- `getTopAssetsByRevenue`, `getTopClientsByRevenue` — SQL-агрегация вместо in-memory
- `getUtilizationReport` — параллельные запросы вместо последовательных

### UX/UI (P2)
- Добавлена мобильная навигация на публичном лендинге (burger menu)
- Кнопка «Скачать» на странице документов
- `alert()` заменён на `toast` в ContractFormClient
- Ошибка загрузки отображается в StationsSection
- aria-label на навигации, кнопках сворачивания sidebar

### Code Quality
- `invite.ts` — `generateInviteToken` возвращает `{ success: false }` вместо throw
- `import.ts` — CSV-парсер обрабатывает кавычки, запятые в полях, escaped quotes, Windows CRLF
- `closeRentalByReturn` — агрегация qty по itemId (один update вместо per-line)

### Инфраструктура
- Security headers в `next.config.ts` (X-Frame-Options, X-Content-Type-Options и др.)
- Health check endpoint `/api/health`
- `.env.example` дополнен (GOOGLE_MAPS_API_KEY, TELEGRAM_*, DB_POOL_MAX)
- RBAC правила дедуплицированы (middleware импортирует из rbac.ts)
- Vitest настроен, 36 unit-тестов (RBAC, rate-limit, utils, CSV-парсер)

---

## 2026-03-01 — Ролевые личные кабинеты (ADMIN / MANAGER / LOGISTICS / CLIENT)

### Что сделано

**Схема БД:**
- Добавлена роль `CLIENT` в enum `UserRole`
- Модель `Client`: новые поля `userId` (связь с User), `inviteToken`, `inviteExpiresAt` для magic-link
- Обратная связь `User.clientProfile`

**RBAC (src/lib/rbac.ts):**
- Полная матрица доступа для 4 ролей
- Data scoping helpers: `buildDealScope()`, `buildLeadScope()` — MANAGER видит только свои
- Sanitize helpers: `sanitizePrices()`, `canSeeFinancials()`, `canSeeExpenses()`, `canSeeRetailPrices()`
- Утилиты: `getHomeRoute()`, `isStaffRole()`

**Middleware (src/middleware.ts):**
- Полная переработка: JWT decode → извлечение роли → canAccessRoute()
- CLIENT: доступ только к /cabinet/*, /invite/*
- Staff: маршруты по матрице RBAC
- Role-based redirect после авторизации

**Навигация:**
- `nav-items.ts`: добавлен `roles: Role[]` к каждому NavItem
- `getFilteredNavGroups(role)` для фильтрации
- Sidebar и MobileSidebar: фильтрация по роли через UserProvider context
- UserProvider context (user-context.tsx) передаёт роль из серверного layout

**Авторизация:**
- Login action: редирект CLIENT → /cabinet, остальные → /dashboard
- Dashboard layout: защита от CLIENT, редирект на /cabinet
- Cabinet layout: защита от не-CLIENT, редирект на /dashboard

**Magic-Link (клиентская регистрация):**
- `generateInviteToken()` — генерация invite-ссылки менеджером
- `validateInviteToken()` — проверка токена
- `activateClientAccount()` — создание User(CLIENT), привязка к Client
- UI: /invite/[token] — публичная страница активации аккаунта

**Клиентский портал (src/app/(cabinet)/):**
- CabinetHeader с навигацией + mobile menu
- Дашборд: активные аренды, предстоящие платежи, документы
- Аренды: список + детальная карточка (периоды, аксессуары, доставки, документы)
- Платежи: итоги + полный список
- Документы: скачивание
- Профиль: редактирование телефона/адреса + смена пароля
- Сервис `cabinet.ts` для data-fetching

**Ролевые дашборды:**
- AdminDashboard — полный (финансы, KPI, графики, ТОП)
- ManagerDashboard — упрощённый (мои сделки, мои лиды, мои возвраты)
- LogisticsDashboard — логистический (задачи сегодня/неделя, парк, в процессе)
- Dashboard page: switch по session.role

**Server actions — role checks:**
- Все actions (deals, clients, assets, accessories, payments, documents, logistics, inventory, import, leads) защищены `requireRole()`
- Expenses: только ADMIN
- Import/Settings: только ADMIN
- Logistics: ADMIN + LOGISTICS

**Data scoping:**
- Deals page: MANAGER видит только свои (createdById)
- Leads page: MANAGER видит только назначенные (assignedToId)
- Clients page: MANAGER видит только связанных через свои сделки
- Payments page: MANAGER видит только по своим сделкам
- Deal detail: MANAGER не видит чужие сделки (notFound)
- Lead detail: MANAGER не видит чужие лиды

**Field hiding:**
- Asset detail: purchasePrice/dealerPrice скрыты для не-ADMIN, retailPrice скрыт для LOGISTICS
- Edit button скрыт для не-ADMIN
- Payments page: expenses и financial summary скрыты для не-ADMIN
- Document download API: проверка доступа по роли (CLIENT видит только свои)

### Изменённые файлы (31):
- `prisma/schema.prisma`, `src/lib/rbac.ts`, `src/middleware.ts`
- `src/lib/auth.ts` (без изменений, уже содержит role)
- `src/actions/auth.ts`, `src/actions/deals.ts`, `src/actions/clients.ts`, `src/actions/assets.ts`, `src/actions/accessories.ts`, `src/actions/payments.ts`, `src/actions/documents.ts`, `src/actions/logistics.ts`, `src/actions/inventory.ts`, `src/actions/import.ts`, `src/actions/leads.ts`
- `src/components/layout/nav-items.ts`, `src/components/layout/sidebar.tsx`, `src/components/layout/mobile-sidebar.tsx`, `src/components/layout/user-context.tsx` (new)
- `src/app/(dashboard)/layout.tsx`, `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/assets/[id]/page.tsx`, `src/app/(dashboard)/deals/page.tsx`, `src/app/(dashboard)/deals/[id]/page.tsx`, `src/app/(dashboard)/clients/page.tsx`, `src/app/(dashboard)/payments/page.tsx`, `src/app/(dashboard)/leads/page.tsx`, `src/app/(dashboard)/leads/[id]/page.tsx`
- `src/services/deals.ts`, `src/services/clients.ts`, `src/services/payments.ts`, `src/services/leads.ts`
- `src/app/api/documents/[id]/download/route.ts`

### Новые файлы (18):
- `src/actions/invite.ts`, `src/actions/cabinet.ts`
- `src/app/invite/[token]/page.tsx`, `src/app/invite/[token]/invite-form.tsx`
- `src/app/(cabinet)/layout.tsx`, `src/app/(cabinet)/cabinet/page.tsx`
- `src/app/(cabinet)/cabinet/rentals/page.tsx`, `src/app/(cabinet)/cabinet/rentals/[id]/page.tsx`
- `src/app/(cabinet)/cabinet/payments/page.tsx`, `src/app/(cabinet)/cabinet/documents/page.tsx`
- `src/app/(cabinet)/cabinet/profile/page.tsx`, `src/app/(cabinet)/cabinet/profile/profile-form.tsx`
- `src/components/cabinet/cabinet-header.tsx`
- `src/components/dashboard/admin-dashboard.tsx`, `src/components/dashboard/manager-dashboard.tsx`, `src/components/dashboard/logistics-dashboard.tsx`
- `src/services/cabinet.ts`, `src/services/dashboard-scoped.ts`

---

## 2026-03-01 — Публичный лендинг ERGOSET + CRM лидов + Автозаполнение договоров

### Что сделано

**Модель данных:**
- Новая модель `Lead` в Prisma с enum'ами `LeadStatus`, `LeadSource`, `LeadInterest`
- Обратные связи в Asset, User, Client, Deal
- Миграция `20260301090733_add_leads_model`

**Реструктуризация маршрутов:**
- Дашборд переехал с `/` на `/dashboard`
- `/` стал публичным лендингом ERGOSET
- Middleware обновлён: публичные маршруты `/`, `/api/public/*`, `/contract/*`
- Навигация: добавлен "Лиды" в sidebar, дашборд → `/dashboard`
- `revalidatePath("/")` → `/dashboard` во всех actions

**Публичный лендинг (ergoset.ru стиль):**
- Тёмная тема, секции: Hero, преимущества, как работает подписка, доступные станции (live из БД), тарифы, конфигуратор мониторов, спеки, форма бронирования, FAQ, CTA
- Станции синхронизированы с реальным статусом + скоро освобождающиеся (endDate < 30 дней)
- Форма бронирования создаёт лид через `POST /api/public/leads`

**Public API:**
- `GET /api/public/stations` — доступные + скоро освободятся
- `POST /api/public/leads` — создание лида с сайта
- `GET/POST /api/public/contract/[token]` — данные для договора

**CRM лидов:**
- `/leads` — таблица лидов со статистикой, фильтрами (статус, источник, поиск)
- `/leads/[id]` — детали лида, редактирование, действия
- Действия: связаться, квалифицировать, переговоры, отправить форму договора, конвертировать в сделку, отклонить
- Конвертация: Lead → Client + Deal в одной транзакции

**Поток автозаполнения договора:**
- Менеджер генерирует contractToken и отправляет ссылку клиенту
- Клиент заполняет `/contract/[token]`: ФИО, паспорт, адреса
- Данные сохраняются в `Lead.contractData` (JSON)
- Менеджер проверяет (премодерация) и конвертирует в сделку

### Файлы

**Новые:**
- `prisma/migrations/20260301090733_add_leads_model/`
- `src/app/(public)/layout.tsx` — публичный layout
- `src/app/(public)/page.tsx` — лендинг
- `src/app/(public)/contract/[token]/page.tsx` — форма договора
- `src/components/public/landing-client.tsx` — основной клиентский компонент лендинга
- `src/components/public/stations-section.tsx` — live-секция станций
- `src/components/public/booking-form.tsx` — форма бронирования
- `src/components/public/contract-form-client.tsx` — форма данных для договора
- `src/app/api/public/stations/route.ts`
- `src/app/api/public/leads/route.ts`
- `src/app/api/public/contract/[token]/route.ts`
- `src/app/(dashboard)/leads/page.tsx` — список лидов
- `src/app/(dashboard)/leads/[id]/page.tsx` — детали лида
- `src/app/(dashboard)/dashboard/page.tsx` — перенесённый дашборд
- `src/services/leads.ts` — сервис лидов
- `src/actions/leads.ts` — server actions лидов
- `src/domain/leads/validation.ts` — Zod-схемы
- `src/components/leads/leads-filters-bar.tsx`
- `src/components/leads/lead-actions.tsx`
- `src/components/leads/lead-edit-form.tsx`

**Изменённые:**
- `prisma/schema.prisma` — модель Lead + enums + обратные связи
- `src/middleware.ts` — публичные маршруты
- `src/lib/constants.ts` — константы лидов
- `src/components/layout/nav-items.ts` — навигация
- `src/components/layout/sidebar.tsx` — ссылка на /dashboard
- `src/components/layout/mobile-sidebar.tsx` — ссылка на /dashboard
- `src/components/shared/page-header.tsx` — backHref prop
- `src/actions/deals.ts`, `payments.ts`, `logistics.ts` — revalidatePath("/dashboard")

---

## 2026-03-01 — Календарь: zoom-контроль для Timeline и Month Grid

### Что сделано

- Добавлены zoom-контролы в тулбар календаря (кнопки −/+, кнопка «Вместить всё»), видны только для Timeline и Month Grid view.
- **Timeline view**: динамический `COL_W` через ResizeObserver — режим «fit-to-screen» вмещает все месяцы без горизонтальной прокрутки. При уменьшении масштаба автоматически скрываются номера дней, уменьшаются бары, sidebar и высота строк.
- **Month Grid view**: при zoom-out + range > 1 месяцы выстраиваются в мульти-колоночную CSS Grid сетку (3 колонки для 3м/6м), ячейки уменьшаются, события заменяются цветными точками с тултипами.
- Zoom-состояние хранится локально в `CalendarPageClient`, не засоряет URL.

### Файлы

- `src/components/calendar/calendar-page-client.tsx` — zoom state + передача props
- `src/components/calendar/calendar-toolbar.tsx` — UI zoom controls
- `src/components/calendar/views/timeline-view.tsx` — динамический COL_W, адаптивный контент
- `src/components/calendar/views/month-grid-view.tsx` — мульти-колоночный layout, компактный режим

## 2026-03-01 — Логистика: трекинг доставок, расходы, ЗП и аналитика

### Что сделано

**Расширение БД**
- `DeliveryTask` — 30+ новых полей: маршрут (pointFrom/To + координаты), расстояние, хронометраж 6 этапов (погрузка, дорога, подъём, сборка, разборка, разгрузка), расходы (топливо, дороги, прочее), ЗП (фикс + за км), этаж/лифт, комментарии.
- `DeliveryComment` — история комментариев по доставке с привязкой к автору.
- `DeliveryRate` — ставки расчёта: фикс за доставку, за км, топливо за км, за сборку/разборку, за этаж без лифта.
- `Client.deliveryNotes` — общие заметки по доставке для следующих логистов.
- `Expense.deliveryTaskId` — привязка расхода к конкретной задаче доставки.

**Google Maps API**
- `src/lib/maps.ts` — Distance Matrix API (расстояние + время) и Geocoding API.
- Расчёт маршрута по кнопке в форме задачи, fallback на ручной ввод.

**Сервисный слой**
- Полный CRUD, workflow (start → complete), автоматический расчёт расходов/ЗП при завершении.
- При `completeDeliveryTask` — авто-создание `Expense` записей (delivery_cost, assembly_cost).
- `calculateDeliveryCosts()` — предварительная оценка расходов по ставкам.
- `getDeliveryAnalytics()`, `getDeliveryCostsTrend()` — агрегаты для аналитики.

**UI: страница /logistics (3 таба)**
- Канбан-борд: 4 колонки (запланировано / в работе / завершено / отменено), карточки задач.
- Таблица: фильтры по статусу/типу, все метрики в колонках.
- Аналитика: KPI-карточки (доставки, пробег, время, расходы, ЗП), график расходов по месяцам, настройки ставок.

**Модальная форма задачи**
- Вкладка "Маршрут": точки А/Б, расчёт через Maps API, этаж/лифт, оценка расходов.
- Вкладка "Хронометраж": 6 полей по этапам + расходы, завершение задачи.
- Вкладка "Комментарии": лента + добавление.
- Вкладка "Клиент": заметки по доставке, адреса из аренды.

**Toggle на дашборде**
- Переключатель "Учитывать доставку/сборку" — пересчитывает прибыль и маржу без delivery/assembly расходов и доходов.

### Файлы

Новые:
- `src/lib/maps.ts`
- `src/domain/logistics/validation.ts`
- `src/components/logistics/types.ts`
- `src/components/logistics/delivery-kanban.tsx`
- `src/components/logistics/delivery-table.tsx`
- `src/components/logistics/delivery-task-modal.tsx`
- `src/components/logistics/delivery-analytics.tsx`
- `src/components/logistics/delivery-cost-trend-chart.tsx`
- `src/components/dashboard/delivery-cost-toggle.tsx`
- `src/app/(dashboard)/logistics/page.tsx`

Изменённые:
- `prisma/schema.prisma` — DeliveryTask, DeliveryComment, DeliveryRate, Client, Expense, User
- `src/services/logistics.ts` — полная переработка
- `src/actions/logistics.ts` — полная переработка
- `src/services/analytics.ts` — `getDeliveryAssemblyCosts()`
- `src/lib/constants.ts` — цвета статусов/типов доставки
- `src/components/layout/nav-items.ts` — пункт "Логистика"
- `src/app/(dashboard)/page.tsx` — delivery cost toggle

---

## 2026-03-01 — Расширение календаря: 2 новых вида + мульти-период + фильтры

### Что сделано

**Новые виды календаря**
- **Доступность** (`availability-view.tsx`): карточки станций в сетке с текущим статусом, клиентом, датой освобождения, мини-таймлайном загрузки на весь период, маркером "сегодня".
- **Агенда** (`agenda-view.tsx`): вертикальный список событий, сгруппированный по дням (показываются только дни с началом/концом аренды). Индикаторы "Начало"/"Конец", статус-бейджи, суммы.

**Мульти-период 1 / 3 / 6 месяцев**
- Серверная страница (`calendar/page.tsx`): новый searchParam `range`, вычисление `from`/`to` с учётом диапазона.
- Переключатель `1м / 3м / 6м` в тулбаре рядом с навигацией.
- **Месяц**: при range > 1 рендерит несколько сеток подряд с заголовками.
- **Таймлайн**: генерирует дни для всех месяцев, разделители между месяцами, подзаголовки (Янв/Фев/...), адаптивная ширина колонок (24px при 3+ мес).
- Таблица, Доступность, Агенда — работают с любым range из коробки.

**Улучшение фильтров**
- Полоса активных фильтров (Row 3) — всегда видна при наличии фильтров: каждый статус отдельным чипом, тип сделки, станция, поиск.
- Кнопка "Сбросить все" — яркая, destructive variant, видна на десктопе и мобиле.
- Каждый фильтр-чип удаляется по клику на ×.
- Badge "Период: 3 мес." для non-default range.

**Тулбар**
- 5 видов в свитчере: Месяц, Таймлайн, Таблица, Станции, Агенда.
- Навигация prev/next сдвигает на `range` месяцев.
- Заголовок показывает диапазон при range > 1 ("Мар — Май 2026").

### Файлы

- `src/app/(dashboard)/calendar/page.tsx` — range param, extended date calc
- `src/components/calendar/calendar-page-client.tsx` — range prop, 2 new views
- `src/components/calendar/calendar-toolbar.tsx` — range switcher, 5 view buttons, active filters bar
- `src/components/calendar/views/availability-view.tsx` — **новый**
- `src/components/calendar/views/agenda-view.tsx` — **новый**
- `src/components/calendar/views/month-grid-view.tsx` — multi-month support
- `src/components/calendar/views/timeline-view.tsx` — multi-month support

---

## 2026-03-01 — Dark theme + расширенный дашборд с финансовой аналитикой

### Что сделано

**Dark theme**
- Подключен `ThemeProvider` (next-themes) в root layout с `attribute="class"`, `defaultTheme="system"`.
- Создан компонент `ThemeToggle` — циклический переключатель light / dark / system (Sun / Moon / Monitor иконки).
- Встроен в `Header` рядом с кнопкой выхода.

**Библиотека графиков**
- Установлен `recharts`, добавлен shadcn `chart` компонент (ChartContainer, ChartTooltip, ChartLegend).

**Сервис аналитики** (`src/services/analytics.ts`)
- `getRevenueExpenseTrend(months)` — помесячный тренд доход/расход/прибыль.
- `getRevenueByKind(period)` — разбивка дохода по типам (аренда, доставка, продажа и т.д.).
- `getExpensesByCategory(period)` — разбивка расходов по категориям.
- `getFinancialKPIs(period)` — маржинальность, средний чек, оборачиваемость капитала, доход на станцию.
- `getPeriodComparison()` — текущий vs прошлый месяц с дельтой %.
- `getDealsFunnel()` — воронка сделок по статусам.
- `getTopAssetsByRevenue(limit)` — ТОП станций по выручке.
- `getTopClientsByRevenue(limit)` — ТОП клиентов по выручке.

**Компоненты дашборда** (`src/components/dashboard/`)
- `KpiDeltaCard` — карточка KPI со стрелкой и % дельтой vs прошлый период.
- `RevenueTrendChart` — BarChart доходов и расходов за 6 месяцев.
- `UtilizationChart` — AreaChart утилизации парка.
- `RevenueBreakdownChart` — PieChart (donut) структуры дохода.
- `ExpenseBreakdownChart` — PieChart (donut) структуры расходов.
- `TopAssetsChart` — горизонтальный BarChart ТОП-5 станций.
- `TopClientsChart` — горизонтальный BarChart ТОП-5 клиентов.

**Расширенный дашборд** (`src/app/(dashboard)/page.tsx`)
- Ряд 1: статистика парка станций (4 карточки).
- Ряд 2: финансовые KPI с дельтой vs прошлый месяц (доход, расходы, прибыль, утилизация).
- Ряд 3: бизнес-KPI (маржинальность, средний чек, оборачиваемость капитала, доход на станцию).
- Ряд 4: графики трендов (доход/расходы + утилизация).
- Ряд 5: круговые диаграммы (структура дохода + структура расходов).
- Ряд 6: ТОП-5 рейтинги (станции + клиенты по выручке).
- Ряд 7: предстоящие возвраты + уведомления (без изменений).

### Файлы изменены
- `src/app/layout.tsx` — ThemeProvider
- `src/components/layout/header.tsx` — ThemeToggle
- `src/app/(dashboard)/page.tsx` — расширенный дашборд

### Файлы созданы
- `src/components/layout/theme-provider.tsx`
- `src/components/layout/theme-toggle.tsx`
- `src/services/analytics.ts`
- `src/components/ui/chart.tsx` (shadcn)
- `src/components/dashboard/kpi-delta-card.tsx`
- `src/components/dashboard/revenue-trend-chart.tsx`
- `src/components/dashboard/utilization-chart.tsx`
- `src/components/dashboard/revenue-breakdown-chart.tsx`
- `src/components/dashboard/expense-breakdown-chart.tsx`
- `src/components/dashboard/top-assets-chart.tsx`
- `src/components/dashboard/top-clients-chart.tsx`

### Зависимости
- `recharts` (добавлена)

---

## 2026-03-01 — Переработка календаря (3 вида) + фильтры и сортировка по всему проекту

### Календарь — 3 вида
- **Месячная сетка** (улучшена): tooltips при наведении, мобильный компактный список вместо 7-колоночной таблицы
- **Таймлайн по станциям** (новый): Ганта — строки = станции, столбцы = дни, горизонтальные полосы аренд с цветовой кодировкой по статусу. Сразу видна доступность
- **Табличный вид** (новый): сортируемая таблица всех аренд за период, мобильный карточный вид
- Переключатель видов (month/timeline/table) в тулбаре

### Фильтры календаря
- По статусу сделки (multi-select чекбоксы)
- По типу сделки
- По станции
- По клиенту (текстовый поиск с debounce)
- На мобильном: фильтры в Sheet с badge-счётчиком

### Сортировка на всех списковых страницах
- Создан переиспользуемый `SortableHeader` компонент (URL-based сортировка)
- Все сервисы расширены: `sortBy` + `sortOrder` параметры
- Страницы: станции, сделки, клиенты, платежи, документы, аксессуары, склад

### Новые фильтры
- `/payments` — PaymentFiltersBar (поиск + статус + вид)
- `/documents` — DocumentFiltersBar (тип + статус)
- `/inventory` — InventoryFiltersBar (поиск + категория)
- `/deals` — добавлен debounce на поиск

### Мобильная адаптация (сквозная)
- Все фильтры: `flex-col sm:flex-row`
- Все таблицы: `overflow-x-auto`
- Календарь: скрытие/показ элементов через `hidden sm:block` / `sm:hidden`
- Таймлайн: карточный стек на мобильном

### Файлы
Новые:
- `src/components/calendar/calendar-page-client.tsx`
- `src/components/calendar/calendar-toolbar.tsx`
- `src/components/calendar/views/month-grid-view.tsx`
- `src/components/calendar/views/timeline-view.tsx`
- `src/components/calendar/views/table-view.tsx`
- `src/components/shared/sortable-header.tsx`
- `src/components/payments/filters-bar.tsx`
- `src/components/documents/filters-bar.tsx`
- `src/components/inventory/filters-bar.tsx`

Изменённые:
- `src/services/dashboard.ts` — расширены фильтры CalendarEvents
- `src/services/assets.ts` — sortBy/sortOrder
- `src/services/deals.ts` — sortBy/sortOrder
- `src/services/clients.ts` — sortBy/sortOrder
- `src/services/payments.ts` — sortBy/sortOrder
- `src/services/documents.ts` — sortBy/sortOrder
- `src/services/accessories.ts` — sortBy/sortOrder
- `src/services/inventory.ts` — фильтры search/category
- `src/app/(dashboard)/calendar/page.tsx` — все searchParams
- `src/app/(dashboard)/assets/page.tsx` — SortableHeader
- `src/app/(dashboard)/deals/page.tsx` — SortableHeader
- `src/app/(dashboard)/clients/page.tsx` — SortableHeader + колонка даты
- `src/app/(dashboard)/payments/page.tsx` — SortableHeader + фильтры
- `src/app/(dashboard)/documents/page.tsx` — SortableHeader + фильтры
- `src/app/(dashboard)/accessories/page.tsx` — SortableHeader
- `src/app/(dashboard)/inventory/page.tsx` — SortableHeader + фильтры
- `src/components/deals/deals-filters-bar.tsx` — debounce
- `src/components/clients/filters-bar.tsx` — мобильный layout
- `src/components/accessories/filters-bar.tsx` — мобильный layout
