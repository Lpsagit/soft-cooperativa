//import { ApprovedPrestamo } from "./prestamos_modals/ApprovedPrestamo";
import { FirstPrestamo } from "./prestamos_modals/FirstPrestamo";
//import { RejectedPrestamo } from "./prestamos_modals/RejectedPrestamo";
import { SecondPrestamo } from "./prestamos_modals/SecondPrestamo";
//import { UnderReviewAmortizar } from "./prestamos_modals/UnderReviewAmortizar";
import { UnderReviewPrestamo } from "./prestamos_modals/UnderReviewPrestamo";
import { UnderReviewRefinanciamiento } from "./prestamos_modals/UnderReviewRefinanciamiento";

interface Props {
  onClose: () => void;
  estado: string;
  estadoSoli: string;
}

//const estado = "permitido";

export const SolicitarPrestamoModal = ({
  onClose,
  estado,
  estadoSoli,
}: Props) => {
  // return <RejectedPrestamo onClose={onClose} />;

  // switch (estado) {
  //   case "EN REVISION":
  //     return <UnderReviewPrestamo onClose={onClose} />;
  //   case "APROBADO":
  //     return <SecondPrestamo onClose={onClose} />;
  //   case "REFINANCIADO":
  //     return <SecondPrestamo onClose={onClose} />;
  //   case "AMORTIZADO":
  //     return <SecondPrestamo onClose={onClose} />;
  //   default:
  //     return <FirstPrestamo onClose={onClose} />;
  // }

  switch (estadoSoli) {
    case "REFINANCIAMIENTO":
      return <UnderReviewRefinanciamiento onClose={onClose} />;
    case "NUEVO PRESTAMO":
      return <UnderReviewPrestamo onClose={onClose} />;
    default: {
      // caso SIN SOLICITUD, pero el estado del prestamo ESTA "APROBADO"
      if (
        estado === "APROBADO" ||
        estado === "REFINANCIADO" ||
        estado === "AMORTIZADO"
      ) {
        return <SecondPrestamo onClose={onClose} />;
      }
      if (!estado) {
        return <FirstPrestamo onClose={onClose} />;
      }
    }
  }
};
