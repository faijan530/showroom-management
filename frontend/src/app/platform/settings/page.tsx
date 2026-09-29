'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Server, Key, Lock, Globe } from 'lucide-react';

export default function PlatformSettingsPage() {
  return (
    <PageWrapper
      title="Platform Settings & System Status"
      description="Global architecture configuration, security parameters, and platform health telemetry."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card glass className="border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <SecurityIcon className="w-5 h-5 text-rose-400" />
                Authentication & Security Configuration
              </CardTitle>
              <CardDescription>System-wide session and cryptographic controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400 flex items-center gap-2">
                  <Key className="w-4 h-4 text-gray-500" /> Session Mechanism
                </span>
                <Badge variant="success">HttpOnly JWT Cookie</Badge>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-500" /> Primary Identifier
                </span>
                <span className="font-mono text-gray-200">10-Digit Mobile Phone</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gray-500" /> Anti-IDOR Enforcement
                </span>
                <Badge variant="success">Active (Strict tenant check)</Badge>
              </div>
            </CardContent>
          </Card>

          <Card glass className="border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Server className="w-5 h-5 text-blue-400" />
                Infrastructure & Environment
              </CardTitle>
              <CardDescription>Managed database connectivity and API runtime parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400 flex items-center gap-2">
                  <Server className="w-4 h-4 text-gray-500" /> Managed Database
                </span>
                <span className="font-mono text-gray-200">Neon Cloud PostgreSQL</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" /> CORS Allowed Origin
                </span>
                <span className="font-mono text-blue-400">http://localhost:3001</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gray-500" /> Environment Scope
                </span>
                <Badge variant="info">Development</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}

function SecurityIcon(props: any) {
  return <ShieldCheck {...props} />;
}
