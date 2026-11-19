interface Props {
  title: string;
  subTitle: string;
}

export const CustomJumbotron = ({ title, subTitle }: Props) => {
  return (
    <section className="py-10 px-4 lg:px-8 bg-muted">
      <div className="container mx-auto text-center">
        <h1 className="font-montserrat text-3xl lg:text-5xl tracking-tight mb-6 font-bold md:font-medium ">
          {title}
        </h1>
        <p className="font-montserrat text-sm md:text-md lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {subTitle}
        </p>
      </div>
    </section>
  );
};
