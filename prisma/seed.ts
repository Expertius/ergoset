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

  // ─── Admin user ────────────────────────────────────────
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

  // ─── Assets (real units — kept as-is) ──────────────────
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

  // ─── Accessories — full catalog from easyworkstation.ru ─
  const accessories = await Promise.all([
    // --- Monitor brackets & rails ---
    prisma.accessory.upsert({
      where: { sku: "EWS-25" },
      update: { name: "Кронштейн EWS-25 для 1 монитора (+ VESA)", retailPrice: 1000000, category: "bracket" },
      create: {
        sku: "EWS-25",
        name: "Кронштейн EWS-25 для 1 монитора (+ VESA)",
        category: "bracket",
        retailPrice: 1000000,
        description: "До 22 кг, диагональ 19-55\". Типы креплений: VESA 75×75 и 100×100. Сталь, 3.1 кг.",
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-Bus2S" },
      update: { name: "Шина EWS-Bus2S — 2 монитора симметрично", retailPrice: 2900000, category: "rail" },
      create: {
        sku: "EWS-Bus2S",
        name: "Шина EWS-Bus2S — 2 монитора симметрично",
        category: "rail",
        retailPrice: 2900000,
        description: "Крепится на EWS-25. До 18 кг общий, диагональ 24-34\". Сталь, 3.9 кг.",
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-Bus2V" },
      update: { name: "Шина EWS-Bus2V — 2 монитора друг над другом", retailPrice: 2900000, category: "rail" },
      create: {
        sku: "EWS-Bus2V",
        name: "Шина EWS-Bus2V — 2 монитора друг над другом",
        category: "rail",
        retailPrice: 2900000,
        description: "Крепится на EWS-25. До 18 кг общий, диагональ 24-49\". Макс. расстояние между центрами VESA 520 мм. Сталь, 3.4 кг.",
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-Bus2L" },
      update: { name: "Шина EWS-Bus2L — 2 монитора: центр + лево", retailPrice: 3100000, category: "rail" },
      create: {
        sku: "EWS-Bus2L",
        name: "Шина EWS-Bus2L — 2 монитора: центр + лево",
        category: "rail",
        retailPrice: 3100000,
        description: "Крепится на EWS-25. До 18 кг общий. Центральный 24-32\", левый 24-27\". Сталь, 3.4 кг.",
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-Bus2P" },
      update: { name: "Шина EWS-Bus2P — 2 монитора: центр + право", retailPrice: 3100000, category: "rail" },
      create: {
        sku: "EWS-Bus2P",
        name: "Шина EWS-Bus2P — 2 монитора: центр + право",
        category: "rail",
        retailPrice: 3100000,
        description: "Крепится на EWS-25. До 18 кг общий. Центральный 24-32\", правый 24-27\". Сталь, 3.4 кг.",
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-Bus3" },
      update: { name: "Шина EWS-Bus3 — 3 монитора горизонтально", retailPrice: 3300000, category: "rail" },
      create: {
        sku: "EWS-Bus3",
        name: "Шина EWS-Bus3 — 3 монитора горизонтально",
        category: "rail",
        retailPrice: 3300000,
        description: "Крепится на EWS-25. До 16.5 кг общий. Центральный до 32\", боковые до 27\". Сталь, 5.4 кг.",
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-Bus2-Triangle" },
      update: { name: "Шина EWS-Bus2 Triangle — 3 монитора: 2 снизу + 1 сверху", retailPrice: 3600000, category: "rail" },
      create: {
        sku: "EWS-Bus2-Triangle",
        name: "Шина EWS-Bus2 Triangle — 3 монитора: 2 снизу + 1 сверху",
        category: "rail",
        retailPrice: 3600000,
        description: "Крепится на EWS-25. До 16 кг общий. Нижние 24-34\", верхний 24-27\". Сталь, 5.7 кг.",
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-Bus2V-Side" },
      update: { name: "Шина EWS-Bus2V + вставка — 3 монитора: 2 над + 1 сбоку", retailPrice: 3400000, category: "rail" },
      create: {
        sku: "EWS-Bus2V-Side",
        name: "Шина EWS-Bus2V + вставка — 3 монитора: 2 над + 1 сбоку",
        category: "rail",
        retailPrice: 3400000,
        description: "Крепится на EWS-25. До 15 кг общий. Все мониторы 24-27\". Сталь, 6 кг.",
      },
    }),

    // --- Laptop mounts ---
    prisma.accessory.upsert({
      where: { sku: "EWS-LapTop-C" },
      update: { name: "Кронштейн EWS-LapTop-C — ноутбук по центру", retailPrice: 1500000, category: "bracket" },
      create: {
        sku: "EWS-LapTop-C",
        name: "Кронштейн EWS-LapTop-C — ноутбук по центру",
        category: "bracket",
        retailPrice: 1500000,
        description: "До 5 кг, диагональ до 17\". Сталь, 3 кг.",
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-LapTop-Side" },
      update: { name: "Комплект «Ноутбук сбоку» (переходник + G90 + площадка)", retailPrice: 1700000, category: "bracket" },
      create: {
        sku: "EWS-LapTop-Side",
        name: "Комплект «Ноутбук сбоку» (переходник + G90 + площадка)",
        category: "bracket",
        retailPrice: 1700000,
        description: "Переходник 0.7 кг + кронштейн G90 модиф. 2.2 кг + площадка 1.1 кг. До 17\". Сталь, общий вес 4 кг.",
      },
    }),

    // --- Platforms ---
    prisma.accessory.upsert({
      where: { sku: "EWS-PLAT-EXT" },
      update: { name: "Увеличенная платформа (рост > 192 см)", retailPrice: 3700000, category: "platform" },
      create: {
        sku: "EWS-PLAT-EXT",
        name: "Увеличенная платформа (рост > 192 см)",
        category: "platform",
        retailPrice: 3700000,
        description: "Поднимает станцию на 9-14 см. Сталь, 18.3 кг. Стандартная платформа включена в базу.",
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-PLAT-SHIFT" },
      update: { name: "Смещение подножки +5-7 см", retailPrice: 500000, category: "platform" },
      create: {
        sku: "EWS-PLAT-SHIFT",
        name: "Смещение подножки +5-7 см",
        category: "platform",
        retailPrice: 500000,
        description: "Доп. опция к увеличенной платформе, чтобы ноги не свисали и не затекали.",
      },
    }),

    // --- Mic mount ---
    prisma.accessory.upsert({
      where: { sku: "EWS-PANTO-MIC" },
      update: { name: "Пантограф для микрофона", retailPrice: 750000, category: "bracket" },
      create: {
        sku: "EWS-PANTO-MIC",
        name: "Пантограф для микрофона",
        category: "bracket",
        retailPrice: 750000,
        description: "Кронштейн-пантограф с фиксацией на столе. Сталь, 1.3 кг.",
      },
    }),

    // --- Cover ---
    prisma.accessory.upsert({
      where: { sku: "EWS-COVER" },
      update: { name: "Чехол на станцию Cantra (алькантара)", retailPrice: 350000, category: "other" },
      create: {
        sku: "EWS-COVER",
        name: "Чехол на станцию Cantra (алькантара)",
        category: "other",
        retailPrice: 350000,
        description: "Автомобильная накидка-чехол из алькантары. Тёмно-серый, 0.6 кг.",
      },
    }),

    // --- Desks & tables ---
    prisma.accessory.upsert({
      where: { sku: "EWS-DESK-NG" },
      update: { name: "Стол Desk NG с 3D подлокотниками", retailPrice: 3000000, category: "other" },
      create: {
        sku: "EWS-DESK-NG",
        name: "Стол Desk NG с 3D подлокотниками",
        category: "other",
        retailPrice: 3000000,
        description: "Кастомная версия стола: другой принцип открывания подлокотников, настраиваемые мягкие части, вращаемый стол.",
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-TABLE-L" },
      update: { name: "Тумба-стол подкатная большая", retailPrice: 4000000, category: "other" },
      create: {
        sku: "EWS-TABLE-L",
        name: "Тумба-стол подкатная большая",
        category: "other",
        retailPrice: 4000000,
        description: "Для больших системных блоков. Чёрная. ДШВ 70×45×62 см.",
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-TABLE-S" },
      update: { name: "Тумба-стол подкатная стандарт", retailPrice: 3500000, category: "other" },
      create: {
        sku: "EWS-TABLE-S",
        name: "Тумба-стол подкатная стандарт",
        category: "other",
        retailPrice: 3500000,
        description: "Для системных блоков поменьше. Чёрная. ДШВ 61.5(47.5)×30.5×56 см.",
      },
    }),
    prisma.accessory.upsert({
      where: { sku: "EWS-GOFRA" },
      update: { name: "Гофра кастомная", retailPrice: 550000, category: "cable" },
      create: {
        sku: "EWS-GOFRA",
        name: "Гофра кастомная",
        category: "cable",
        retailPrice: 550000,
        description: "Эстетичнее стандартной, вмещает больше проводов. Стандартная гофра включена в базу.",
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

  // ─── Upholstery catalog ────────────────────────────────
  const bionicaMat = await prisma.upholsteryMaterial.upsert({
    where: { code: "bionica" },
    update: {},
    create: {
      code: "bionica",
      name: "Искусственная кожа Bionica",
      description:
        "Создана с применением нанотехнологий. Пористая мембрана из модифицированного полиуретана, «дышит». " +
        "Фактура крупного зерна, мягкость, толщина и рисунок максимально приближены к натуральной коже. " +
        "Износостойкость: 120 000 циклов Мартиндейла. Плотность: 715 г/кв.м. " +
        "Поверхность: 100% модифицированный ПУ. Дублирующая ткань: 100% полиэстер. Основа: 65% полиэстер, 35% хлопок.",
      surchargePrice: 0,
      sortOrder: 0,
    },
  });

  const auroraMat = await prisma.upholsteryMaterial.upsert({
    where: { code: "aurora" },
    update: {},
    create: {
      code: "aurora",
      name: "Искусственная замша Aurora (LE)",
      description:
        "Максимально похожа на натуральную замшу, но прочнее и долговечнее. " +
        "Износостойкость: >100 000 циклов Мартиндейла. Подходит для домов с питомцами: " +
        "не остаются следы от когтей, шерсть убирается без труда. " +
        "Водоотталкивающая пропитка Waterproof. 100% полиэстер, 500 г/кв.м.",
      surchargePrice: 1500000,
      sortOrder: 1,
    },
  });

  const naturalMat = await prisma.upholsteryMaterial.upsert({
    where: { code: "natural_leather" },
    update: {},
    create: {
      code: "natural_leather",
      name: "Натуральная кожа",
      description:
        "Натуральная мебельная кожа в любом цвете по каталогу проверенного поставщика (oblavka.ru). " +
        "Сроки изготовления согласовываются индивидуально.",
      surchargePrice: 8500000,
      sortOrder: 2,
    },
  });

  const customMat = await prisma.upholsteryMaterial.upsert({
    where: { code: "custom_material" },
    update: {},
    create: {
      code: "custom_material",
      name: "Собственный материал",
      description:
        "Давальческий материал заказчика. Необходимо 4 погонных метра мебельной ткани.",
      surchargePrice: 6500000,
      sortOrder: 3,
    },
  });

  // Bionica colors (Black Diamond = default, included in base price)
  const bionicaColors = [
    { code: "black_diamond", name: "Black Diamond", isDefault: true, sortOrder: 0 },
    { code: "blue_berry", name: "Blue Berry", isDefault: false, sortOrder: 1 },
    { code: "cream", name: "Cream", isDefault: false, sortOrder: 2 },
    { code: "espresso", name: "Espresso", isDefault: false, sortOrder: 3 },
    { code: "latte", name: "Latte", isDefault: false, sortOrder: 4 },
    { code: "taupe_grey", name: "Taupe Grey", isDefault: false, sortOrder: 5 },
    { code: "chocolatte_milk", name: "Chocolatte Milk", isDefault: false, sortOrder: 6 },
    { code: "ecru", name: "Ecru", isDefault: false, sortOrder: 7 },
    { code: "shadow", name: "Shadow", isDefault: false, sortOrder: 8 },
    { code: "white", name: "White", isDefault: false, sortOrder: 9 },
  ];

  for (const c of bionicaColors) {
    await prisma.upholsteryColor.upsert({
      where: { materialId_code: { materialId: bionicaMat.id, code: c.code } },
      update: {},
      create: { materialId: bionicaMat.id, ...c },
    });
  }

  // Aurora LE colors
  const auroraColors = [
    { code: "navy", name: "Navy" },
    { code: "desert", name: "Desert" },
    { code: "slate", name: "Slate" },
    { code: "plum", name: "Plum" },
    { code: "ash", name: "Ash" },
    { code: "blue_berry", name: "Blue-berry" },
    { code: "cocoa", name: "Cocoa" },
    { code: "sage", name: "Sage" },
    { code: "stone", name: "Stone" },
    { code: "bone", name: "Bone" },
    { code: "grafit", name: "Grafit" },
    { code: "atlantic", name: "Atlantic" },
    { code: "mint", name: "Mint" },
    { code: "yellow", name: "Yellow" },
    { code: "olive", name: "Olive" },
    { code: "dimrose", name: "Dimrose" },
    { code: "bitter", name: "Bitter" },
    { code: "grey", name: "Grey" },
    { code: "beige", name: "Beige" },
    { code: "terra", name: "Terra" },
    { code: "java", name: "Java" },
    { code: "taupe", name: "Taupe" },
    { code: "sand", name: "Sand" },
  ];

  for (let i = 0; i < auroraColors.length; i++) {
    const c = auroraColors[i];
    await prisma.upholsteryColor.upsert({
      where: { materialId_code: { materialId: auroraMat.id, code: c.code } },
      update: {},
      create: {
        materialId: auroraMat.id,
        code: c.code,
        name: c.name,
        isDefault: false,
        sortOrder: i,
      },
    });
  }

  // Natural leather — no preset colors, custom order
  await prisma.upholsteryColor.upsert({
    where: { materialId_code: { materialId: naturalMat.id, code: "custom" } },
    update: {},
    create: {
      materialId: naturalMat.id,
      code: "custom",
      name: "По каталогу поставщика",
      isDefault: true,
      sortOrder: 0,
    },
  });

  // Custom material — single entry
  await prisma.upholsteryColor.upsert({
    where: { materialId_code: { materialId: customMat.id, code: "custom" } },
    update: {},
    create: {
      materialId: customMat.id,
      code: "custom",
      name: "Давальческий материал",
      isDefault: true,
      sortOrder: 0,
    },
  });

  console.log("Created upholstery catalog (4 materials, 35 colors)");

  // ─── Service catalog ───────────────────────────────────
  await Promise.all([
    prisma.serviceCatalog.upsert({
      where: { code: "assembly" },
      update: {},
      create: {
        code: "assembly",
        name: "Сборка станции",
        description: "Профессиональная сборка E-station специалистом на месте.",
        price: 1000000,
        cities: ["Москва", "Санкт-Петербург", "Краснодар", "Новосибирск", "Минск", "Алматы"],
      },
    }),
    prisma.serviceCatalog.upsert({
      where: { code: "white_frame" },
      update: {},
      create: {
        code: "white_frame",
        name: "Белый цвет металлокаркаса",
        description: "Перекраска каркаса в RAL 9010 муар. Винты и некоторые элементы останутся чёрными.",
        price: 8000000,
        cities: [],
      },
    }),
    prisma.serviceCatalog.upsert({
      where: { code: "rental_test" },
      update: {},
      create: {
        code: "rental_test",
        name: "Аренда-тест (60 дней)",
        description: "Длительное тестирование продукта. Включает: 60 дней аренды, доставку, сборку, разборку.",
        price: 3400000,
        cities: ["Москва", "Санкт-Петербург"],
      },
    }),
  ]);
  console.log("Created service catalog (3 services)");

  // ─── Configuration templates ───────────────────────────
  // Find accessories by SKU for linking
  const accBySku = Object.fromEntries(accessories.map((a) => [a.sku, a]));

  const configs = await Promise.all([
    prisma.configuration.upsert({
      where: { id: "cfg-base-1mon" },
      update: {},
      create: {
        id: "cfg-base-1mon",
        name: "Базовая + 1 монитор",
        description: "Станция E-station + кронштейн EWS-25 для одного монитора",
        defaultRentPrice1m: 3400000,
        defaultRentPrice2m: 3200000,
        defaultRentPrice3m: 3000000,
        defaultSalePrice: 24999000,
        defaultDeliveryPrice: 0,
        isTemplate: true,
      },
    }),
    prisma.configuration.upsert({
      where: { id: "cfg-work-2mon" },
      update: {},
      create: {
        id: "cfg-work-2mon",
        name: "Рабочая + 2 монитора (симметрично)",
        description: "Станция E-station + шина Bus2S для двух мониторов симметрично",
        defaultRentPrice1m: 3800000,
        defaultRentPrice2m: 3600000,
        defaultRentPrice3m: 3400000,
        defaultSalePrice: 26899000,
        defaultDeliveryPrice: 0,
        isTemplate: true,
      },
    }),
    prisma.configuration.upsert({
      where: { id: "cfg-pro-3mon" },
      update: {},
      create: {
        id: "cfg-pro-3mon",
        name: "Про + 3 монитора (горизонтально)",
        description: "Станция E-station + шина Bus3 для трёх мониторов горизонтально",
        defaultRentPrice1m: 4000000,
        defaultRentPrice2m: 3800000,
        defaultRentPrice3m: 3600000,
        defaultSalePrice: 27299000,
        defaultDeliveryPrice: 0,
        isTemplate: true,
      },
    }),
    prisma.configuration.upsert({
      where: { id: "cfg-laptop-center" },
      update: {},
      create: {
        id: "cfg-laptop-center",
        name: "Ноутбук по центру",
        description: "Станция E-station + кронштейн LapTop-C для ноутбука по центру",
        defaultRentPrice1m: 3600000,
        defaultRentPrice2m: 3400000,
        defaultRentPrice3m: 3200000,
        defaultSalePrice: 25499000,
        defaultDeliveryPrice: 0,
        isTemplate: true,
      },
    }),
    prisma.configuration.upsert({
      where: { id: "cfg-laptop-side" },
      update: {},
      create: {
        id: "cfg-laptop-side",
        name: "Ноутбук сбоку",
        description: "Станция E-station + комплект «Ноутбук сбоку» (переходник + G90 + площадка)",
        defaultRentPrice1m: 3600000,
        defaultRentPrice2m: 3400000,
        defaultRentPrice3m: 3200000,
        defaultSalePrice: 25699000,
        defaultDeliveryPrice: 0,
        isTemplate: true,
      },
    }),
  ]);

  // Configuration lines — link accessories to configs
  const lineData: { configId: string; sku: string }[] = [
    { configId: "cfg-base-1mon", sku: "EWS-25" },
    { configId: "cfg-work-2mon", sku: "EWS-25" },
    { configId: "cfg-work-2mon", sku: "EWS-Bus2S" },
    { configId: "cfg-pro-3mon", sku: "EWS-25" },
    { configId: "cfg-pro-3mon", sku: "EWS-Bus3" },
    { configId: "cfg-laptop-center", sku: "EWS-LapTop-C" },
    { configId: "cfg-laptop-side", sku: "EWS-LapTop-Side" },
  ];

  for (const ld of lineData) {
    const acc = accBySku[ld.sku];
    if (!acc) continue;
    const lineId = `${ld.configId}-${ld.sku}`;
    await prisma.configurationLine.upsert({
      where: { id: lineId },
      update: {},
      create: {
        id: lineId,
        configurationId: ld.configId,
        accessoryId: acc.id,
        qty: 1,
        isRequired: true,
        defaultPrice: acc.retailPrice,
      },
    });
  }

  console.log(`Created ${configs.length} configuration templates`);

  // ─── Clients ───────────────────────────────────────────
  const existingClients = await prisma.client.count();
  if (existingClients === 0) {
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
  } else {
    console.log(`Skipped clients (${existingClients} already exist)`);
  }

  // ─── Cleanup old accessories that no longer match site SKUs ─
  const oldSkus = [
    "EWS-KRON-25", "EWS-FF-LAPTOP", "EWS-LAPTOP-C",
    "EWS-RAIL-2", "EWS-RAIL-UNI", "EWS-BUS2-3",
    "EWS-G90", "EWS-PLAT-15", "EWS-BLOCK-SMOOTH",
  ];
  for (const sku of oldSkus) {
    const existing = await prisma.accessory.findUnique({ where: { sku } });
    if (existing) {
      const hasLines = await prisma.configurationLine.count({ where: { accessoryId: existing.id } });
      const hasRentals = await prisma.rentalAccessoryLine.count({ where: { accessoryId: existing.id } });
      if (hasLines === 0 && hasRentals === 0) {
        await prisma.inventoryItem.deleteMany({ where: { accessoryId: existing.id } });
        await prisma.inventoryMovement.deleteMany({ where: { accessoryId: existing.id } });
        await prisma.accessory.delete({ where: { sku } });
        console.log(`Removed old accessory: ${sku}`);
      } else {
        console.log(`Kept old accessory ${sku} (has linked data)`);
      }
    }
  }

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
