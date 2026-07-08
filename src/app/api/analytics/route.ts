import { NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/db';

export async function GET() {
  const analyticsData = await getAnalytics();
  
  // Připravíme data pro Recharts - pole za posledních 30 dní
  const data = [];
  const today = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    data.push({
      date: date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' }),
      calls: analyticsData[dateString] || 0
    });
  }

  return NextResponse.json(data);
}
