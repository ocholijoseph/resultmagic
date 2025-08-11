
'use client';

import ResultGeneration from './ResultGeneration';
import Header from '../../components/Header';
import TabBar from '../../components/TabBar';

export default function ResultGenerationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16 pb-20">
        <ResultGeneration />
      </main>
      <TabBar />
    </div>
  );
}
