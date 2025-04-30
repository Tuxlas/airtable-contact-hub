
import { PropsWithChildren } from "react";
import BottomNavigation from "./BottomNavigation";

interface MainLayoutProps extends PropsWithChildren {
  title?: string;
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {title && (
        <div className="p-5 border-b">
          <h1 className="text-2xl font-bold text-text-title">{title}</h1>
        </div>
      )}
      <div className="flex-1 p-4 pb-24">{children}</div>
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
