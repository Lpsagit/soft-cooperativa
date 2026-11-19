import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useModalStore } from "@/admin/store/modal.store";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg md:max-w-xl",
  lg: "sm:max-w-lg md:max-w-2xl",
  xl: "sm:max-w-lg md:max-w-4xl",
  full: "sm:max-w-[95vw] md:max-w-[70vw]",
} as const;

//*  molde del modal generico
export const ModalContainer = () => {
  const { open, title, content, options, closeModal, resetModal } =
    useModalStore();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeModal();
      setTimeout(resetModal, 200);
    }
  };

  const preventClose =
    options?.closable === false ? (e: Event) => e.preventDefault() : undefined;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          document.body.focus();
        }}
        onEscapeKeyDown={preventClose}
        onInteractOutside={preventClose}
        className={cn(
          "flex flex-col",
          "max-h-[85vh] sm:max-h-[90vh]",
          "overflow-hidden",
          sizeMap[options?.size ?? "md"],
        )}
      >
        {/* HEADER — fijo */}
        {title && (
          <>
            <DialogHeader className="shrink-0">
              <DialogTitle className="text-blue-papelera">{title}</DialogTitle>
              {options?.description ? (
                <DialogDescription>{options.description}</DialogDescription>
              ) : (
                <DialogDescription className="sr-only">
                  Ventana modal
                </DialogDescription>
              )}
            </DialogHeader>
            <Separator className="bg-blue-papelera shrink-0" />
          </>
        )}

        {/* CONTENIDO — scrolleable */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">{content}</div>
      </DialogContent>
    </Dialog>
  );
};
