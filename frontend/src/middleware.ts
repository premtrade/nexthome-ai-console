// Production-Grade Middleware for Security, Rate Limiting, and CORS
// File: frontend/src/middleware.ts

import { NextRequest, NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMITING IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIp(request: NextRequest): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        request.headers.get('cf-connecting-ip') ||
        'unknown'
    );
}

function checkRateLimit(clientId: string, windowMs = 60000, maxRequests = 100): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(clientId);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (record.count >= maxRequests) {
        return false;
    }

    record.count++;
    return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECURITY HEADERS
// ═══════════════════════════════════════════════════════════════════════════

function applySecurityHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    response.headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net", // unsafe-* needed for React dev/Recharts, consider removing in prod
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https:",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' http://localhost:* https://",
            "frame-ancestors 'none'",
            "form-action 'self'",
            "base-uri 'self'"
        ].join('; ')
    );

    // HSTS (HTTP Strict Transport Security)
    response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
    );

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY');

    // Enable XSS protection
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy (formerly Feature-Policy)
    response.headers.set(
        'Permissions-Policy',
        [
            'geolocation=()',
            'microphone=()',
            'camera=()',
            'payment=()',
            'usb=()',
            'magnetometer=()',
            'gyroscope=()',
            'accelerometer=()'
        ].join(', ')
    );

    return response;
}

// ═══════════════════════════════════════════════════════════════════════════
// CORS HANDLING
// ═══════════════════════════════════════════════════════════════════════════

function getCorsHeaders(origin: string | null): Record<string, string> {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3002', 'http://localhost:3001'];
    const normalizedOrigin = origin?.toLowerCase() || '';
    const isAllowed = allowedOrigins.some(allowed => normalizedOrigin === allowed.toLowerCase());

    return {
        'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : '',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
    };
}

function handleCors(request: NextRequest): NextResponse | null {
    if (request.method === 'OPTIONS') {
        const origin = request.headers.get('origin');
        const corsHeaders = getCorsHeaders(origin);
        return new NextResponse(null, {
            status: 204,
            headers: corsHeaders
        });
    }
    return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// REQUEST VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

function validateRequest(request: NextRequest): { valid: boolean; error?: string } {
    // Check for suspicious patterns
    const url = request.nextUrl.pathname + request.nextUrl.search;
    
    // SQL injection patterns
    const sqlInjectionPatterns = [
        /union.*select/i,
        /'; *drop/i,
        /'; *delete/i,
        /'; *update/i,
        /\/\*.*\*\//,
        /xp_/i,
        /sp_/i
    ];

    for (const pattern of sqlInjectionPatterns) {
        if (pattern.test(url)) {
            return { valid: false, error: 'Suspicious request detected' };
        }
    }

    return { valid: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// REQUEST LOGGING
// ═══════════════════════════════════════════════════════════════════════════

function logRequest(request: NextRequest, statusCode: number, duration: number) {
    if (process.env.ENABLE_REQUEST_LOGGING !== 'true') return;

    const logData = {
        timestamp: new Date().toISOString(),
        method: request.method,
        path: request.nextUrl.pathname,
        ip: getClientIp(request),
        userAgent: request.headers.get('user-agent'),
        statusCode,
        duration: `${duration}ms`,
        protocol: request.headers.get('x-forwarded-proto') || 'http'
    };

    // In production, send to a logging service
    console.log('[API Request]', JSON.stringify(logData));
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════

export async function middleware(request: NextRequest) {
    const startTime = Date.now();
    const clientIp = getClientIp(request);
    const origin = request.headers.get('origin');

    // 1. Handle CORS
    const corsResponse = handleCors(request);
    if (corsResponse) {
        return corsResponse;
    }

    // 2. Validate request
    const validation = validateRequest(request);
    if (!validation.valid) {
        const response = new NextResponse(
            JSON.stringify({ error: validation.error }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
        const corsHeaders = getCorsHeaders(origin);
        Object.entries(corsHeaders).forEach(([key, value]) => {
            if (value) response.headers.set(key, value);
        });
        return response;
    }

    // 3. Rate limiting for API routes (not applied to static assets or HTML)
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
        const rateLimitMaxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
        
        if (!checkRateLimit(clientIp, rateLimitWindowMs, rateLimitMaxRequests)) {
            const response = new NextResponse(
                JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
            logRequest(request, 429, Date.now() - startTime);
            return response;
        }
    }

    // 4. Create response (pass through to Next.js)
    const response = NextResponse.next();

    // 5. Apply security headers
    const secureResponse = applySecurityHeaders(response);

    // 6. Apply CORS headers
    const corsHeaders = getCorsHeaders(origin);
    Object.entries(corsHeaders).forEach(([key, value]) => {
        if (value) secureResponse.headers.set(key, value);
    });

    // 7. Log request
    const duration = Date.now() - startTime;
    logRequest(request, 200, duration);

    return secureResponse;
}

// Configure which routes the middleware applies to
export const config = {
    matcher: [
        // Apply to API routes and pages
        // Exclude Next.js internals and static assets
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ]
};
