import React from 'react';
import { LayoutDashboard, Key, BarChart3, Receipt, Settings } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 p-6 border-r border-gray-700">
                <div className="text-xl font-bold mb-10 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">G</div>
                    <span>Gateway</span>
                </div>
                <nav className="space-y-4">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                    <NavItem icon={<Key size={20} />} label="API Keys" />
                    <NavItem icon={<BarChart3 size={20} />} label="Analytics" />
                    <NavItem icon={<Receipt size={20} />} label="Billing" />
                    <div className="pt-10 border-t border-gray-700 mt-10">
                        <NavItem icon={<Settings size={20} />} label="Settings" />
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-10">
                <header className="mb-10 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold">API Management</h1>
                    <div className="flex items-center gap-4">
                        <div className="bg-gray-800 px-4 py-2 rounded-full border border-gray-700 text-sm">
                            Account ID: enterprise_01
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center uppercase font-bold text-sm">
                            JD
                        </div>
                    </div>
                </header>
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-2xl">
                    {children}
                </div>
            </main>
        </div>
    );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean }> = ({ icon, label, active }) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`}>
        {icon}
        <span className="font-medium">{label}</span>
    </div>
);

export default Layout;
