"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { generateDocument } from "@/services/documents";
import type { DocumentType, DocumentStatus } from "@/generated/prisma/browser";
import * as fs from "fs";

export async function getDemoStatus() {
  const count = await prisma.deal.count({ where: { source: "demo" } });
  return { loaded: count > 0, count };
}

export async function seedDemoData() {
  const existing = await prisma.deal.count({ where: { source: "demo" } });
  if (existing > 0) {
    return { success: false, message: "Демо данные уже загружены" };
  }

  const assets = await prisma.asset.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
  });

  if (assets.length < 10) {
    return { success: false, message: "Недостаточно станций для демо данных" };
  }

  const assetMap = Object.fromEntries(assets.map((a) => [a.code, a]));

  const existingClients = await prisma.client.findMany();
  const clientByName = Object.fromEntries(
    existingClients.map((c) => [c.fullName, c]),
  );

  const newDemoClients = await Promise.all([
    prisma.client.create({
      data: {
        fullName: "Козлов Дмитрий Игоревич",
        phone: "79161234567",
        email: "kozlov.dmitry@gmail.com",
        actualAddress: "г. Москва, ул. Покровка, 31, кв. 15",
        notes: "Дизайнер интерьеров, работает из дома",
        tags: ["demo", "аренда"],
      },
    }),
    prisma.client.create({
      data: {
        fullName: "Миронова Елена Андреевна",
        phone: "79037654321",
        email: "mironova.elena@yandex.ru",
        passportSeries: "4510",
        passportNumber: "876543",
        passportIssuedBy: "ОВД Арбат",
        passportIssueDate: new Date("2018-03-15"),
        registrationAddress: "г. Москва, ул. Арбат, 54, кв. 23",
        actualAddress: "г. Москва, ул. Арбат, 54, кв. 23",
        notes: "Переводчик, фриланс. Проблемы с шеей.",
        tags: ["demo", "аренда"],
      },
    }),
    prisma.client.create({
      data: {
        fullName: "Волков Сергей Павлович",
        phone: "79261112233",
        email: "volkov.s@mail.ru",
        actualAddress: "г. Москва, ул. Новый Арбат, 19, оф. 805",
        notes: "Руководитель IT-отдела, рассматривает для всего офиса",
        tags: ["demo", "лид"],
      },
    }),
    prisma.client.create({
      data: {
        fullName: "Петрова Ольга Викторовна",
        phone: "79055556677",
        email: "petrova.olga@inbox.ru",
        passportSeries: "4520",
        passportNumber: "112233",
        passportIssuedBy: "ОВД Хамовники",
        passportIssueDate: new Date("2020-01-20"),
        registrationAddress: "г. Москва, ул. Остоженка, 37, кв. 4",
        notes: "Бухгалтер, много работает за компьютером",
        tags: ["demo", "аренда"],
      },
    }),
    prisma.client.create({
      data: {
        fullName: "Белов Игорь Николаевич",
        phone: "79099998877",
        notes: "Стример, интересуется эргономикой",
        tags: ["demo", "лид"],
      },
    }),
  ]);

  const allClients = {
    ...clientByName,
    ...Object.fromEntries(newDemoClients.map((c) => [c.fullName, c])),
  };

  const user = await prisma.user.findFirst({ where: { role: "ADMIN" } });

  const deals = [
    {
      client: "Кузнецов Роман Владимирович",
      asset: "EWS-M-001",
      type: "rent" as const,
      status: "active" as const,
      assetStatus: "rented" as const,
      start: new Date("2026-02-01"),
      end: new Date("2026-04-30"),
      months: 3,
      rent: 2500000,
      delivery: 500000,
      assembly: 300000,
      deposit: 1000000,
      address: "г. Москва, ул. Тверская, 12, кв. 45",
      instructions: "Код домофона: 45#123. 5 этаж, лифт грузовой справа от входа.",
      comment: "Постоянный клиент, всё стабильно",
      deliveryTasks: [
        {
          type: "delivery" as const,
          status: "completed" as const,
          plannedAt: new Date("2026-02-01"),
          assignee: "Алексей Водитель",
          address: "г. Москва, ул. Тверская, 12, кв. 45",
        },
        {
          type: "pickup" as const,
          status: "planned" as const,
          plannedAt: new Date("2026-04-30"),
          assignee: "Алексей Водитель",
          address: "г. Москва, ул. Тверская, 12, кв. 45",
        },
      ],
      payments: [
        { kind: "rent" as const, amount: 2500000, status: "paid" as const, date: new Date("2026-02-01") },
        { kind: "delivery" as const, amount: 500000, status: "paid" as const, date: new Date("2026-02-01") },
        { kind: "deposit" as const, amount: 1000000, status: "paid" as const, date: new Date("2026-02-01") },
      ],
      documents: [
        { type: "rental_contract" as DocumentType, status: "signed" as DocumentStatus },
        { type: "transfer_act" as DocumentType, status: "signed" as DocumentStatus },
        { type: "equipment_appendix" as DocumentType, status: "generated" as DocumentStatus },
      ],
    },
    {
      client: "Горячкина Анна Сергеевна",
      asset: "EWS-M-002",
      type: "rent" as const,
      status: "extended" as const,
      assetStatus: "rented" as const,
      start: new Date("2025-12-15"),
      end: new Date("2026-05-15"),
      months: 5,
      rent: 3000000,
      delivery: 600000,
      assembly: 300000,
      deposit: 1500000,
      address: "г. Москва, ул. Маршала Соколовского, 5, кв. 127",
      instructions: "Консьерж на 1 этаже, предупредить заранее. Пропуск на имя Горячкиной.",
      comment: "Продлила дважды, очень довольна",
      deliveryTasks: [
        {
          type: "delivery" as const,
          status: "completed" as const,
          plannedAt: new Date("2025-12-15"),
          assignee: "Алексей Водитель",
          address: "г. Москва, ул. Маршала Соколовского, 5, кв. 127",
        },
      ],
      payments: [
        { kind: "rent" as const, amount: 3000000, status: "paid" as const, date: new Date("2025-12-15") },
        { kind: "rent" as const, amount: 3000000, status: "paid" as const, date: new Date("2026-01-15") },
        { kind: "rent" as const, amount: 3000000, status: "paid" as const, date: new Date("2026-02-15") },
        { kind: "deposit" as const, amount: 1500000, status: "paid" as const, date: new Date("2025-12-15") },
      ],
      documents: [
        { type: "rental_contract" as DocumentType, status: "signed" as DocumentStatus },
        { type: "transfer_act" as DocumentType, status: "signed" as DocumentStatus },
        { type: "equipment_appendix" as DocumentType, status: "generated" as DocumentStatus },
      ],
    },
    {
      client: "Рушан",
      asset: "EWS-M-003",
      type: "rent" as const,
      status: "active" as const,
      assetStatus: "rented" as const,
      start: new Date("2026-01-20"),
      end: new Date("2026-04-20"),
      months: 3,
      rent: 2500000,
      delivery: 800000,
      assembly: 500000,
      deposit: 1000000,
      address: "г. Пермь, ул. Ленина, 34, кв. 8",
      instructions: "2 подъезд, 3 этаж. Звонить за час до приезда.",
      comment: "Удалённый клиент, Пермь. Доставка ТК.",
      deliveryTasks: [
        {
          type: "delivery" as const,
          status: "completed" as const,
          plannedAt: new Date("2026-01-20"),
          assignee: "ТК СДЭК",
          address: "г. Пермь, ул. Ленина, 34, кв. 8",
        },
        {
          type: "pickup" as const,
          status: "planned" as const,
          plannedAt: new Date("2026-04-20"),
          assignee: "ТК СДЭК",
          address: "г. Пермь, ул. Ленина, 34, кв. 8",
        },
      ],
      payments: [
        { kind: "rent" as const, amount: 2500000, status: "paid" as const, date: new Date("2026-01-20") },
        { kind: "delivery" as const, amount: 800000, status: "paid" as const, date: new Date("2026-01-20") },
      ],
      documents: [
        { type: "rental_contract" as DocumentType, status: "signed" as DocumentStatus },
        { type: "transfer_act" as DocumentType, status: "signed" as DocumentStatus },
        { type: "equipment_appendix" as DocumentType, status: "generated" as DocumentStatus },
      ],
    },
    {
      client: "Артур",
      asset: "EWS-M-005",
      type: "rent" as const,
      status: "delivery_scheduled" as const,
      assetStatus: "reserved" as const,
      start: new Date("2026-03-05"),
      end: new Date("2026-06-05"),
      months: 3,
      rent: 2800000,
      delivery: 500000,
      assembly: 300000,
      deposit: 1200000,
      address: "г. Москва, Пресненская наб., 10, оф. 1502",
      instructions: "Бизнес-центр Башня на Набережной. Пропуск на проходной. Грузовой лифт из паркинга B2.",
      comment: "Корпоративный клиент, офис в Москва-Сити",
      deliveryTasks: [
        {
          type: "delivery" as const,
          status: "planned" as const,
          plannedAt: new Date("2026-03-05"),
          assignee: "Алексей Водитель",
          address: "г. Москва, Пресненская наб., 10, оф. 1502",
        },
      ],
      payments: [
        { kind: "rent" as const, amount: 2800000, status: "planned" as const, date: new Date("2026-03-05") },
        { kind: "delivery" as const, amount: 500000, status: "planned" as const, date: new Date("2026-03-05") },
      ],
      documents: [
        { type: "rental_contract" as DocumentType, status: "generated" as DocumentStatus },
        { type: "equipment_appendix" as DocumentType, status: "draft" as DocumentStatus },
      ],
    },
    {
      client: "Антон",
      asset: "EWS-M-007",
      type: "rent" as const,
      status: "return_scheduled" as const,
      assetStatus: "rented" as const,
      start: new Date("2025-11-01"),
      end: new Date("2026-03-10"),
      months: 4,
      rent: 2200000,
      delivery: 500000,
      assembly: 300000,
      deposit: 1000000,
      address: "г. Москва, ул. Большая Ордынка, 21, кв. 7",
      instructions: "Домофон: 7. Парковка во дворе, заезд с Пятницкой ул.",
      comment: "Возврат 10 марта, проверить состояние",
      deliveryTasks: [
        {
          type: "delivery" as const,
          status: "completed" as const,
          plannedAt: new Date("2025-11-01"),
          assignee: "Алексей Водитель",
          address: "г. Москва, ул. Большая Ордынка, 21, кв. 7",
        },
        {
          type: "pickup" as const,
          status: "planned" as const,
          plannedAt: new Date("2026-03-10"),
          assignee: "Алексей Водитель",
          address: "г. Москва, ул. Большая Ордынка, 21, кв. 7",
        },
      ],
      payments: [
        { kind: "rent" as const, amount: 2200000, status: "paid" as const, date: new Date("2025-11-01") },
        { kind: "rent" as const, amount: 2200000, status: "paid" as const, date: new Date("2025-12-01") },
        { kind: "rent" as const, amount: 2200000, status: "paid" as const, date: new Date("2026-01-01") },
        { kind: "rent" as const, amount: 2200000, status: "paid" as const, date: new Date("2026-02-01") },
        { kind: "deposit" as const, amount: 1000000, status: "paid" as const, date: new Date("2025-11-01") },
      ],
      documents: [
        { type: "rental_contract" as DocumentType, status: "signed" as DocumentStatus },
        { type: "transfer_act" as DocumentType, status: "signed" as DocumentStatus },
        { type: "return_act" as DocumentType, status: "draft" as DocumentStatus },
      ],
    },
    {
      client: "Ларкин Александр",
      asset: "EWS-M-008",
      type: "rent_to_purchase" as const,
      status: "active" as const,
      assetStatus: "rented" as const,
      start: new Date("2026-01-10"),
      end: new Date("2026-04-10"),
      months: 3,
      rent: 2500000,
      delivery: 500000,
      assembly: 0,
      deposit: 0,
      discount: 200000,
      address: "г. Москва, ул. Профсоюзная, 65, кв. 312",
      instructions: "3 подъезд, код от двери 312К. Лифт до 17 этажа.",
      comment: "Рассматривает выкуп за 200 тыс.",
      deliveryTasks: [
        {
          type: "delivery" as const,
          status: "completed" as const,
          plannedAt: new Date("2026-01-10"),
          assignee: "Иван Сборщик",
          address: "г. Москва, ул. Профсоюзная, 65, кв. 312",
        },
      ],
      payments: [
        { kind: "rent" as const, amount: 2300000, status: "paid" as const, date: new Date("2026-01-10") },
        { kind: "rent" as const, amount: 2300000, status: "paid" as const, date: new Date("2026-02-10") },
      ],
      documents: [
        { type: "rental_contract" as DocumentType, status: "signed" as DocumentStatus },
        { type: "transfer_act" as DocumentType, status: "signed" as DocumentStatus },
        { type: "equipment_appendix" as DocumentType, status: "generated" as DocumentStatus },
      ],
    },
    {
      client: "Максим ЦБ",
      asset: "EWS-M-009",
      type: "rent_to_purchase" as const,
      status: "closed_purchase" as const,
      assetStatus: "sold" as const,
      start: new Date("2025-09-01"),
      end: new Date("2026-02-01"),
      months: 5,
      rent: 2000000,
      delivery: 500000,
      assembly: 300000,
      deposit: 0,
      address: "г. Москва, Ленинградский пр-т, 47, кв. 89",
      instructions: "Шлагбаум: +7(916)210-08-77. Парковка: место 89.",
      comment: "Выкуп завершён, оплата полная",
      deliveryTasks: [
        {
          type: "delivery" as const,
          status: "completed" as const,
          plannedAt: new Date("2025-09-01"),
          assignee: "Алексей Водитель",
          address: "г. Москва, Ленинградский пр-т, 47, кв. 89",
        },
      ],
      payments: [
        { kind: "rent" as const, amount: 2000000, status: "paid" as const, date: new Date("2025-09-01") },
        { kind: "rent" as const, amount: 2000000, status: "paid" as const, date: new Date("2025-10-01") },
        { kind: "rent" as const, amount: 2000000, status: "paid" as const, date: new Date("2025-11-01") },
        { kind: "rent" as const, amount: 2000000, status: "paid" as const, date: new Date("2025-12-01") },
        { kind: "rent" as const, amount: 2000000, status: "paid" as const, date: new Date("2026-01-01") },
        { kind: "sale" as const, amount: 20000000, status: "paid" as const, date: new Date("2026-02-01") },
      ],
      documents: [
        { type: "rental_contract" as DocumentType, status: "signed" as DocumentStatus },
        { type: "transfer_act" as DocumentType, status: "signed" as DocumentStatus },
        { type: "buyout_doc" as DocumentType, status: "signed" as DocumentStatus },
      ],
    },
    {
      client: "Козлов Дмитрий Игоревич",
      asset: "EWS-M-006",
      type: "rent" as const,
      status: "booked" as const,
      assetStatus: "reserved" as const,
      start: new Date("2026-03-15"),
      end: new Date("2026-06-15"),
      months: 3,
      rent: 2500000,
      delivery: 500000,
      assembly: 300000,
      deposit: 1000000,
      address: "г. Москва, ул. Покровка, 31, кв. 15",
      instructions: "Арка во двор, 2 подъезд налево. Домофон: 15.",
      comment: "Новый клиент, бронь подтверждена",
      deliveryTasks: [],
      payments: [
        { kind: "deposit" as const, amount: 1000000, status: "planned" as const, date: new Date("2026-03-15") },
      ],
      documents: [
        { type: "rental_contract" as DocumentType, status: "draft" as DocumentStatus },
      ],
    },
    {
      client: "Миронова Елена Андреевна",
      asset: "EWS-M-010",
      type: "rent" as const,
      status: "delivered" as const,
      assetStatus: "rented" as const,
      start: new Date("2026-02-20"),
      end: new Date("2026-05-20"),
      months: 3,
      rent: 2500000,
      delivery: 400000,
      assembly: 300000,
      deposit: 1000000,
      address: "г. Москва, ул. Арбат, 54, кв. 23",
      instructions: "Старый Арбат, вход со двора. Код калитки: 2354.",
      comment: "Доставлено, ждём подтверждение активации",
      deliveryTasks: [
        {
          type: "delivery" as const,
          status: "completed" as const,
          plannedAt: new Date("2026-02-20"),
          assignee: "Иван Сборщик",
          address: "г. Москва, ул. Арбат, 54, кв. 23",
        },
      ],
      payments: [
        { kind: "rent" as const, amount: 2500000, status: "paid" as const, date: new Date("2026-02-20") },
        { kind: "delivery" as const, amount: 400000, status: "paid" as const, date: new Date("2026-02-20") },
        { kind: "deposit" as const, amount: 1000000, status: "paid" as const, date: new Date("2026-02-20") },
      ],
      documents: [
        { type: "rental_contract" as DocumentType, status: "generated" as DocumentStatus },
        { type: "transfer_act" as DocumentType, status: "generated" as DocumentStatus },
        { type: "equipment_appendix" as DocumentType, status: "generated" as DocumentStatus },
      ],
    },
    {
      client: "Волков Сергей Павлович",
      asset: "EWS-M-004",
      type: "rent" as const,
      status: "lead" as const,
      assetStatus: "available" as const,
      start: new Date("2026-04-01"),
      end: new Date("2026-07-01"),
      months: 3,
      rent: 2800000,
      delivery: 700000,
      assembly: 500000,
      deposit: 1500000,
      address: "г. Москва, ул. Новый Арбат, 19, оф. 805",
      instructions: "БЦ, пропуск оформляется заранее. Ресепшн на 1 этаже.",
      comment: "Лид: рассматривает аренду 3 станций для офиса",
      deliveryTasks: [],
      payments: [],
      documents: [],
    },
    {
      client: "Петрова Ольга Викторовна",
      asset: "EWS-M-009",
      type: "rent" as const,
      status: "active" as const,
      assetStatus: "rented" as const,
      start: new Date("2026-03-03"),
      end: new Date("2026-06-03"),
      months: 3,
      rent: 2500000,
      delivery: 500000,
      assembly: 300000,
      deposit: 1000000,
      address: "г. Москва, ул. Остоженка, 37, кв. 4",
      instructions: "Частный дом, калитка слева. Звонок на воротах.",
      comment: "Бухгалтер, ценит эргономику",
      deliveryTasks: [
        {
          type: "delivery" as const,
          status: "completed" as const,
          plannedAt: new Date("2026-03-03"),
          assignee: "Алексей Водитель",
          address: "г. Москва, ул. Остоженка, 37, кв. 4",
        },
        {
          type: "pickup" as const,
          status: "planned" as const,
          plannedAt: new Date("2026-06-03"),
          assignee: "Алексей Водитель",
          address: "г. Москва, ул. Остоженка, 37, кв. 4",
        },
      ],
      payments: [
        { kind: "rent" as const, amount: 2500000, status: "paid" as const, date: new Date("2026-03-03") },
        { kind: "delivery" as const, amount: 500000, status: "paid" as const, date: new Date("2026-03-03") },
        { kind: "deposit" as const, amount: 1000000, status: "paid" as const, date: new Date("2026-03-03") },
      ],
      documents: [
        { type: "rental_contract" as DocumentType, status: "signed" as DocumentStatus },
        { type: "transfer_act" as DocumentType, status: "signed" as DocumentStatus },
        { type: "equipment_appendix" as DocumentType, status: "generated" as DocumentStatus },
      ],
    },
  ];

  for (const d of deals) {
    const client = allClients[d.client];
    const asset = assetMap[d.asset];
    if (!client || !asset) continue;

    const deal = await prisma.deal.create({
      data: {
        type: d.type,
        status: d.status,
        clientId: client.id,
        createdById: user?.id,
        source: "demo",
        comment: d.comment,
      },
    });

    const totalPlanned =
      d.rent + d.delivery + d.assembly + d.deposit - (d.discount ?? 0);

    const rental = await prisma.rental.create({
      data: {
        dealId: deal.id,
        assetId: asset.id,
        startDate: d.start,
        endDate: d.end,
        plannedMonths: d.months,
        rentAmount: d.rent,
        deliveryAmount: d.delivery,
        assemblyAmount: d.assembly,
        depositAmount: d.deposit,
        discountAmount: d.discount ?? 0,
        totalPlannedAmount: totalPlanned,
        addressDelivery: d.address,
        addressPickup: d.address,
        deliveryInstructions: d.instructions,
      },
    });

    await prisma.rentalPeriod.create({
      data: {
        rentalId: rental.id,
        periodNumber: 1,
        startDate: d.start,
        endDate: d.end,
        amountRent: d.rent,
        amountDelivery: d.delivery,
        amountAssembly: d.assembly,
        amountDiscount: d.discount ?? 0,
        amountTotal: totalPlanned,
        type: "first",
      },
    });

    for (const task of d.deliveryTasks) {
      await prisma.deliveryTask.create({
        data: {
          rentalId: rental.id,
          type: task.type,
          status: task.status,
          plannedAt: task.plannedAt,
          assignee: task.assignee,
          address: task.address,
        },
      });
    }

    for (const p of d.payments) {
      await prisma.payment.create({
        data: {
          dealId: deal.id,
          rentalId: rental.id,
          date: p.date,
          amount: p.amount,
          kind: p.kind,
          status: p.status,
          method: "bank_transfer",
        },
      });
    }

    for (const docDef of d.documents) {
      const doc = await generateDocument(deal.id, docDef.type, rental.id);
      if (doc.status !== docDef.status) {
        await prisma.document.update({
          where: { id: doc.id },
          data: { status: docDef.status },
        });
      }
    }

    if (d.assetStatus !== asset.status) {
      await prisma.asset.update({
        where: { id: asset.id },
        data: { status: d.assetStatus },
      });
    }
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    message: `Создано ${deals.length} демо-сделок`,
  };
}

