# AI Changelog

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
