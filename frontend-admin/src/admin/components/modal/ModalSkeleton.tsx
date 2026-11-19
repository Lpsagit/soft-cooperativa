import { Skeleton } from "@/components/ui/skeleton";

export const ModalSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-6 w-1/2" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-10 w-full mt-4" />
  </div>
);
