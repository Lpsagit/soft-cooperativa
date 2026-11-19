import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { Button } from "@/components/ui/button";
import { CustomJumbotron } from "@/user/components/CustomJumbotron";
import BienvenidaPapelerito from "@/user/components/user_modals/BienvenidaPapelerito";
import { useSocio } from "@/user/hooks/useSocio";
import { useModalStore } from "@/user/store/modal.store";
import { PiggyBank, User, Wallet } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router";

export const HomePage = () => {
  const { isLoading, data, isError } = useSocio();

  const { openModal, closeModal } = useModalStore();

  const navigate = useNavigate();
  const handleUpdateProfile = () => {
    closeModal();
    navigate("/edit-perfil");
  };

  useEffect(() => {
    if (isLoading || isError || !data?.socio) return;

    const email = data.socio.email?.trim() || "";
    const celular = data.socio.celular?.trim() || "";
    const direccion = data.socio.direccion?.trim() || "";
    const cuentaBancaria = data.socio.cuentaBancaria?.trim() || "";
    const numReferencia = data.socio.numReferencia?.trim() || "";

    if (!email || !celular || !direccion || !cuentaBancaria || !numReferencia) {
      openModal(
        <BienvenidaPapelerito
          onClose={closeModal}
          onUpdate={handleUpdateProfile}
        />,
        "Bienvenido a Cooperativa Papelerito",
      );
    }
  }, [isLoading, isError, data, openModal, closeModal]);

  if (isLoading) return <CustomFullScreenLoading />;
  const cards = [
    {
      title: "Mi Perfil",
      icon: User,
      // image:
      // "http://177.222.123.106:4040/sistema_rrhh/sis_personal/assets/img/fotos_personal/1929_1929_ronald.jpg",
      image: "/cooperativa/silueta1.png",
      subTitle:
        "En este apartado podras encontrar y modificar tu información personal.",
      page: "/perfil",
    },
    {
      title: "Mis Ahorros",
      icon: PiggyBank,
      image: "/cooperativa/ahorro2.jpeg",
      subTitle:
        "En este apartado podras encontrar todo el historial de tus ahorros.",
      page: "/ahorros",
    },
    {
      title: "Mis Préstamos",
      icon: Wallet,
      image: "/cooperativa/prestamo.jpeg",
      subTitle:
        "En este apartado podras ver tus prestamos, estado de prestados y otros.",
      page: "/prestamos",
    },
  ];

  return (
    <>
      <CustomJumbotron
        title="Cooperativa Papelerito"
        subTitle="Bienvenido, en este sistema encontrara toda la informacion referente al estado de tus ahorros y prestamos."
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {cards.map((card) => (
            <div
              key={card.title}
              className="relative h-64 rounded-xl overflow-hidden shadow-lg cursor-pointer group transform transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl"
            >
              {/* Imagen de fondo */}
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover filter blur-xs scale-105 group-hover:scale-110 transition-transform duration-300"
              />

              {/* Overlay para oscurecer un poco */}
              <div className="absolute inset-0 bg-black/25"></div>

              {/* Contenido centrado */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 gap-6">
                <h3 className="text-white mt-4 mb-2 text-3xl font-bold drop-shadow-lg ">
                  {card.title}
                </h3>

                <p className="text-white text-md font-medium drop-shadow-lg">
                  {card.subTitle}
                </p>
                <Link to={card.page}>
                  <Button className=" outline bg-amber-500">Ver</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
