import { User, Landmark } from "lucide-react";
import type { TitularCtaCooperativaDashboard } from "@/interfaces/dashboard.response";

const ActivityFeed = ({
  nombre,
  nomBanco,
  ctaBancariaCooperativa,
}: TitularCtaCooperativaDashboard) => {
  const activities = [
    {
      icon: User,
      title: "Titular",
      description: nombre,
      time: "10/02/2026",
      color: "bg-blue-500",
    },
    {
      icon: Landmark,
      title: "Numero de Cuenta",
      description: `${nomBanco} - ${ctaBancariaCooperativa}`,
      time: "10/02/2026",
      color: "bg-green-500",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Datos de la Cuenta Bancaria
      </h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={index} className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${activity.color}`}>
                <Icon size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600">{activity.description}</p>
                {/* <p className="text-xs text-gray-500 mt-1">{activity.time}</p> */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;
