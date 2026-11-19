import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useModalStore } from "../store/modal.store";
import { Separator } from "@/components/ui/separator";

export const CustomModal = () => {
  const { open, title, content, closeModal, resetModal } = useModalStore();

  const handleModalChanges = (isOpen: boolean) => {
    if (!isOpen) {
      closeModal();
      setTimeout(() => {
        resetModal();
      }, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleModalChanges}>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          document.body.focus();
        }}
        className="
          flex
          flex-col
          max-h-[85vh] 
          sm:max-h-[90vh]
          sm:max-w-lg
          md:max-w-xl
          lg:max-w-[80vw]
          xl:max-w-[70vw]
          2xl:max-w-[60vw]
          overflow-hidden
        "
      >
        {/* HEADER (NO SCROLL) */}
        <DialogHeader className="shrink-0">
          {title && (
            <DialogTitle className="text-blue-papelera">{title}</DialogTitle>
          )}

          <DialogDescription className="sr-only">
            Ventana modal
          </DialogDescription>
        </DialogHeader>

        <Separator className="bg-blue-papelera my-2" />

        {/* CONTENIDO SCROLLEABLE */}
        <div className="flex-1 overflow-y-auto pr-1">{content}</div>
      </DialogContent>
    </Dialog>
  );
};
