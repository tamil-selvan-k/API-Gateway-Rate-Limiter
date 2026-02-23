import { useState } from 'react';
import Layout from './components/Layout';
import ApiKeysDashboard from './modules/apiKeys/ApiKeysDashboard';
import AnalyticsView from './modules/analytics/AnalyticsView';

function App() {
  const [activeTab, setActiveTab] = useState<'keys' | 'analytics'>('keys');

  return (
    <Layout>
      <div className="mb-10 flex gap-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('keys')}
          className={`pb-4 px-2 font-medium transition-all ${activeTab === 'keys' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-white'
            }`}
        >
          API Keys
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-4 px-2 font-medium transition-all ${activeTab === 'analytics' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-white'
            }`}
        >
          Analytics
        </button>
      </div>

      {activeTab === 'keys' ? <ApiKeysDashboard /> : <AnalyticsView />}
    </Layout>
  );
}

export default App;
