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

// GENERAL
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
    title: "Exito...!",
    text: message,
    timer: 1500,
    showConfirmButton: false,
  });
};

export const infoAlert = (message: string) => {
  return Swal.fire({
    icon: "info",
    title: "Oops...",
    text: message,
    showConfirmButton: true,
  });
};

export const errorAlert = (message: string) => {
  return Swal.fire({
    icon: "error",
    title: "Oops...",
    text: message,
    showConfirmButton: true,
  });
};
