
import { Link, useLocation } from "react-router-dom";
import { User, Building, QrCode, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      icon: User,
      label: "Contactos",
      path: "/contacts",
      active: currentPath.startsWith("/contacts"),
    },
    {
      icon: QrCode,
      label: "Mi vCard",
      path: "/vcard",
      active: currentPath.startsWith("/vcard"),
    },
    {
      icon: Building,
      label: "Empresas",
      path: "/companies",
      active: currentPath.startsWith("/companies"),
    },
    {
      icon: BarChart3,
      label: "Dashboard",
      path: "/dashboard",
      active: currentPath.startsWith("/dashboard"),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-10">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "flex flex-col items-center px-3 py-2 rounded-md transition-colors",
            item.active
              ? "text-primary"
              : "text-text-body hover:text-primary"
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
