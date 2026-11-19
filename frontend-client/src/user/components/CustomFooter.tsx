export const CustomFooter = () => {
  return (
    <footer className="py-12 ">
      <div className="container mx-auto">
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            Copyright &copy; {new Date().getFullYear()} Todos los derechos
            reservados.
          </p>
        </div>
        <div className=" mt-2 pt-2 text-center text-sm text-muted-foreground">
          Desarrollado por{" "}
          <a href="mailto:ronaldedson17@gmail.com">
            <u>Ronald Choquehuanca</u>
          </a>
        </div>
      </div>
    </footer>
  );
};
