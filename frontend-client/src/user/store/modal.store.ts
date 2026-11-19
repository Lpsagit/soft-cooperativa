import { create } from "zustand";
import type { ReactNode } from "react";

interface ModalState {
  open: boolean;
  title?: string;
  content: ReactNode | null;

  openModal: (content: ReactNode, title?: string) => void;
  closeModal: () => void;
  resetModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  open: false,
  content: null,
  title: undefined,

  openModal: (content, title) =>
    set({
      open: true,
      content,
      title,
    }),

  closeModal: () =>
    set({
      open: false,
    }),

  resetModal: () =>
    set({
      content: null,
      title: undefined,
    }),
}));
