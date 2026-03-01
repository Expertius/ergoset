"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  changeLeadStatusAction,
  sendContractFormAction,
  convertLeadAction,
  rejectLeadAction,
} from "@/actions/leads";
import {
  Phone,
  CheckCircle2,
  Send,
  ArrowRightCircle,
  XCircle,
  Loader2,
  Copy,
  MessageSquare,
} from "lucide-react";

type LeadActionsProps = {
  leadId: string;
  status: string;
  contractToken: string | null;
  hasContractData: boolean;
};

export function LeadActions({ leadId, status, contractToken, hasContractData }: LeadActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showContractLink, setShowContractLink] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(contractToken);

  const isTerminal = status === "converted" || status === "rejected";

  async function handleAction(action: string) {
    setLoading(action);
    try {
      let res;
      switch (action) {
        case "contacted":
          res = await changeLeadStatusAction(leadId, "contacted");
          break;
        case "qualified":
          res = await changeLeadStatusAction(leadId, "qualified");
          break;
        case "negotiation":
          res = await changeLeadStatusAction(leadId, "negotiation");
          break;
        case "send_contract": {
          const r = await sendContractFormAction(leadId);
          if (r.success && r.contractToken) {
            setGeneratedToken(r.contractToken);
            setShowContractLink(true);
          }
          res = r;
          break;
        }
        case "convert": {
          const r = await convertLeadAction(leadId);
          if (r.success && r.dealId) {
            toast.success("Лид конвертирован в сделку");
            router.push(`/deals/${r.dealId}`);
            return;
          }
          res = r;
          break;
        }
        default:
          return;
      }
      if (res?.success) {
        toast.success("Статус обновлён");
        router.refresh();
      } else {
        toast.error(res?.error || "Ошибка");
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    setLoading("reject");
    const res = await rejectLeadAction(leadId, rejectReason);
    if (res.success) {
      toast.success("Лид отклонён");
      setShowReject(false);
      router.refresh();
    } else {
      toast.error(res.error || "Ошибка");
    }
    setLoading(null);
  }

  function copyContractLink() {
    const url = `${window.location.origin}/contract/${generatedToken}`;
    navigator.clipboard.writeText(url);
    toast.success("Ссылка скопирована");
  }

  if (isTerminal) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {status === "new" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction("contacted")}
            disabled={loading === "contacted"}
          >
            {loading === "contacted" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Phone className="h-4 w-4 mr-1" />}
            Связались
          </Button>
        )}

        {(status === "new" || status === "contacted") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction("qualified")}
            disabled={loading === "qualified"}
          >
            {loading === "qualified" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
            Квалифицировать
          </Button>
        )}

        {(status === "qualified" || status === "contacted") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction("negotiation")}
            disabled={loading === "negotiation"}
          >
            {loading === "negotiation" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <MessageSquare className="h-4 w-4 mr-1" />}
            Переговоры
          </Button>
        )}

        {!["contract_pending", "contract_filled"].includes(status) && status !== "new" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction("send_contract")}
            disabled={loading === "send_contract"}
          >
            {loading === "send_contract" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
            Отправить форму договора
          </Button>
        )}

        {generatedToken && (
          <Button variant="outline" size="sm" onClick={copyContractLink}>
            <Copy className="h-4 w-4 mr-1" />
            Скопировать ссылку
          </Button>
        )}

        {(status === "contract_filled" || hasContractData) && (
          <Button
            size="sm"
            onClick={() => handleAction("convert")}
            disabled={loading === "convert"}
            className="bg-green-600 hover:bg-green-500 text-white"
          >
            {loading === "convert" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ArrowRightCircle className="h-4 w-4 mr-1" />}
            Конвертировать в сделку
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowReject(true)}
          className="text-red-500 hover:text-red-600"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Отклонить
        </Button>
      </div>

      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонить лид</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Причина отклонения (опционально)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReject(false)}>Отмена</Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading === "reject"}
            >
              {loading === "reject" && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Отклонить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showContractLink} onOpenChange={setShowContractLink}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ссылка на форму договора</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Отправьте эту ссылку клиенту для заполнения данных для договора:
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/contract/${generatedToken}`}
                className="flex-1 rounded-md border px-3 py-2 text-sm bg-muted"
              />
              <Button size="sm" onClick={copyContractLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContractLink(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
