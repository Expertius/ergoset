import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Admin user: admin@ergoset.ru / admin123
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@ergoset.ru" },
    update: { passwordHash },
    create: {
      email: "admin@ergoset.ru",
      passwordHash,
      fullName: "Михаил Никитин",
      role: "ADMIN",
    },
  });
  console.log("Created admin user: admin@ergoset.ru / admin123");

  // Assets — based on real data from screenshots
  const assets = await Promise.all([
    prisma.asset.upsert({
      where: { code: "EWS-M-001" },
      update: {},
      create: {
        code: "EWS-M-001",
        name: "EasyWorkStation замша - серый графит",
        brand: "EasyWorkStation",
        model: "EWS-M",
        upholstery: "Замша",
        color: "Серый графит",
        purchasePrice: 16500000,
        dealerPrice: 16500000,
        retailPrice: 19000000,
        purchaseDate: new Date("2024-02-01"),
        status: "rented",
      },
    }),
    prisma.asset.upsert({
      where: { code: "EWS-M-002" },
      update: {},
      create: {
        code: "EWS-M-002",
        name: "EasyWorkStation обивка черная экокожа",
        brand: "EasyWorkStation",
        model: "EWS-M",
        upholstery: "Экокожа",
        color: "Черная",
        purchasePrice: 18999000,
        dealerPrice: 18999000,
        retailPrice: 21848900,
        purchaseDate: new Date("2024-05-01"),
        status: "rented",
      },
    }),
    prisma.asset.upsert({
      where: { code: "EWS-M-003" },
      update: {},
      create: {
        code: "EWS-M-003",
        name: "EasyWorkStation Кожа иск. BIONICA cream",
        brand: "EasyWorkStation",
        model: "EWS-M",
        upholstery: "Кожа иск.",
        color: "BIONICA cream",
        purchasePrice: 18999000,
        dealerPrice: 18999000,
        retailPrice: 21848900,
        purchaseDate: new Date("2024-11-01"),
        status: "rented",
      },
    }),
    prisma.asset.upsert({
      where: { code: "EWS-M-004" },
      update: {},
      create: {
        code: "EWS-M-004",
        name: "EasyWorkStation Замша AURORA YELLOW (LE)",
        brand: "EasyWorkStation",
        model: "EWS-M",
        upholstery: "Замша",
        color: "AURORA YELLOW",
        purchasePrice: 18274200,
        dealerPrice: 18274200,
        retailPrice: 21499000,
        purchaseDate: new Date("2024-11-01"),
        status: "available",
        notes: "Для себя купил в офис, как шоурум делать",
      },
    }),
    prisma.asset.upsert({
      where: { code: "EWS-M-005" },
      update: {},
      create: {
        code: "EWS-M-005",
        name: "EasyWorkStation Замша Оранж",
        brand: "EasyWorkStation",
        model: "EWS-M",
        upholstery: "Замша",
        color: "Оранж",
        purchasePrice: 15000000,
        dealerPrice: 15000000,
        retailPrice: 19000000,
        status: "rented",
      },
    }),
    prisma.asset.upsert({
      where: { code: "EWS-M-006" },
      update: {},
      create: {
        code: "EWS-M-006",
        name: "EasyWorkStation Слейт замша",
        brand: "EasyWorkStation",
        model: "EWS-M",
        upholstery: "Замша",
        color: "Слейт",
        purchasePrice: 12000000,
        retailPrice: 19000000,
        status: "available",
      },
    }),
    prisma.asset.upsert({
      where: { code: "EWS-M-007" },
      update: {},
      create: {
        code: "EWS-M-007",
        name: "EasyWorkStation Слейт замша",
        brand: "EasyWorkStation",
        model: "EWS-M",
        upholstery: "Замша",
        color: "Слейт",
        purchasePrice: 11082000,
        retailPrice: 19000000,
        status: "rented",
      },
    }),
    prisma.asset.upsert({
      where: { code: "EWS-M-008" },
      update: {},
      create: {
        code: "EWS-M-008",
        name: "EasyWorkStation Оранж замша",
        brand: "EasyWorkStation",
        model: "EWS-M",
        upholstery: "Замша",
        color: "Оранж",
        purchasePrice: 12000000,
        retailPrice: 19000000,
        status: "rented",
      },
    }),
    prisma.asset.upsert({
      where: { code: "EWS-M-009" },
      update: {},
      create: {
        code: "EWS-M-009",
        name: "EasyWorkStation Жёлтая замша",
        brand: "EasyWorkStation",
        model: "EWS-M",
        upholstery: "Замша",
        color: "Жёлтая",
        purchasePrice: 12000000,
        retailPrice: 19000000,
        status: "rented",
      },
    }),
    prisma.asset.upsert({
      where: { code: "EWS-M-010" },
      update: {},
      create: {
        code: "EWS-M-010",
        name: "EasyWorkStation Серая замша",
        brand: "EasyWorkStation",
        model: "EWS-M",
        upholstery: "Замша",
        color: "Серая",
        purchasePrice: 10000000,
        retailPrice: 19000000,
        status: "rented",
      },
    }),
  ]);

  console.log(`Created ${assets.length} assets`);

  // Accessories — based on screenshots
  const accessories = await Promise.all([
    prisma.accessory.upsert({
      where: { sku: "EWS-KRON-25" },
      update: {},
      create: {
        sku: "EWS-KRON-25",
        name: "Кронштейн EWS-Kron-25 (для тяжелых и широкоформатных мониторов)",
        category: "bracket",
        retailPrice: 900000,
        dealerPrice: 720000,
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-FF-LAPTOP" },
      update: {},
      create: {
        sku: "EWS-FF-LAPTOP",
        name: "Переходник EWS-FF-LapTop (для ноутбука сбоку)",
        category: "adapter",
        retailPrice: 200000,
        dealerPrice: 160000,
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-LAPTOP-C" },
      update: {},
      create: {
        sku: "EWS-LAPTOP-C",
        name: "Кронштейн для ноутбука, центр EWS-LapTop-C",
        category: "bracket",
        retailPrice: 1400000,
        dealerPrice: 1120000,
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-PANTO-MIC" },
      update: {},
      create: {
        sku: "EWS-PANTO-MIC",
        name: "Пантограф для микрофона",
        category: "bracket",
        retailPrice: 700000,
        dealerPrice: 560000,
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-RAIL-2" },
      update: {},
      create: {
        sku: "EWS-RAIL-2",
        name: "Кронштейн-шина для 2 мониторов симметрично",
        category: "rail",
        retailPrice: 1900000,
        dealerPrice: 1520000,
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-RAIL-UNI" },
      update: {},
      create: {
        sku: "EWS-RAIL-UNI",
        name: "Шина для мониторов универсальная. Весь комплект.",
        category: "rail",
        retailPrice: 1500000,
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-BUS2-3" },
      update: {},
      create: {
        sku: "EWS-BUS2-3",
        name: "Шина EWS-Bus2 для трех мониторов",
        category: "rail",
        retailPrice: 2000000,
        dealerPrice: 1600000,
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-G90" },
      update: {},
      create: {
        sku: "EWS-G90",
        name: "Кронштейн G90 (для ноутбука)",
        category: "bracket",
        retailPrice: 900000,
        dealerPrice: 720000,
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-PLAT-15" },
      update: {},
      create: {
        sku: "EWS-PLAT-15",
        name: "Платформа EWS-Plat-15",
        category: "platform",
        retailPrice: 3500000,
        dealerPrice: 2800000,
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-BLOCK-SMOOTH" },
      update: {},
      create: {
        sku: "EWS-BLOCK-SMOOTH",
        name: "Блок плавного хода",
        category: "block",
        retailPrice: 400000,
        dealerPrice: 320000,
      },
    }),
  ]);

  console.log(`Created ${accessories.length} accessories`);

  // Inventory for accessories
  for (const acc of accessories) {
    await prisma.inventoryItem.upsert({
      where: {
        accessoryId_location: { accessoryId: acc.id, location: "warehouse" },
      },
      update: {},
      create: {
        accessoryId: acc.id,
        location: "warehouse",
        qtyOnHand: Math.floor(Math.random() * 5) + 1,
        qtyReserved: 0,
      },
    });
  }

  console.log("Created inventory items");

  // Clients — based on screenshots
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        fullName: "Кузнецов Роман Владимирович",
        phone: "79017210179",
        email: "kuzkem196@yandex.ru",
        birthDate: new Date("1996-08-01"),
        passportSeries: "3216",
        passportNumber: "713825",
        passportIssuedBy: "оУФМС в Ленинском р-не г. Кемерово",
        passportIssueDate: new Date("2016-09-06"),
        registrationAddress: "г. Кемерово, ул. Волгоградская д32/В, кв 16",
        notes: "Айтишник, системный аналитик. Проблемы со спиной.",
        tags: ["it", "аренда"],
      },
    }),
    prisma.client.create({
      data: {
        fullName: "Ларкин Александр",
        phone: "79000000001",
        notes: "Кресло под выкуп - 200 тыс.",
        tags: ["выкуп"],
      },
    }),
    prisma.client.create({
      data: {
        fullName: "Горячкина Анна Сергеевна",
        phone: "79000000002",
        passportSeries: "4525",
        passportNumber: "219411",
        passportIssuedBy: "ГУ МВД РОССИИ ПО Г. МОСКВЕ",
        passportIssueDate: new Date("2025-07-24"),
        registrationAddress: "г. Москва, 2 черногрязская дом 3 с 1 кв 14",
        actualAddress: "г. Москва, Маршала Соколовского 5 кв 127",
        tags: ["аренда"],
      },
    }),
    prisma.client.create({
      data: {
        fullName: "Рушан",
        phone: "79660720706",
        notes: "Разработчик, совет по обсидиану. Очень классный тип.",
        tags: ["аренда", "лояльный"],
      },
    }),
    prisma.client.create({
      data: {
        fullName: "Максим ЦБ",
        phone: "79162100877",
        notes: "Завершено - Выкуп",
        tags: ["выкуп"],
      },
    }),
    prisma.client.create({
      data: {
        fullName: "Артур",
        phone: "79129338998",
        notes: "Собственник своего бизнеса, нефтяник носитель технологий компаний",
        tags: ["аренда"],
      },
    }),
    prisma.client.create({
      data: {
        fullName: "Антон",
        phone: "79092210399",
        notes: "бизнесмен, обучающий центр, корочки - проблемы со спиной",
        tags: ["аренда"],
      },
    }),
    prisma.client.create({
      data: {
        fullName: "Павел Устинов",
        tags: ["заказ"],
      },
    }),
  ]);

  console.log(`Created ${clients.length} clients`);

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
