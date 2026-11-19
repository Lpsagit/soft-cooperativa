//import { ApprovedAmortizar } from "./prestamos_modals/ApprovedAmortizar";
//import { RejectedAmortizar } from "./prestamos_modals/RejectedAmortizar";
import { RequireAmortizar } from "./prestamos_modals/RequireAmortizar";
import { UnderReviewAmortizar } from "./prestamos_modals/UnderReviewAmortizar";

interface Props {
  onClose: () => void;
  estado: string;
  estadoSoli: string;
}

export const AmortizarPrestamoModal = ({
  onClose,
  estado,
  estadoSoli,
}: Props) => {
  //return (
  //  <RequireAmortizar onClose={onClose} />
  // <UnderReviewAmortizar onClose={onClose} />
  // <RejectedAmortizar onClose={onClose} />
  // <ApprovedAmortizar onClose={onClose} />
  // );
  // switch (estado) {
  //   case "EN REVISION":
  //     return <UnderReviewAmortizar onClose={onClose} />;
  //   case "APROBADO":
  //     return <RequireAmortizar onClose={onClose} />;
  //   case "REFINANCIADO":
  //     return <RequireAmortizar onClose={onClose} />;
  //   case "AMORTIZADO":
  //     return <RequireAmortizar onClose={onClose} />;
  //   default:
  //     return <RequireAmortizar onClose={onClose} />;
  // }

  switch (estadoSoli) {
    case "AMORTIZACION":
      return <UnderReviewAmortizar onClose={onClose} />;
    default: {
      // caso SIN SOLICITUD, pero el estado del prestamo ESTA "APROBADO"
      if (
        estado === "APROBADO" ||
        estado === "REFINANCIADO" ||
        estado === "AMORTIZADO"
      ) {
        return <RequireAmortizar onClose={onClose} />;
      }
      if (!estado) {
        return <RequireAmortizar onClose={onClose} />;
      }
    }
  }
};
