import React from "react";
import { DivideIcon as LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  // change: string;
  // changeType: "positive" | "negative" | "neutral";
  icon: typeof LucideIcon;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  // change,
  // changeType,
  icon: Icon,
  color,
}) => {
  // const changeColor = {
  //   positive: "text-green-600 bg-green-50",
  //   negative: "text-red-600 bg-red-50",
  //   neutral: "text-gray-600 bg-gray-50",
  // }[changeType];

  return (
    <div
      className={`${color} p-2 rounded-xl shadow-sm border  hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center">
        <div className={`flex p-3 rounded-full ${color}`}>
          <Icon size={30} className="" />
        </div>
        <div className="flex flex-col w-full justify-between px-3 py-2 gap-1">
          <p className=" text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-blue-papelera">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
