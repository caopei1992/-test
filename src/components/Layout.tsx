import React, { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  BrainCircuit, 
  Settings, 
  Database, 
  BarChart3, 
  FolderOpen, 
  Menu, 
  X,
  Search,
  Bell,
  User,
  ChevronRight,
  Sparkles,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  
  const handleClick = (e: React.MouseEvent) => {
    if (to.includes('#')) {
      const [path, hash] = to.split('#');
      if (location.pathname === path || (path === '' && location.pathname === '/projects')) {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  // Determine if active. For hash links, we don't want them to be permanently "active" just because we are on /projects
  // Actually, let's just use standard NavLink behavior, but maybe custom active logic if needed.
  // For simplicity, we'll let NavLink handle it, but it might highlight all of them if they all point to /projects.
  // Let's customize isActive.
  const isActiveLink = () => {
    if (to.includes('#')) {
      const [path, hash] = to.split('#');
      return location.hash === '#' + hash && location.pathname === path;
    }
    // If this link has no hash, it should be active if the current location has no hash 
    // AND the pathname starts with the link's path (e.g., /projects/create starts with /projects)
    return location.pathname.startsWith(to) && !location.hash;
  };

  return (
    <NavLink to={to} onClick={handleClick} className={() => 
      cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative overflow-hidden",
        isActiveLink()
          ? "bg-blue-50 text-blue-600 shadow-sm" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )
    }>
      {() => {
        const active = isActiveLink();
        return (
          <>
            <Icon className={cn("w-4 h-4 transition-colors stroke-[1.5]", active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
            <span className="relative z-10">{label}</span>
            {active && <div className="absolute inset-0 bg-blue-100/30 opacity-0 group-hover:opacity-100 transition-opacity" />}
          </>
        );
      }}
    </NavLink>
  );
};

export const Layout = () => {
  const location = useLocation();

  const navigation = [
    { name: '首页', href: '/projects' },
    { name: '我的项目', href: '/projects/list' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900">
      {/* Top Navigation */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5 font-semibold text-base text-slate-900">
            <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <span className="tracking-tight">智策系统</span>
          </div>

          <nav className="flex items-center gap-1">
            {navigation.map((item) => (
              <NavLink 
                key={item.name} 
                to={item.href}
                className={({ isActive }) => cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-64 pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs transition duration-150 ease-in-out"
              placeholder="搜索项目、文档或知识库..."
            />
          </div>
          <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <Bell className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-200 shadow-sm">
            JD
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};
