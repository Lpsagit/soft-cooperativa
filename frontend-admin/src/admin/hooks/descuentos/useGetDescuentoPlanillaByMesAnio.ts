import { getDescuentoPlanillaByMesAnio } from "@/admin/actions/descuentos.action";
import { useQuery } from "@tanstack/react-query";

//* regresa los descuento de planilla de un determinado periodo
interface Props {
  anio: string;
  mes: string;
}

export const useGetDescuentoPlanillaByMesAnio = ({ anio, mes }: Props) => {
  return useQuery({
    queryKey: ["descuento-planilla", mes, anio],
    queryFn: () => getDescuentoPlanillaByMesAnio(anio, mes),
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(anio && mes),
  });
};
