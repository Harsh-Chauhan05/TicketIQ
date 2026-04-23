import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#050510] text-text-primary font-body overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-purple/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-neon-cyan/5 blur-[150px] rounded-full" />
      </div>

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col relative z-10 w-full min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent relative custom-scrollbar">
          <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
      
    </div>
  );
};

export default AppLayout;
