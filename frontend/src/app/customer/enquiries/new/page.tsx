'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { MessageSquare, Store, Send, Package, Bike, Wrench, Radio } from 'lucide-react';

interface Showroom {
  id: string;
  name: string;
  code: string;
  address: string;
}

interface ShowroomsResponse {
  success: boolean;
  data: { showrooms: Showroom[] };
}

export default function CustomerNewEnquiryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [enquiryType, setEnquiryType] = useState<'GENERAL' | 'VEHICLE_PURCHASE' | 'SPARE_PART_PURCHASE' | 'SERVICE_INQUIRY'>('SPARE_PART_PURCHASE');
  const [targetShowroomId, setTargetShowroomId] = useState('');
  const [broadcastToAll, setBroadcastToAll] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch active showrooms
  const { data: showroomData, isLoading: isShowroomsLoading } = useQuery<ShowroomsResponse>({
    queryKey: ['public-showrooms-list'],
    queryFn: () => apiClient<ShowroomsResponse>('/superadmin/showrooms'),
  });

  const showrooms = showroomData?.data?.showrooms || [];

  useEffect(() => {
    if (user) {
      if (!customerName && user.full_name) setCustomerName(user.full_name);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
      if (!customerEmail && user.email) setCustomerEmail(user.email);
    }
  }, [user, customerName, customerPhone, customerEmail]);

  useEffect(() => {
    if (showrooms.length > 0 && !targetShowroomId && !broadcastToAll) {
      setTargetShowroomId(showrooms[0].id);
    }
  }, [showrooms, targetShowroomId, broadcastToAll]);

  // Submit Mutation
  const createEnquiryMutation = useMutation({
    mutationFn: (body: any) =>
      apiClient('/enquiries', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast('success', 'Enquiry / Part availability query submitted successfully!');
      router.push('/customer/enquiries');
    },
    onError: (err: any) => toast('error', err.message || 'Failed to submit enquiry'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast('error', 'Please enter your full name');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast('error', 'Please enter a valid 10-digit phone number');
      return;
    }
    if (!message.trim() || message.trim().length < 5) {
      toast('error', 'Message must be at least 5 characters');
      return;
    }
    if (!broadcastToAll && !targetShowroomId) {
      toast('error', 'Please select a showroom or broadcast to all');
      return;
    }

    createEnquiryMutation.mutate({
      customer_name: customerName,
      customer_phone: cleanPhone,
      customer_email: customerEmail || undefined,
      enquiry_type: enquiryType,
      message,
      target_showroom_id: broadcastToAll ? undefined : targetShowroomId,
      broadcast_to_all: broadcastToAll,
    });
  };

  return (
    <PageWrapper
      title="Submit Showroom Enquiry / Request Part Availability"
      description="Ask showrooms about spare part availability, vehicle stock, or general service inquiries."
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <span>Customer Query Form</span>
            </CardTitle>
            <CardDescription>
              Submit your inquiry directly to a showroom or broadcast to all registered showrooms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Enquiry Type Options */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Select Inquiry Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'SPARE_PART_PURCHASE', label: 'Spare Part Availability / Purchase', icon: Package, color: 'amber' },
                    { id: 'VEHICLE_PURCHASE', label: 'Vehicle Availability / Purchase Interest', icon: Bike, color: 'blue' },
                    { id: 'SERVICE_INQUIRY', label: 'Service & Repair Inquiry', icon: Wrench, color: 'indigo' },
                    { id: 'GENERAL', label: 'General Showroom Inquiry', icon: MessageSquare, color: 'emerald' },
                  ].map((type) => {
                    const Icon = type.icon;
                    const isSelected = enquiryType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setEnquiryType(type.id as any)}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                            : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-gray-500'}`} />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Showroom Selection */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Target Showroom
                </label>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/80 border border-gray-800">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={broadcastToAll}
                      onChange={(e) => setBroadcastToAll(e.target.checked)}
                      className="rounded border-gray-800 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Broadcast enquiry to ALL registered showrooms</span>
                  </label>
                </div>

                {!broadcastToAll && (
                  <select
                    value={targetShowroomId}
                    onChange={(e) => setTargetShowroomId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-900 border border-gray-800 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {isShowroomsLoading ? (
                      <option value="">Loading showrooms...</option>
                    ) : (
                      showrooms.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code}) — {s.address}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>

              {/* Customer Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Input
                  label="Your Full Name"
                  placeholder="Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
                <Input
                  label="Phone Number"
                  placeholder="9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Email Address (Optional)"
                type="email"
                placeholder="rahul@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />

              {/* Message Details */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Query / Required Part & Stock Details
                </label>
                <textarea
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  rows={4}
                  placeholder="e.g. Please check if Hero Splendor Brake Pads (Part #BP12) are available in stock..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={createEnquiryMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-1.5" /> Submit Inquiry
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
