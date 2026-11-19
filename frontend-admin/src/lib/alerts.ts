// lib/alerts.ts
import Swal from "sweetalert2";

//AUTH
export const loginErrorAlert = () => {
  return Swal.fire({
    icon: "error",
    title: "Error en la autenticación",
    text: "El usuario y/o contraseña son incorrectos ",
    showConfirmButton: true,
  });
};

//CHANGE PASSWORD
export const changePasswordErrorAlert = () => {
  return Swal.fire({
    icon: "error",
    title: "Error al cambiar la contraseña",
    text: "La contraseña actual es incorrecta.",
    showConfirmButton: false,
    timer: 3000,
  });
};

// GENERICOS
export const confirmDelete = async () => {
  return Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás revertir esto",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });
};

export const successAlert = (message: string) => {
  return Swal.fire({
    icon: "success",
    title: message,
    timer: 1500,
    showConfirmButton: false,
  });
};

export const infoAlert = (message: string) => {
  return Swal.fire({
    icon: "info",
    title: "Oops...",
    text: message,
    timer: 2000,
    showConfirmButton: false,
  });
};
export const errorAlert = (message: string) => {
  return Swal.fire({
    icon: "error",
    title: "Oops...",
    text: message,
    timer: 3000,
    showConfirmButton: false,
  });
};

// SOCIO
export const confirmResetPassword = async (): Promise<boolean> => {
  const result = await Swal.fire({
    title: "¿Estás seguro de reestablecer la contraseña?",
    text: "No podrá revertir esto",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, Reestablecer",
    cancelButtonText: "Cancelar",
  });

  return result.isConfirmed;
};
//DESCUENTOS
export const confirmGenerateList = async (): Promise<boolean> => {
  const result = await Swal.fire({
    title: "¿Generar lista de descuentos?",
    text: "Esta acción generará la lista de descuentos para el periodo seleccionado.",
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Sí, Generar",
    cancelButtonText: "Cancelar",
  });

  return result.isConfirmed;
};

//PRESTAMOS
export const rechazarPrestamo = async (): Promise<{
  confirmado: boolean;
  motivo?: string;
}> => {
  const result = await Swal.fire({
    title: "Rechazar Préstamo",
    text: "Esta acción negará el préstamo al socio y no podrá ser revertida.",
    icon: "warning",
    input: "text", // 👈 aquí agregas el input
    inputPlaceholder: "Ingrese el motivo del rechazo",
    showCancelButton: true,
    confirmButtonText: "Sí, Rechazar",
    cancelButtonText: "Cancelar",
    inputValidator: (value) => {
      if (!value) {
        return "Debe ingresar un motivo";
      }
      return null;
    },
  });

  return {
    confirmado: result.isConfirmed,
    motivo: result.value, // 👈 aquí obtienes el texto
  };
};
