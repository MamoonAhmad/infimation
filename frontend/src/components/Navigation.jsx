import { useState } from "react";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";

export function Navigation({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-10 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shadow-lg"
            size="icon"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <h1 className="text-lg font-semibold text-gray-800">Workflow Editor</h1>
        </div>
        
        {/* Toolbar area - children will be rendered here */}
        <div className="flex items-center space-x-2">
          {children}
        </div>
      </div>

      {/* Sidebar Menu */}
      <div className={`absolute top-0 left-0 h-full bg-white shadow-lg z-10 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="w-64 h-full flex flex-col">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Menu</h2>
            <Button
              onClick={() => setSidebarOpen(false)}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Menu content */}
          <div className="flex-1 p-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Use the toolbar above to access workflow tools and actions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 