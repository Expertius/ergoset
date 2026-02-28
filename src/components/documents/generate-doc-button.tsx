"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { generateDocumentAction } from "@/actions/documents";
import { DOCUMENT_TYPE_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import { FileText } from "lucide-react";

interface GenerateDocButtonProps {
  dealId: string;
  rentalId?: string;
}

export function GenerateDocButton({ dealId, rentalId }: GenerateDocButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [docType, setDocType] = useState<string>("rental_contract");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    const result = await generateDocumentAction(dealId, docType, rentalId);
    setLoading(false);
    if (result.success) {
      toast.success("Документ создан");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <FileText className="h-4 w-4 mr-1" />
          Документ
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Генерация документа</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Тип документа</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Генерация..." : "Сгенерировать"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
