"use client";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/useAppStore";
import { Plus, Minus } from "lucide-react";

export function TransactionModalTrigger() {
  const { openModal } = useAppStore((state) => state.transactionModal);

  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 flex flex-col gap-3 z-40">
      <Button 
        size="icon" 
        className="h-14 w-14 rounded-full shadow-lg bg-emerald-500 hover:bg-emerald-600"
        onClick={() => openModal("INCOME")}
      >
        <Plus className="h-6 w-6" />
      </Button>
      <Button 
        size="icon" 
        className="h-14 w-14 rounded-full shadow-lg bg-red-500 hover:bg-red-600"
        onClick={() => openModal("EXPENSE")}
      >
        <Minus className="h-6 w-6" />
      </Button>
    </div>
  );
}
