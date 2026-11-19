import { AdminTitle } from "@/admin/components/AdminTitle";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { DataTable } from "@/admin/components/table/DataTable";
import { useModal } from "@/admin/hooks/useModal";
import { socioColumns } from "@/admin/components/table/columns/socio.columns";
import { SocioNewCountModal } from "@/admin/components/modal/SocioNewCountModal";
import { useSocios } from "@/admin/hooks/socios/useSocios";

export const SociosPage = () => {
  const { open } = useModal();
  const { socios = [], isLoading, isError, error } = useSocios();

  const handleModalNewCount = () => {
    open({
      content: <SocioNewCountModal />,
      title: "Crear Nueva Cuenta Socio",
      size: "lg",
    });
  };
  if (isError) {
    return <div>Error: {(error as any)?.message}</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <AdminTitle
          title="Socios"
          subtitle="Aquí podrás consutar y editar todos los datos de los socios."
        />

        <div className="flex justify-end mb-10 gap-4">
          <Button onClick={handleModalNewCount}>
            <PlusIcon />
            Nueva Cuenta
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div>Cargando datos...</div>
      ) : (
        <DataTable columns={socioColumns} data={socios} />
      )}
    </>
  );
};
