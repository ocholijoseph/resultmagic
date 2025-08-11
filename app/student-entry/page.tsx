
'use client';

import StudentEntry from './StudentEntry';
import Header from '../../components/Header';
import TabBar from '../../components/TabBar';

export default function StudentEntryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16 pb-20">
        <StudentEntry />
      </main>
      <TabBar />
    </div>
  );
}
