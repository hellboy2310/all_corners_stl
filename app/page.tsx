'use client';

import dynamic from 'next/dynamic';

const STLEditor = dynamic(() => import('@/components/STLEditor'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="w-full h-screen bg-gray-900">
      <STLEditor />
    </div>
  );
}