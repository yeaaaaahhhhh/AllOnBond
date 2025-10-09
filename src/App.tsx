import { useState } from 'react';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import TabNavigation from './components/Layout/TabNavigation';
import type { TabType } from './components/Layout/TabNavigation';
import Calculator from './pages/Calculator';
import Comparison from './pages/Comparison';
import Info from './pages/Info';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('calculator');

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto flex-1 px-4 py-8">
        {activeTab === 'calculator' && <Calculator />}
        {activeTab === 'comparison' && <Comparison />}
        {activeTab === 'info' && <Info />}
      </main>
      <Footer />
    </div>
  );
}

export default App;
