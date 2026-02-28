"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { previewCSVAction, executeImportAction } from "@/actions/import";
import { toast } from "sonner";
import type { ImportResult } from "@/services/import";
import { Upload, Check, AlertTriangle } from "lucide-react";

const ENTITY_FIELDS: Record<string, { label: string; fields: { key: string; label: string; required: boolean }[] }> = {
  assets: {
    label: "Станции",
    fields: [
      { key: "code", label: "Код", required: true },
      { key: "name", label: "Название", required: true },
      { key: "brand", label: "Бренд", required: false },
      { key: "model", label: "Модель", required: false },
      { key: "type", label: "Тип", required: false },
      { key: "color", label: "Цвет", required: false },
      { key: "upholstery", label: "Обивка", required: false },
      { key: "tableType", label: "Тип стола", required: false },
      { key: "location", label: "Локация", required: false },
      { key: "purchasePrice", label: "Цена закупки", required: false },
      { key: "retailPrice", label: "Розничная", required: false },
      { key: "notes", label: "Заметки", required: false },
    ],
  },
  accessories: {
    label: "Аксессуары",
    fields: [
      { key: "sku", label: "SKU", required: true },
      { key: "name", label: "Название", required: true },
      { key: "category", label: "Категория", required: false },
      { key: "description", label: "Описание", required: false },
      { key: "purchasePrice", label: "Цена закупки", required: false },
      { key: "retailPrice", label: "Розничная", required: false },
    ],
  },
  clients: {
    label: "Клиенты",
    fields: [
      { key: "fullName", label: "ФИО", required: true },
      { key: "phone", label: "Телефон", required: false },
      { key: "email", label: "Email", required: false },
      { key: "registrationAddress", label: "Адрес регистрации", required: false },
      { key: "actualAddress", label: "Фактический адрес", required: false },
      { key: "passportSeries", label: "Серия паспорта", required: false },
      { key: "passportNumber", label: "Номер паспорта", required: false },
      { key: "notes", label: "Заметки", required: false },
    ],
  },
  payments: {
    label: "Платежи",
    fields: [
      { key: "dealId", label: "ID сделки", required: true },
      { key: "amount", label: "Сумма", required: true },
      { key: "date", label: "Дата", required: false },
      { key: "kind", label: "Тип", required: false },
      { key: "method", label: "Способ", required: false },
      { key: "status", label: "Статус", required: false },
      { key: "comment", label: "Комментарий", required: false },
    ],
  },
};

export function ImportWizard() {
  const [step, setStep] = useState<"upload" | "map" | "result">("upload");
  const [entity, setEntity] = useState<string>("assets");
  const [preview, setPreview] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const fileDataRef = useRef<File | null>(null);

  async function handlePreview() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Выберите файл");
      return;
    }
    fileDataRef.current = file;

    setLoading(true);
    const fd = new FormData();
    fd.set("file", file);
    const result = await previewCSVAction(fd);
    setLoading(false);

    if (result.success && result.preview) {
      setPreview(result.preview);

      const autoMap: Record<string, string> = {};
      const fields = ENTITY_FIELDS[entity].fields;
      for (const f of fields) {
        const match = result.preview.headers.find(
          (h) => h.toLowerCase() === f.key.toLowerCase()
        );
        if (match) autoMap[f.key] = match;
      }
      setMapping(autoMap);
      setStep("map");
    } else {
      toast.error(result.error || "Ошибка");
    }
  }

  async function handleImport() {
    if (!fileDataRef.current) return;

    setLoading(true);
    const fd = new FormData();
    fd.set("file", fileDataRef.current);
    fd.set("entity", entity);
    fd.set("mapping", JSON.stringify(mapping));
    const result = await executeImportAction(fd);
    setLoading(false);

    if (result.success && result.result) {
      setImportResult(result.result);
      setStep("result");
      toast.success(`Импортировано: ${result.result.imported} из ${result.result.total}`);
    } else {
      toast.error(result.error || "Ошибка импорта");
    }
  }

  if (step === "result" && importResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Результат импорта
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold">{importResult.total}</div>
              <div className="text-sm text-muted-foreground">Всего строк</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{importResult.imported}</div>
              <div className="text-sm text-muted-foreground">Импортировано</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{importResult.errors.length}</div>
              <div className="text-sm text-muted-foreground">Ошибок</div>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="rounded-md border p-3 max-h-60 overflow-y-auto">
              <p className="text-sm font-medium mb-2 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Ошибки:
              </p>
              {importResult.errors.map((err, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  Строка {err.row}: {err.message}
                </p>
              ))}
            </div>
          )}

          <Button onClick={() => { setStep("upload"); setPreview(null); setImportResult(null); }}>
            Новый импорт
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "map" && preview) {
    const fields = ENTITY_FIELDS[entity].fields;
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Маппинг колонок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key} className="flex items-center gap-2">
                  <Label className="w-40 text-sm">
                    {f.label} {f.required && "*"}
                  </Label>
                  <Select
                    value={mapping[f.key] || ""}
                    onValueChange={(v) =>
                      setMapping((m) => ({ ...m, [f.key]: v }))
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Пропустить</SelectItem>
                      {preview.headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Превью (первые 10 строк)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {preview.headers.map((h) => (
                    <TableHead key={h} className="text-xs">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.rows.map((row, i) => (
                  <TableRow key={i}>
                    {preview.headers.map((h) => (
                      <TableCell key={h} className="text-xs">{row[h]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleImport} disabled={loading}>
            {loading ? "Импорт..." : "Импортировать"}
          </Button>
          <Button variant="outline" onClick={() => setStep("upload")}>
            Назад
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Импорт CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Тип данных</Label>
          <Select value={entity} onValueChange={setEntity}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ENTITY_FIELDS).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>CSV файл</Label>
          <Input ref={fileRef} type="file" accept=".csv" />
        </div>

        <Button onClick={handlePreview} disabled={loading}>
          {loading ? "Загрузка..." : "Загрузить и превью"}
        </Button>
      </CardContent>
    </Card>
  );
}
