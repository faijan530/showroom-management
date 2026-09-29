import { NextResponse } from 'next/server';

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: Record<string, unknown>;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export class ApiResponse {
  static success<T>(data: T, statusCode = 200, meta?: Record<string, unknown>) {
    const payload: ApiResponsePayload<T> = {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    };
    return NextResponse.json(payload, {
      status: statusCode,
      headers: CORS_HEADERS,
    });
  }

  static error(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details?: unknown) {
    const payload: ApiResponsePayload = {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    };
    return NextResponse.json(payload, {
      status: statusCode,
      headers: CORS_HEADERS,
    });
  }
}
