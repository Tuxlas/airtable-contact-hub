
import { PropsWithChildren } from "react";
import BottomNavigation from "./BottomNavigation";

interface MainLayoutProps extends PropsWithChildren {
  title?: string;
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {title && (
        <div className="bg-primary text-text-light p-4">
          <h1 className="text-xl font-medium text-center">{title}</h1>
        </div>
      )}
      <div className="flex-1 p-4 pb-24">{children}</div>
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
