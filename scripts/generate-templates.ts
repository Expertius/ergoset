/**
 * Генерирует DOCX-шаблоны для docxtemplater.
 * Запуск: npx tsx scripts/generate-templates.ts
 */
import PizZip from "pizzip";
import * as fs from "fs";
import * as path from "path";

const TEMPLATES_DIR = path.join(process.cwd(), "templates");

// ── Helpers ────────────────────────────────────────────────

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>`;

const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const WORD_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>`;

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/></w:rPr>
    <w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:after="200"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="28"/><w:szCs w:val="28"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr><w:spacing w:before="200" w:after="120"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="24"/><w:szCs w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/></w:rPr>
  </w:style>
</w:styles>`;

const NUMBERING = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="decimal"/>
      <w:lvlText w:val="%1."/>
      <w:lvlJc w:val="left"/>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1">
    <w:abstractNumId w:val="0"/>
  </w:num>
</w:numbering>`;

// ── XML paragraph builders ─────────────────────────────────

function title(text: string): string {
  return `<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;
}

function heading(text: string): string {
  return `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;
}

function para(text: string): string {
  return `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;
}

function boldLabel(label: string, value: string): string {
  return `<w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${xmlEscape(label)}</w:t></w:r><w:r><w:t xml:space="preserve">${xmlEscape(value)}</w:t></w:r></w:p>`;
}

function emptyLine(): string {
  return `<w:p/>`;
}

function signatureLine(left: string, right: string): string {
  return `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(left)}                              ${xmlEscape(right)}</w:t></w:r></w:p>`;
}

// Table helper for accessories loop
function accessoriesTable(): string {
  const cellProps = `<w:tcPr><w:tcW w:w="0" w:type="auto"/><w:tcBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/></w:tcBorders></w:tcPr>`;
  const boldRun = (t: string) => `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${xmlEscape(t)}</w:t></w:r>`;
  const run = (t: string) => `<w:r><w:t xml:space="preserve">${xmlEscape(t)}</w:t></w:r>`;

  return `<w:tbl>
  <w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblBorders>
    <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
  </w:tblBorders></w:tblPr>
  <w:tr>
    <w:tc>${cellProps}<w:p>${boldRun("№")}</w:p></w:tc>
    <w:tc>${cellProps}<w:p>${boldRun("Наименование")}</w:p></w:tc>
    <w:tc>${cellProps}<w:p>${boldRun("Кол-во")}</w:p></w:tc>
    <w:tc>${cellProps}<w:p>${boldRun("Цена")}</w:p></w:tc>
  </w:tr>
  <w:tr>
    <w:tc>${cellProps}<w:p>${run("{#accessories}")}</w:p></w:tc>
    <w:tc>${cellProps}<w:p>${run("{name}")}</w:p></w:tc>
    <w:tc>${cellProps}<w:p>${run("{qty}")}</w:p></w:tc>
    <w:tc>${cellProps}<w:p>${run("{price}")}</w:p></w:tc>
  </w:tr>
  <w:tr>
    <w:tc>${cellProps}<w:p>${run("{/accessories}")}</w:p></w:tc>
    <w:tc>${cellProps}<w:p/></w:tc>
    <w:tc>${cellProps}<w:p/></w:tc>
    <w:tc>${cellProps}<w:p/></w:tc>
  </w:tr>
