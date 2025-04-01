
import React from 'react';
import InventoryTurnoverCalculator from '../components/InventoryTurnoverCalculator';

const Index = () => {
  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-4">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-dark-green mb-3">Retail Insights Visualizer</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional tools for retail and e-commerce businesses to analyze key performance metrics
          </p>
        </header>

        <main>
          <InventoryTurnoverCalculator />
        </main>

        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>© 2023 Retail Insights Visualizer. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
