import { create } from "zustand";
import type { ReactNode } from "react";

interface ModalOptions {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closable?: boolean;
  description?: string;
  onClose?: () => void;
}

interface ModalState {
  open: boolean;
  title?: string;
  content: ReactNode | null;
  options: ModalOptions;

  openModal: (
    content: ReactNode,
    title?: string,
    options?: ModalOptions,
  ) => void;
  closeModal: () => void;
  resetModal: () => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  open: false,
  content: null,
  title: undefined,
  options: {},

  openModal: (content, title, options = {}) =>
    set({
      open: true,
      content,
      title,
      options: { size: "md", closable: true, ...options },
    }),

  closeModal: () => {
    get().options.onClose?.();
    set({ open: false });
  },

  resetModal: () =>
    set({
      content: null,
      title: undefined,
      options: {},
    }),
}));
