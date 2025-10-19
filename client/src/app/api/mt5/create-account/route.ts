// client/src/app/api/mt5/create-account/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      group,
      leverage = 100,
      masterPassword,
      investorPassword,
      email,
      country,
      city,
      phone,
      comment
    } = body;

    // Validate required fields
    if (!name || !group || !masterPassword || !investorPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: name, group, masterPassword, investorPassword'
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/api/mt5/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        group,
        leverage,
        masterPassword,
        investorPassword,
        email,
        country,
        city,
        phone,
        comment
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || 'Failed to create MT5 account'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error creating MT5 account:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}