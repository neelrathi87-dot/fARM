"use client";

import React from "react";
import { useFarmStore } from "@/lib/store/farmStore";
import { FieldModal } from "@/components/fields/FieldModal";
import { WaterLogModal } from "@/components/irrigation/WaterLogModal";
import { PesticideModal } from "@/components/pesticides/PesticideModal";
import { ExpenseModal } from "@/components/expenses/ExpenseModal";
import { useRouter } from "next/navigation";

interface GlobalModalHostProps {
  fields: Array<{
    id: string;
    name: string;
    cropType: string;
    areaAcres: number;
    latitude: number;
    longitude: number;
  }>;
}

export const GlobalModalHost: React.FC<GlobalModalHostProps> = ({ fields }) => {
  const router = useRouter();
  const { activeModal, editingEntity, closeModal, selectedFieldId } = useFarmStore();

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <FieldModal
        isOpen={activeModal === "FIELD"}
        onClose={closeModal}
        fieldToEdit={editingEntity}
        onSuccess={handleSuccess}
      />

      <WaterLogModal
        isOpen={activeModal === "WATER"}
        onClose={closeModal}
        fields={fields}
        defaultFieldId={selectedFieldId !== "ALL" ? selectedFieldId : undefined}
        onSuccess={handleSuccess}
      />

      <PesticideModal
        isOpen={activeModal === "PESTICIDE"}
        onClose={closeModal}
        fields={fields}
        defaultFieldId={selectedFieldId !== "ALL" ? selectedFieldId : undefined}
        onSuccess={handleSuccess}
      />

      <ExpenseModal
        isOpen={activeModal === "EXPENSE"}
        onClose={closeModal}
        fields={fields}
        defaultFieldId={selectedFieldId !== "ALL" ? selectedFieldId : undefined}
        onSuccess={handleSuccess}
      />
    </>
  );
};
