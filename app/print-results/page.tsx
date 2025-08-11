
'use client';

import PrintResults from './PrintResults';
import Header from '../../components/Header';
import TabBar from '../../components/TabBar';

export default function PrintResultsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16 pb-20">
        <PrintResults />
      </main>
      <TabBar />
    </div>
  );
}
