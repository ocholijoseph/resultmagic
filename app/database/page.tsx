'use client';

import { Suspense } from 'react';
import StudentDatabase from './StudentDatabase';
import Header from '../../components/Header';
import TabBar from '../../components/TabBar';

export default function DatabasePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16 pb-20">
        <Suspense fallback={<div className="p-4 text-center">Loading database...</div>}>
          <StudentDatabase />
        </Suspense>
      </main>
      <TabBar />
    </div>
  );
}
