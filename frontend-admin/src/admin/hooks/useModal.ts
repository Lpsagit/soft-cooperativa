import { useModalStore } from "@/admin/store/modal.store";
import type { ReactNode } from "react";

interface OpenModalParams {
  content: ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closable?: boolean;
  description?: string;
  onClose?: () => void;
}

export const useModal = () => {
  const { openModal, closeModal } = useModalStore();

  const open = ({
    content,
    title,
    size,
    closable,
    description,
    onClose,
  }: OpenModalParams) => {
    openModal(content, title, { size, closable, description, onClose });
  };

  return { open, close: closeModal };
};
