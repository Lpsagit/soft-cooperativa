import type { LucideIcon } from "lucide-react";

type ProfileFieldProps = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export const ProfileField = ({
  label,
  value,
  icon: Icon,
}: ProfileFieldProps) => {
  return (
    <div className="relative rounded-2xl border border-gray-300 bg-white px-5 pt-6 pb-4">
      <span className="absolute -top-2 left-4 bg-white px-2 text-xs ">
        {label}
      </span>

      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700">
          <Icon size={20} />
        </div>

        <p className="flex-1 truncate font-medium text-blue-papelera">
          {value}
        </p>
      </div>
    </div>
  );
};
