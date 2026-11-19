type ProfileFieldProps = {
  label: string;
  value: string;
};

export const ProfileField = ({ label, value }: ProfileFieldProps) => {
  return (
    <div className="relative rounded-2xl border border-gray-300 bg-white px-5 p-4">
      <span className="absolute -top-2 left-4 bg-white px-2 text-xs ">
        {label}
      </span>

      <div className="">
        <p className="text-center font-medium text-blue-papelera">{value}</p>
      </div>
    </div>
  );
};
