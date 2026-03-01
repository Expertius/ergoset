import type {
  AssetStatus, DealStatus, DealType, PaymentKind, PaymentStatus,
  PaymentMethod, AccessoryCategory, ExpenseCategory, DocumentType,
  DocumentStatus, DeliveryTaskType, DeliveryTaskStatus,
  LeadStatus, LeadSource, LeadInterest,
} from "@/generated/prisma/browser";

/** Base station price in kopecks (239 990 ₽) */
export const BASE_STATION_PRICE = 23_999_000;

export const UPHOLSTERY_MATERIAL_LABELS: Record<string, string> = {
  bionica: "Искусственная кожа Bionica",
  aurora: "Искусственная замша Aurora (LE)",
  natural_leather: "Натуральная кожа",
  custom_material: "Собственный материал",
};

export const SERVICE_CATALOG_LABELS: Record<string, string> = {
  assembly: "Сборка станции",
  white_frame: "Белый цвет металлокаркаса",
  rental_test: "Аренда-тест (60 дней)",
};

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  available: "Доступен",
  reserved: "Забронирован",
  rented: "В аренде",
  maintenance: "Обслуживание",
  sold: "Продан",
  archived: "Архив",
};

export const ASSET_STATUS_COLORS: Record<AssetStatus, string> = {
  available: "bg-green-100 text-green-800",
  reserved: "bg-yellow-100 text-yellow-800",
  rented: "bg-blue-100 text-blue-800",
  maintenance: "bg-orange-100 text-orange-800",
  sold: "bg-purple-100 text-purple-800",
  archived: "bg-gray-100 text-gray-800",
};

export const DEAL_TYPE_LABELS: Record<DealType, string> = {
  rent: "Аренда",
  sale: "Продажа",
  rent_to_purchase: "Аренда с выкупом",
  reservation: "Бронь",
  return_deal: "Возврат",
  exchange: "Обмен",
};

export const DEAL_TYPE_COLORS: Record<DealType, string> = {
  rent: "bg-blue-100 text-blue-800",
  sale: "bg-purple-100 text-purple-800",
  rent_to_purchase: "bg-indigo-100 text-indigo-800",
  reservation: "bg-yellow-100 text-yellow-800",
  return_deal: "bg-orange-100 text-orange-800",
  exchange: "bg-teal-100 text-teal-800",
};

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  lead: "Лид",
  booked: "Забронировано",
  delivery_scheduled: "Доставка запланирована",
  delivered: "Доставлено",
  active: "Активна",
  extended: "Продлено",
  return_scheduled: "Возврат запланирован",
  closed_return: "Закрыто (возврат)",
  closed_purchase: "Закрыто (выкуп)",
  canceled: "Отменено",
};

export const DEAL_STATUS_COLORS: Record<DealStatus, string> = {
  lead: "bg-gray-100 text-gray-800",
  booked: "bg-yellow-100 text-yellow-800",
  delivery_scheduled: "bg-orange-100 text-orange-800",
  delivered: "bg-cyan-100 text-cyan-800",
  active: "bg-green-100 text-green-800",
  extended: "bg-blue-100 text-blue-800",
  return_scheduled: "bg-amber-100 text-amber-800",
  closed_return: "bg-slate-100 text-slate-800",
  closed_purchase: "bg-purple-100 text-purple-800",
  canceled: "bg-red-100 text-red-800",
};

export const PAYMENT_KIND_LABELS: Record<PaymentKind, string> = {
  rent: "Аренда",
  delivery: "Доставка",
  assembly: "Сборка",
  deposit: "Залог",
  sale: "Продажа",
  refund: "Возврат",
  penalty: "Штраф",
  discount_adjustment: "Корректировка скидки",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  planned: "Запланирован",
  paid: "Оплачен",
  partially_paid: "Частично оплачен",
  refunded: "Возвращён",
  canceled: "Отменён",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  planned: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  partially_paid: "bg-orange-100 text-orange-800",
  refunded: "bg-red-100 text-red-800",
  canceled: "bg-gray-100 text-gray-800",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Наличные",
  card: "Карта",
  bank_transfer: "Перевод",
  sbp: "СБП",
  other: "Другое",
};

export const ACCESSORY_CATEGORY_LABELS: Record<AccessoryCategory, string> = {
  bracket: "Кронштейн",
  rail: "Шина",
  platform: "Платформа",
  block: "Блок",
  cable: "Кабель",
  adapter: "Переходник",
  other: "Прочее",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  asset_purchase: "Закупка станции",
  accessory_purchase: "Закупка аксессуаров",
  delivery_cost: "Доставка",
  assembly_cost: "Сборка",
  repair: "Ремонт",
  tax: "Налоги",
  ads: "Реклама",
  other: "Прочее",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  rental_contract: "Договор аренды",
  transfer_act: "Акт приёма-передачи",
  return_act: "Акт возврата",
  buyout_doc: "Договор выкупа",
  equipment_appendix: "Приложение (оборудование)",
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: "Черновик",
  generated: "Сгенерирован",
  sent: "Отправлен",
  signed: "Подписан",
  archived: "Архив",
};

export const DOCUMENT_STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  generated: "bg-blue-100 text-blue-800",
  sent: "bg-yellow-100 text-yellow-800",
  signed: "bg-green-100 text-green-800",
  archived: "bg-slate-100 text-slate-800",
};

export const DELIVERY_TASK_TYPE_LABELS: Record<DeliveryTaskType, string> = {
  delivery: "Доставка",
  pickup: "Забор",
  replacement: "Замена",
  maintenance_visit: "Обслуживание",
};

export const DELIVERY_TASK_STATUS_LABELS: Record<DeliveryTaskStatus, string> = {
  planned: "Запланировано",
  in_progress: "В процессе",
  completed: "Выполнено",
  canceled: "Отменено",
};

export const DELIVERY_TASK_STATUS_COLORS: Record<DeliveryTaskStatus, string> = {
  planned: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  canceled: "bg-gray-100 text-gray-800",
};

export const DELIVERY_TASK_TYPE_COLORS: Record<DeliveryTaskType, string> = {
  delivery: "bg-indigo-100 text-indigo-800",
  pickup: "bg-orange-100 text-orange-800",
  replacement: "bg-teal-100 text-teal-800",
  maintenance_visit: "bg-purple-100 text-purple-800",
};

// ─── LEADS ──────────────────────────────────────────────

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Новый",
  contacted: "Связались",
  qualified: "Квалифицирован",
  negotiation: "Переговоры",
  contract_pending: "Ожидание данных",
  contract_filled: "Данные заполнены",
  converted: "Конвертирован",
  rejected: "Отклонён",
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-cyan-100 text-cyan-800",
  qualified: "bg-emerald-100 text-emerald-800",
  negotiation: "bg-yellow-100 text-yellow-800",
  contract_pending: "bg-orange-100 text-orange-800",
  contract_filled: "bg-indigo-100 text-indigo-800",
  converted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  website: "Сайт",
  phone: "Телефон",
  referral: "Рекомендация",
  social: "Соцсети",
  ads: "Реклама",
  other: "Другое",
};

export const LEAD_INTEREST_LABELS: Record<LeadInterest, string> = {
  rent: "Аренда",
  buy: "Покупка",
  rent_to_purchase: "Аренда с выкупом",
  info: "Информация",
};

export const LEAD_INTEREST_COLORS: Record<LeadInterest, string> = {
  rent: "bg-blue-100 text-blue-800",
  buy: "bg-purple-100 text-purple-800",
  rent_to_purchase: "bg-indigo-100 text-indigo-800",
  info: "bg-gray-100 text-gray-800",
};
