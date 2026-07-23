import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function POST(request: Request) {
  const session = cookies().get('inflexion_secops_session');
  if (!session) return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });

  try {
    const rawData = await request.json();
    
    const advisorSchema = z.object({
      domain: z.string().min(3),
      id: z.string().min(1),
      name: z.string().min(1),
      role: z.string().optional(),
      photoUrl: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      isDemo: z.boolean().optional()
    });

    const parsed = z.array(advisorSchema).safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Neplatná data', details: parsed.error.issues }, { status: 400 });
    }

    const advisors = parsed.data;
    
    // Použijeme Prisma transaction pro bulk upsert
    const results = await prisma.$transaction(
      advisors.map(adv => prisma.advisor.upsert({
        where: { domain: adv.domain },
        update: {
          id: adv.id,
          name: adv.name,
          role: adv.role || 'Vázaný zástupce 4fin',
          photoUrl: adv.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
          email: adv.email || '',
          phone: adv.phone || '',
          isDemo: adv.isDemo || false
        },
        create: {
          domain: adv.domain,
          id: adv.id,
          name: adv.name,
          role: adv.role || 'Vázaný zástupce 4fin',
          photoUrl: adv.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
          email: adv.email || '',
          phone: adv.phone || '',
          isDemo: adv.isDemo || false
        }
      }))
    );

    return NextResponse.json({ success: true, count: results.length, message: 'Hromadný import dokončen.' });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ error: 'Chyba při hromadném importu' }, { status: 500 });
  }
}
