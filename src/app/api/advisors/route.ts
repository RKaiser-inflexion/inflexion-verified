import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getAdvisors, addAdvisor, removeAdvisor } from '@/lib/db';

export async function GET() {
  const session = cookies().get('inflexion_secops_session');
  if (!session) return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });

  try {
    const advisors = await getAdvisors();
    return NextResponse.json(advisors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch advisors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = cookies().get('inflexion_secops_session');
  if (!session) return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });

  try {
    const rawData = await request.json();
    
    const advisorSchema = z.object({
      domain: z.string().min(3).max(100).regex(/^[a-zA-Z0-9.-]+$/),
      id: z.string().min(1).max(50),
      name: z.string().min(2).max(100),
      role: z.string().max(100).optional(),
      photoUrl: z.string().optional().or(z.literal('')),
      email: z.string().email().max(100).optional().or(z.literal('')),
      phone: z.string().max(20).optional().or(z.literal('')),
      isDemo: z.boolean().optional(),
    });

    const parsed = advisorSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Neplatná data', details: parsed.error.issues }, { status: 400 });
    }

    const data = parsed.data;
    await addAdvisor(data.domain, { 
      id: data.id, 
      name: data.name, 
      role: data.role || '', 
      photoUrl: data.photoUrl || '', 
      email: data.email || '', 
      phone: data.phone || '', 
      isDemo: data.isDemo 
    });

    return NextResponse.json({ success: true, message: 'Poradce byl úspěšně zaregistrován.' });
  } catch (error) {
    return NextResponse.json({ error: 'Chyba při registraci' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = cookies().get('inflexion_secops_session');
  if (!session) return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });

  try {
    const data = await request.json();
    const { domain } = data;

    if (!domain) {
      return NextResponse.json({ error: 'Chybí doména' }, { status: 400 });
    }

    await removeAdvisor(domain);

    return NextResponse.json({ success: true, message: 'Doména odstraněna.' });
  } catch (error) {
    return NextResponse.json({ error: 'Chyba při odstraňování' }, { status: 500 });
  }
}
