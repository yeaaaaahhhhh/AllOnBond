import { Calculator, BarChart3, Info } from 'lucide-react';

export type TabType = 'calculator' | 'comparison' | 'info';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    {
      id: 'calculator' as TabType,
      label: '계산기',
      icon: Calculator,
      description: '채권 수익률 계산',
    },
    {
      id: 'comparison' as TabType,
      label: '채권 비교',
      icon: BarChart3,
      description: '실시간 채권 비교',
    },
    {
      id: 'info' as TabType,
      label: '계산 설명',
      icon: Info,
      description: '수식 및 계산 과정',
    },
  ];

  return (
    <div className="border-b bg-white">
      <div className="container mx-auto px-4">
        <nav className="flex gap-1" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`-mb-px flex items-center gap-2 border-b-2 px-6 py-4 font-medium transition-colors ${
                  isActive
                    ? 'border-primary-500 text-primary-700 bg-primary-50'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } `}
              >
                <Icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="text-sm font-semibold">{tab.label}</div>
                  <div className="text-xs opacity-75">{tab.description}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