</w:tbl>`;
}

// ── DOCX builder ───────────────────────────────────────────

function buildDocx(bodyXml: string): Buffer {
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="1701" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const zip = new PizZip();
  zip.file("[Content_Types].xml", CONTENT_TYPES);
  zip.file("_rels/.rels", RELS);
  zip.file("word/_rels/document.xml.rels", WORD_RELS);
  zip.file("word/document.xml", documentXml);
  zip.file("word/styles.xml", STYLES);
  zip.file("word/numbering.xml", NUMBERING);

  return zip.generate({ type: "nodebuffer", compression: "DEFLATE" }) as Buffer;
}

// ── Template definitions ───────────────────────────────────

function rentalContract(): string {
  return [
    title("ДОГОВОР АРЕНДЫ ОБОРУДОВАНИЯ"),
    para("г. Москва                                                           {deal_date}"),
    emptyLine(),
    para('ИП «EasyWorkStation» (далее — «Арендодатель»), с одной стороны, и {client_name}, паспорт серия {client_passport_series} № {client_passport_number}, выдан {client_passport_issued_by} {client_passport_issue_date}, зарегистрированный(ая) по адресу: {client_registration_address} (далее — «Арендатор»), с другой стороны, заключили настоящий Договор о нижеследующем:'),
    emptyLine(),

    heading("1. Предмет договора"),
    para("1.1. Арендодатель передаёт, а Арендатор принимает во временное пользование (аренду) следующее оборудование:"),
    boldLabel("Наименование: ", "{asset_name}"),
    boldLabel("Код: ", "{asset_code}"),
    boldLabel("Бренд / Модель: ", "{asset_brand} {asset_model}"),
    para("1.2. Оборудование передаётся в комплекте с аксессуарами согласно Приложению (Акт приёма-передачи)."),
    emptyLine(),

    heading("2. Срок аренды"),
    boldLabel("2.1. Дата начала: ", "{start_date}"),
    boldLabel("2.2. Дата окончания: ", "{end_date}"),
    boldLabel("2.3. Планируемый срок аренды: ", "{planned_months} мес."),
    para("2.4. Договор может быть продлён по соглашению сторон. Арендатор обязан уведомить Арендодателя о намерении продлить аренду не менее чем за 3 (три) рабочих дня до окончания текущего срока."),
    emptyLine(),

    heading("3. Стоимость и порядок расчётов"),
    boldLabel("3.1. Арендная плата: ", "{rent_amount}"),
    boldLabel("3.2. Доставка: ", "{delivery_amount}"),
    boldLabel("3.3. Сборка/установка: ", "{assembly_amount}"),
    boldLabel("3.4. Залог (обеспечительный платёж): ", "{deposit_amount}"),
    boldLabel("3.5. Скидка: ", "{discount_amount}"),
    boldLabel("3.6. ИТОГО: ", "{total_amount}"),
    para("3.7. Оплата производится в порядке 100% предоплаты за каждый период аренды. Способ оплаты: наличными, банковской картой, банковским переводом или через СБП."),
    para("3.8. Залог возвращается Арендатору в течение 5 (пяти) рабочих дней после возврата оборудования в надлежащем состоянии."),
    emptyLine(),

    heading("4. Доставка"),
    boldLabel("4.1. Адрес доставки: ", "{delivery_address}"),
    para("4.2. Доставка и сборка оборудования осуществляются силами Арендодателя."),
    emptyLine(),

    heading("5. Обязанности сторон"),
    para("5.1. Арендодатель обязуется:"),
    para("  — передать оборудование в исправном состоянии;"),
    para("  — обеспечить доставку и сборку (при наличии в договоре);"),
    para("  — принять оборудование обратно по окончании срока аренды."),
    emptyLine(),
    para("5.2. Арендатор обязуется:"),
    para("  — использовать оборудование по назначению;"),
    para("  — не допускать передачу оборудования третьим лицам;"),
    para("  — обеспечить сохранность оборудования;"),
    para("  — своевременно вносить арендную плату;"),
    para("  — вернуть оборудование в исправном состоянии по окончании срока аренды."),
    emptyLine(),

    heading("6. Ответственность"),
    para("6.1. В случае повреждения или утраты оборудования Арендатор возмещает Арендодателю стоимость ремонта или полную стоимость оборудования."),
    para("6.2. За просрочку возврата оборудования Арендатор уплачивает неустойку в размере 0,5% от суммы арендной платы за каждый день просрочки."),
    emptyLine(),

    heading("7. Расторжение договора"),
    para("7.1. Договор может быть расторгнут по соглашению сторон."),
    para("7.2. Каждая из сторон вправе расторгнуть договор в одностороннем порядке, уведомив другую сторону не менее чем за 7 (семь) календарных дней."),
    emptyLine(),

    heading("8. Контактные данные Арендатора"),
    boldLabel("ФИО: ", "{client_name}"),
    boldLabel("Телефон: ", "{client_phone}"),
    boldLabel("Email: ", "{client_email}"),
    boldLabel("Адрес фактического проживания: ", "{client_actual_address}"),
    emptyLine(),

    heading("9. Подписи сторон"),
    emptyLine(),
    signatureLine("Арендодатель: _______________", "Арендатор: _______________"),
    emptyLine(),
    signatureLine("       М.П.", "       М.П."),
  ].join("\n");
}

function transferAct(): string {
  return [
    title("АКТ ПРИЁМА-ПЕРЕДАЧИ ОБОРУДОВАНИЯ"),
    para("г. Москва                                                           {deal_date}"),
    emptyLine(),
    para("Настоящий Акт составлен в том, что Арендодатель (ИП «EasyWorkStation») передал, а Арендатор ({client_name}) принял следующее оборудование:"),
    emptyLine(),

    heading("Оборудование"),
    boldLabel("Наименование: ", "{asset_name}"),
    boldLabel("Код: ", "{asset_code}"),
    boldLabel("Бренд / Модель: ", "{asset_brand} {asset_model}"),
    emptyLine(),

    heading("Период аренды"),
    boldLabel("Дата начала: ", "{start_date}"),
    boldLabel("Дата окончания: ", "{end_date}"),
    boldLabel("Адрес доставки: ", "{delivery_address}"),
    emptyLine(),

    heading("Комплектация (аксессуары)"),
    accessoriesTable(),
    emptyLine(),

    heading("Состояние оборудования"),
    para("Оборудование передано в исправном состоянии, без видимых повреждений."),
    para("Комплектность проверена и соответствует указанному выше перечню."),
    emptyLine(),

    heading("Финансовые условия"),
    boldLabel("Арендная плата: ", "{rent_amount}"),
    boldLabel("Доставка: ", "{delivery_amount}"),
    boldLabel("Сборка: ", "{assembly_amount}"),
    boldLabel("Залог: ", "{deposit_amount}"),
    boldLabel("Скидка: ", "{discount_amount}"),
    boldLabel("ИТОГО: ", "{total_amount}"),
    emptyLine(),

    para("Стороны претензий друг к другу не имеют."),
    emptyLine(),

    heading("Подписи сторон"),
    emptyLine(),
    signatureLine("Передал (Арендодатель): _______________", "Принял (Арендатор): _______________"),
    emptyLine(),
    para("Дата: {deal_date}"),
  ].join("\n");
}

function returnAct(): string {
  return [
    title("АКТ ВОЗВРАТА ОБОРУДОВАНИЯ"),
    para("г. Москва                                                           {deal_date}"),
    emptyLine(),
    para("Настоящий Акт составлен в том, что Арендатор ({client_name}) возвратил, а Арендодатель (ИП «EasyWorkStation») принял следующее оборудование:"),
    emptyLine(),

    heading("Оборудование"),
    boldLabel("Наименование: ", "{asset_name}"),
    boldLabel("Код: ", "{asset_code}"),
    boldLabel("Бренд / Модель: ", "{asset_brand} {asset_model}"),
    emptyLine(),

    heading("Период аренды"),
    boldLabel("Дата начала аренды: ", "{start_date}"),
    boldLabel("Плановая дата окончания: ", "{end_date}"),
    boldLabel("Фактическая дата возврата: ", "{deal_date}"),
    emptyLine(),

    heading("Возвращённая комплектация"),
    accessoriesTable(),
    emptyLine(),

    heading("Состояние оборудования при возврате"),
    para("[ ] Оборудование в исправном состоянии, без повреждений"),
    para("[ ] Обнаружены повреждения (описание): ________________________________"),
    para("[ ] Комплектация полная"),
    para("[ ] Комплектация неполная (недостающее): ________________________________"),
    emptyLine(),

    heading("Взаиморасчёты"),
    boldLabel("Залог внесён: ", "{deposit_amount}"),
    para("Удержания из залога: ________________________________"),
    para("Сумма к возврату: ________________________________"),
    emptyLine(),

    para("Стороны претензий друг к другу не имеют (за исключением указанных выше)."),
    emptyLine(),

    heading("Подписи сторон"),
    emptyLine(),
    signatureLine("Принял (Арендодатель): _______________", "Вернул (Арендатор): _______________"),
    emptyLine(),
    para("Дата: {deal_date}"),
  ].join("\n");
}

function buyoutDoc(): string {
  return [
    title("ДОГОВОР ВЫКУПА ОБОРУДОВАНИЯ"),
    para("г. Москва                                                           {deal_date}"),
    emptyLine(),
    para('ИП «EasyWorkStation» (далее — «Продавец»), с одной стороны, и {client_name}, паспорт серия {client_passport_series} № {client_passport_number}, выдан {client_passport_issued_by} {client_passport_issue_date}, зарегистрированный(ая) по адресу: {client_registration_address} (далее — «Покупатель»), с другой стороны, заключили настоящий Договор о нижеследующем:'),
    emptyLine(),

    heading("1. Предмет договора"),
    para("1.1. Продавец передаёт в собственность Покупателя, а Покупатель принимает и оплачивает следующее оборудование:"),
    boldLabel("Наименование: ", "{asset_name}"),
    boldLabel("Код: ", "{asset_code}"),
    boldLabel("Бренд / Модель: ", "{asset_brand} {asset_model}"),
    para("1.2. Оборудование ранее находилось в аренде у Покупателя (Договор аренды от {start_date})."),
    emptyLine(),

    heading("2. Цена и порядок расчётов"),
    boldLabel("2.1. Стоимость оборудования (выкупная цена): ", "{total_amount}"),
    boldLabel("2.2. Ранее внесённый залог: ", "{deposit_amount}"),
    para("2.3. Залог засчитывается в счёт выкупной цены (если применимо)."),
    para("2.4. Оплата производится в полном объёме до передачи оборудования в собственность."),
    emptyLine(),

    heading("3. Комплектация"),
    accessoriesTable(),
    emptyLine(),

    heading("4. Передача оборудования"),
    para("4.1. Оборудование передаётся Покупателю в том состоянии, в котором оно находится на момент выкупа."),
    para("4.2. С момента подписания настоящего Договора все риски случайной гибели или повреждения оборудования переходят к Покупателю."),
    emptyLine(),

    heading("5. Гарантии"),
    para("5.1. Продавец гарантирует, что оборудование принадлежит ему на праве собственности, не заложено, не находится под арестом."),
    para("5.2. Гарантийные обязательства производителя (при наличии) переходят к Покупателю."),
    emptyLine(),

    heading("6. Контактные данные Покупателя"),
    boldLabel("ФИО: ", "{client_name}"),
    boldLabel("Телефон: ", "{client_phone}"),
    boldLabel("Email: ", "{client_email}"),
    boldLabel("Адрес: ", "{client_actual_address}"),
    emptyLine(),

    heading("7. Подписи сторон"),
    emptyLine(),
    signatureLine("Продавец: _______________", "Покупатель: _______________"),
    emptyLine(),
    signatureLine("       М.П.", ""),
  ].join("\n");
}

function equipmentAppendix(): string {
  return [
    title("ПРИЛОЖЕНИЕ — СПЕЦИФИКАЦИЯ ОБОРУДОВАНИЯ"),
    para("к Договору аренды от {deal_date}"),
    emptyLine(),

    heading("Основное оборудование"),
    boldLabel("Наименование: ", "{asset_name}"),
    boldLabel("Код: ", "{asset_code}"),
    boldLabel("Бренд: ", "{asset_brand}"),
    boldLabel("Модель: ", "{asset_model}"),
    emptyLine(),

    heading("Арендатор"),
    boldLabel("ФИО: ", "{client_name}"),
    boldLabel("Телефон: ", "{client_phone}"),
    boldLabel("Email: ", "{client_email}"),
    emptyLine(),

    heading("Период"),
    boldLabel("Начало: ", "{start_date}"),
    boldLabel("Окончание: ", "{end_date}"),
    boldLabel("Срок: ", "{planned_months} мес."),
    emptyLine(),

    heading("Перечень аксессуаров и комплектующих"),
    accessoriesTable(),
    emptyLine(),

    heading("Стоимость"),
    boldLabel("Арендная плата: ", "{rent_amount}"),
    boldLabel("Доставка: ", "{delivery_amount}"),
    boldLabel("Сборка: ", "{assembly_amount}"),
    boldLabel("Залог: ", "{deposit_amount}"),
    boldLabel("Скидка: ", "{discount_amount}"),
    boldLabel("ИТОГО: ", "{total_amount}"),
    emptyLine(),

    boldLabel("Адрес доставки: ", "{delivery_address}"),
    emptyLine(),

    heading("Подписи"),
    emptyLine(),
    signatureLine("Арендодатель: _______________", "Арендатор: _______________"),
  ].join("\n");
}

// ── Generate all templates ─────────────────────────────────

const templates: Record<string, () => string> = {
  "rental-contract.docx": rentalContract,
  "transfer-act.docx": transferAct,
  "return-act.docx": returnAct,
  "buyout-doc.docx": buyoutDoc,
  "equipment-appendix.docx": equipmentAppendix,
};

if (!fs.existsSync(TEMPLATES_DIR)) {
  fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
}

for (const [filename, buildBody] of Object.entries(templates)) {
  const buf = buildDocx(buildBody());
  const filePath = path.join(TEMPLATES_DIR, filename);
  fs.writeFileSync(filePath, buf);
  console.log(`✓ ${filename} (${buf.length} bytes)`);
}

console.log(`\nAll ${Object.keys(templates).length} templates generated in ${TEMPLATES_DIR}`);
