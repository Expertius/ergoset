"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  extendRentalAction,
  closeByReturnAction,
  closeByBuyoutAction,
  cancelDealAction,
  activateDealAction,
} from "@/actions/deals";
import { toast } from "sonner";
import { CalendarPlus, RotateCcw, ShoppingCart, X, Play } from "lucide-react";

interface DealActionsProps {
  dealId: string;
  dealStatus: string;
  rentalId?: string;
}

export function DealActions({ dealId, dealStatus, rentalId }: DealActionsProps) {
  const router = useRouter();
  const [extendOpen, setExtendOpen] = useState(false);
  const [buyoutOpen, setBuyoutOpen] = useState(false);

  const isActive = ["active", "extended", "delivered"].includes(dealStatus);
  const isBookedOrScheduled = ["booked", "delivery_scheduled", "delivered"].includes(dealStatus);
  const isClosed = ["closed_return", "closed_purchase", "canceled"].includes(dealStatus);

  async function handleActivate() {
    const result = await activateDealAction(dealId);
    if (result.success) {
      toast.success("Сделка активирована");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleReturn() {
    if (!rentalId) return;
    if (!confirm("Подтвердить возврат станции?")) return;
    const result = await closeByReturnAction(rentalId);
    if (result.success) {
      toast.success("Аренда закрыта (возврат)");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleCancel() {
    if (!confirm("Отменить сделку? Станция будет освобождена.")) return;
    const result = await cancelDealAction(dealId);
    if (result.success) {
      toast.success("Сделка отменена");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleExtend(formData: FormData) {
    if (!rentalId) return;
    formData.set("rentalId", rentalId);
    const result = await extendRentalAction(formData);
    if (result.success) {
      toast.success("Аренда продлена");
      setExtendOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleBuyout(formData: FormData) {
    if (!rentalId) return;
    const amount = formData.get("purchaseAmount");
    const result = await closeByBuyoutAction(
      rentalId,
      amount ? Number(amount) : undefined
    );
    if (result.success) {
      toast.success("Оформлен выкуп");
      setBuyoutOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  if (isClosed) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {isBookedOrScheduled && (
        <Button size="sm" onClick={handleActivate}>
          <Play className="h-4 w-4 mr-1" />
          Активировать
        </Button>
      )}

      {isActive && rentalId && (
        <>
          <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <CalendarPlus className="h-4 w-4 mr-1" />
                Продлить
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Продление аренды</DialogTitle>
              </DialogHeader>
              <form action={handleExtend} className="space-y-4">
                <div className="space-y-2">
                  <Label>Новая дата окончания *</Label>
                  <Input name="newEndDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Сумма аренды (коп.)</Label>
                  <Input name="amountRent" type="number" defaultValue="0" />
                </div>
                <div className="space-y-2">
                  <Label>Комментарий</Label>
                  <Textarea name="comment" rows={2} />
                </div>
                <Button type="submit" className="w-full">
                  Продлить
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Button size="sm" variant="outline" onClick={handleReturn}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Возврат
          </Button>

          <Dialog open={buyoutOpen} onOpenChange={setBuyoutOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <ShoppingCart className="h-4 w-4 mr-1" />
                Выкуп
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Оформление выкупа</DialogTitle>
              </DialogHeader>
              <form action={handleBuyout} className="space-y-4">
                <div className="space-y-2">
                  <Label>Сумма выкупа (коп.)</Label>
                  <Input name="purchaseAmount" type="number" placeholder="0" />
                </div>
                <Button type="submit" className="w-full">
                  Оформить выкуп
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}

      {!isClosed && (
        <Button size="sm" variant="destructive" onClick={handleCancel}>
          <X className="h-4 w-4 mr-1" />
          Отменить
        </Button>
      )}
    </div>
  );
}