export async function clearDemoData() {
  const demoDealIds = (
    await prisma.deal.findMany({
      where: { source: "demo" },
      select: { id: true },
    })
  ).map((d) => d.id);

  if (demoDealIds.length === 0) {
    return { success: false, message: "Демо данных нет" };
  }

  const demoRentalIds = (
    await prisma.rental.findMany({
      where: { dealId: { in: demoDealIds } },
      select: { id: true },
    })
  ).map((r) => r.id);

  const demoDocuments = await prisma.document.findMany({
    where: {
      OR: [
        { dealId: { in: demoDealIds } },
        { rentalId: { in: demoRentalIds } },
      ],
    },
    select: { filePath: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.payment.deleteMany({
      where: {
        OR: [
          { dealId: { in: demoDealIds } },
          { rentalId: { in: demoRentalIds } },
        ],
      },
    });

    await tx.document.deleteMany({
      where: {
        OR: [
          { dealId: { in: demoDealIds } },
          { rentalId: { in: demoRentalIds } },
        ],
      },
    });

    await tx.expense.deleteMany({
      where: { dealId: { in: demoDealIds } },
    });

    await tx.inventoryMovement.deleteMany({
      where: { relatedRentalId: { in: demoRentalIds } },
    });

    await tx.rental.deleteMany({
      where: { dealId: { in: demoDealIds } },
    });

    await tx.deal.deleteMany({
      where: { source: "demo" },
    });

    await tx.client.deleteMany({
      where: { tags: { hasSome: ["demo"] } },
    });

    await tx.asset.updateMany({
      where: { isActive: true },
      data: { status: "available" },
    });
  });

  for (const doc of demoDocuments) {
    if (doc.filePath) {
      try {
        fs.unlinkSync(doc.filePath);
      } catch {
        // file may already be gone
      }
    }
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    message: `Удалено ${demoDealIds.length} демо-сделок`,
  };
}
