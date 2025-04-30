
import { Link, useLocation } from "react-router-dom";
import { User, Building, QrCode, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      icon: BarChart3,
      label: "Dashboard",
      path: "/dashboard",
      active: currentPath.startsWith("/dashboard"),
    },
    {
      icon: User,
      label: "Contacts",
      path: "/contacts",
      active: currentPath.startsWith("/contacts"),
    },
    {
      icon: QrCode,
      label: "My Card",
      path: "/vcard",
      active: currentPath.startsWith("/vcard"),
    },
    {
      icon: Building,
      label: "Companies",
      path: "/companies",
      active: currentPath.startsWith("/companies"),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around z-10">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "flex flex-col items-center py-2 px-4",
            item.active
              ? "text-primary"
              : "text-text-body"
          )}
        >
          <item.icon size={24} />
          <span className="text-xs mt-1">{item.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default BottomNavigation;
