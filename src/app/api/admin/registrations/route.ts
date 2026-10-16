import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import {
  getRegistrations,
  getRegistrationStats,
  updateRegistrationStatus,
  deleteRegistration,
  recordAuditLog,
} from '@/lib/db';
import { RegistrationStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const college = searchParams.get('college') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;

    const [data, stats] = await Promise.all([
      getRegistrations({ search, status, college, limit, offset }),
      getRegistrationStats(),
    ]);

    return NextResponse.json({
      success: true,
      registrations: data.registrations,
      total: data.total,
      page,
      limit,
      totalPages: Math.ceil(data.total / limit),
      stats,
    });
  } catch (error: unknown) {
    console.error('[Admin Registrations GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and new status are required' }, { status: 400 });
    }

    const validStatuses: RegistrationStatus[] = ['confirmed', 'pending_payment', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid registration status value' }, { status: 400 });
    }

    const success = await updateRegistrationStatus(id, status);
    if (!success) {
      return NextResponse.json({ error: 'Registration record not found' }, { status: 404 });
    }

    await recordAuditLog({
      admin_id: session.id,
      admin_email: session.email,
      action: 'UPDATE_REGISTRATION_STATUS',
      target: id,
      metadata: { newStatus: status },
    });

    return NextResponse.json({ success: true, message: 'Status updated successfully' });
  } catch (error: unknown) {
    console.error('[Admin Registrations PATCH Error]:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    if (session.role === 'VIEWER') {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to delete records' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    const success = await deleteRegistration(id);
    if (!success) {
      return NextResponse.json({ error: 'Record not found or already removed' }, { status: 404 });
    }

    await recordAuditLog({
      admin_id: session.id,
      admin_email: session.email,
      action: 'DELETE_REGISTRATION',
      target: id,
    });

    return NextResponse.json({ success: true, message: 'Registration deleted successfully' });
  } catch (error: unknown) {
    console.error('[Admin Registrations DELETE Error]:', error);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}
