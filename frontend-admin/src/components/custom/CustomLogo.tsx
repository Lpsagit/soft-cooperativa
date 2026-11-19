import { Link } from "react-router";

export const CustomLogo = () => {
  return (
    <Link to="/" className="flex items-center whitespace-nowrap">
      <div className="flex items-center space-x-4">
        <img className="w-36 " src="/cooperativa/admin_coop/lpsa4.png" alt="" />
      </div>
    </Link>
  );
};
