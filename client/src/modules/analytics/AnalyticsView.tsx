import React from 'react';
import { Activity, Zap, ShieldAlert, BarChart } from 'lucide-react';

const AnalyticsView: React.FC = () => {
    return (
        <section>
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-1">Global Traffic</h2>
                <p className="text-gray-400 text-sm">Real-time usage analytics for your API Gateway.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard icon={<Activity className="text-blue-400" />} label="Total Requests" value="1.2M" delta="+12%" />
                <StatCard icon={<Zap className="text-yellow-400" />} label="Avg Latency" value="45ms" delta="-5ms" />
                <StatCard icon={<ShieldAlert className="text-red-400" />} label="Blocked" value="2.4k" delta="+3%" />
                <StatCard icon={<BarChart className="text-green-400" />} label="Reliability" value="99.9%" delta="0%" />
            </div>

            <div className="bg-gray-700/20 rounded-2xl border border-gray-700 p-10 flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 mb-6">
                    <BarChart size={32} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Usage Graphs</h3>
                <p className="text-gray-500 max-w-sm">Detailed visualization of request rates and rate limiting events will be displayed here.</p>
                <div className="flex gap-2 mt-8">
                    {[40, 70, 45, 90, 65, 80, 55, 95, 60, 85].map((h, i) => (
                        <div key={i} className="w-4 bg-blue-600/40 rounded-t" style={{ height: `${h}px` }} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; delta: string }> = ({ icon, label, value, delta }) => (
    <div className="bg-gray-700/30 p-6 rounded-2xl border border-gray-700 shadow-lg">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gray-800 rounded-xl border border-gray-700">{icon}</div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${delta.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {delta}
            </span>
        </div>
        <div className="text-sm text-gray-400 font-medium mb-1">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
    </div>
);

export default AnalyticsView;
