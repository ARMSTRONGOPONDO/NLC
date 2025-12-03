
import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Map, 
  Users, 
  Gavel, 
  Banknote, 
  Settings, 
  LogOut,
  Activity
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentRole: UserRole;
  onChangePage: (page: string) => void;
  activePage: string;
  onLogout: () => void;
  onSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentRole, onChangePage, activePage, onLogout, onSettings }) => {
  const getMenuItems = () => {
    // Basic items for everyone
    const items = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'requests', label: 'Acquisition Requests', icon: FileText },
    ];

    if ([UserRole.VALUATION_TEAM, UserRole.DIRECTOR_VALUATION].includes(currentRole)) {
      items.push({ id: 'market-data', label: 'Market Research', icon: Activity });
      items.push({ id: 'valuation', label: 'Valuation & Inquiry', icon: Map });
    }

    if ([UserRole.LEGAL_TEAM, UserRole.NLCC_CHAIRMAN, UserRole.GOVT_PRINTER].includes(currentRole)) {
      items.push({ id: 'gazettes', label: 'Gazette Notices', icon: Gavel });
    }

    if ([UserRole.FINANCE, UserRole.ACQUIRING_BODY].includes(currentRole)) {
      items.push({ id: 'payments', label: 'Payments', icon: Banknote });
    }

    if (currentRole === UserRole.INTERESTED_PARTY) {
      items.push({ id: 'claims', label: 'My Claims', icon: Users });
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-20">
      <div className="p-6 border-b border-slate-700 flex items-center gap-3">
        <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center font-bold text-slate-900">
          NLC
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">LandCom</h1>
          <p className="text-xs text-slate-400 font-medium opacity-80">Acquisition System</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangePage(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activePage === item.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button 
          onClick={onSettings}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activePage === 'settings' 
              ? 'bg-slate-800 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings size={20} />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition-colors mt-1"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
