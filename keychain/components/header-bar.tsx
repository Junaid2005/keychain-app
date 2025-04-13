import React from "react";
import { Separator } from "@/components/ui/separator";

type HeaderBarProps = {
  leftItems?: React.ReactNode[]; 
  rightItems?: React.ReactNode[];
};

const HeaderBar: React.FC<HeaderBarProps> = ({ leftItems = [], rightItems = [] }) => {
  return (
    <div className="fixed top-0 left-0 w-full p-4 z-50">
      <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-4">
          {leftItems.map((item, index) => (
            <React.Fragment key={index}>
              {item}
              {index !== leftItems.length - 1 && (
                <div className="h-6 w-px bg-gray-900 dark:bg-gray-100 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex space-x-4">{rightItems}</div> {/* Right items */}
      </div>
    </div>
  );
};

export default HeaderBar;
