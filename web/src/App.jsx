import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import BatchProcess from './components/BatchProcess';
import History from './components/History';
import { useBatches } from './hooks/useBatches';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const {
    batches,
    createBatch,
    addRawMaterial,
    addRoastingReading,
    addJaggeryReading,
    completeBatch,
    deleteBatch,
    getActiveBatch,
    getBatchAverages,
    stats,
  } = useBatches();

  const activeBatch = getActiveBatch();

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard batches={batches} stats={stats} onNavigate={setActiveView} getBatchAverages={getBatchAverages} />;
      case 'new-batch':
        return (
          <BatchProcess
            activeBatch={activeBatch}
            onCreateBatch={createBatch}
            onAddRawMaterial={addRawMaterial}
            onAddRoastingReading={addRoastingReading}
            onAddJaggeryReading={addJaggeryReading}
            onCompleteBatch={completeBatch}
            onNavigate={setActiveView}
          />
        );
      case 'history':
        return <History batches={batches} onDeleteBatch={deleteBatch} />;
      default:
        return <Dashboard batches={batches} stats={stats} onNavigate={setActiveView} getBatchAverages={getBatchAverages} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar activeView={activeView} onNavigate={setActiveView} hasActiveBatch={!!activeBatch} />
      {/* Desktop: ml-64 for sidebar. Mobile/Tablet: no margin, bottom padding for nav */}
      <main className="lg:ml-64 px-4 py-4 pb-20 lg:px-8 lg:py-8 lg:pb-8">
        <div className="max-w-6xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
