import { create } from "zustand";

export interface FarmState {
  selectedFieldId: string; // "ALL" or specific Field UUID
  setSelectedFieldId: (id: string) => void;

  // Modal State
  activeModal: "FIELD" | "WATER" | "PESTICIDE" | "EXPENSE" | null;
  editingEntity: any | null;
  openModal: (modal: "FIELD" | "WATER" | "PESTICIDE" | "EXPENSE", entity?: any) => void;
  closeModal: () => void;

  // Pesticide Search & Date Filter
  pesticideSearchQuery: string;
  setPesticideSearchQuery: (query: string) => void;
  pesticideSelectedDate: string | null; // YYYY-MM-DD
  setPesticideSelectedDate: (date: string | null) => void;

  // Global Map Center / Focus
  mapCenter: [number, number] | null;
  setMapCenter: (coords: [number, number] | null) => void;
}

export const useFarmStore = create<FarmState>((set) => ({
  selectedFieldId: "ALL",
  setSelectedFieldId: (id: string) => set({ selectedFieldId: id }),

  activeModal: null,
  editingEntity: null,
  openModal: (modal, entity = null) => set({ activeModal: modal, editingEntity: entity }),
  closeModal: () => set({ activeModal: null, editingEntity: null }),

  pesticideSearchQuery: "",
  setPesticideSearchQuery: (query) => set({ pesticideSearchQuery: query }),
  pesticideSelectedDate: null,
  setPesticideSelectedDate: (date) => set({ pesticideSelectedDate: date }),

  mapCenter: null,
  setMapCenter: (coords) => set({ mapCenter: coords }),
}));
