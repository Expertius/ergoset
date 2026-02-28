import type { AssetStatus, DealStatus, DealType, PaymentKind, PaymentStatus, AccessoryCategory } from "@/generated/prisma/browser";

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

export const ACCESSORY_CATEGORY_LABELS: Record<AccessoryCategory, string> = {
  bracket: "Кронштейн",
  rail: "Шина",
  platform: "Платформа",
  block: "Блок",
  cable: "Кабель",
  adapter: "Переходник",
  other: "Прочее",
};
