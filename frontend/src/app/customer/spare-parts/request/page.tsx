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
import { Package, Store, Send, Bike, Car, ArrowRight, ShieldCheck, Search } from 'lucide-react';

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

interface CustomerVehicle {
  id: string;
  title: string;
  reg_number: string;
}

interface CustomerVehiclesResponse {
  success: boolean;
  data: { vehicles: CustomerVehicle[] };
}

interface SparePart {
  id: string;
  part_name: string;
  part_code: string;
  price: number;
}

interface SparePartsResponse {
  success: boolean;
  data: { spare_parts: SparePart[] };
}

export default function CustomerSparePartRequestPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [selectedShowroomId, setSelectedShowroomId] = useState('');
  const [partName, setPartName] = useState('');
  const [selectedPartId, setSelectedPartId] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch Showrooms
  const { data: showroomData } = useQuery<ShowroomsResponse>({
    queryKey: ['public-showrooms-list'],
    queryFn: () => apiClient<ShowroomsResponse>('/superadmin/showrooms'),
  });

  // Fetch Saved Vehicles
  const { data: vehicleData } = useQuery<CustomerVehiclesResponse>({
    queryKey: ['customer-vehicles-garage'],
    queryFn: () => apiClient<CustomerVehiclesResponse>('/customer/vehicles'),
    enabled: !!user,
  });

  // Fetch Spare Parts for auto-suggest
  const { data: sparePartsData } = useQuery<SparePartsResponse>({
    queryKey: ['public-spare-parts', selectedShowroomId],
    queryFn: () => apiClient<SparePartsResponse>(`/spare-parts${selectedShowroomId ? `?showroom_id=${selectedShowroomId}` : ''}`),
  });

  const showrooms = showroomData?.data?.showrooms || [];
  const customerVehicles = vehicleData?.data?.vehicles || [];
  const availableParts = sparePartsData?.data?.spare_parts || [];

  useEffect(() => {
    if (showrooms.length > 0 && !selectedShowroomId) {
      setSelectedShowroomId(showrooms[0].id);
    }
  }, [showrooms, selectedShowroomId]);

  // Submit Mutation
  const createRequestMutation = useMutation({
    mutationFn: (body: any) =>
      apiClient('/customer/spare-part-requests', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: (res: any) => {
      toast('success', 'Spare part order request submitted successfully!');
      const newId = res.data.part_request.id;
      router.push(`/customer/spare-parts/requests/${newId}`);
    },
    onError: (err: any) => toast('error', err.message || 'Failed to submit part request'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedShowroomId) {
      toast('error', 'Please select a servicing showroom');
      return;
    }
    if (!partName.trim()) {
      toast('error', 'Please enter or select a spare part name');
      return;
    }

    createRequestMutation.mutate({
      showroom_id: selectedShowroomId,
      spare_part_id: selectedPartId || undefined,
      part_name: partName,
      quantity: Number(quantity),
      vehicle_details: vehicleDetails || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <PageWrapper
      title="Request a Spare Part"
      description="Submit a dedicated spare part request to showroom inventory managers and track order fulfillment timeline."
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5 text-amber-400" />
              <span>Spare Part Order Request Form</span>
            </CardTitle>
            <CardDescription>Specify requested spare part details, target showroom, and quantity.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Showroom Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Select Target Showroom
                </label>
                <select
                  value={selectedShowroomId}
                  onChange={(e) => setSelectedShowroomId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-900 border border-gray-800 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {showrooms.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) — {s.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Part Auto-suggest / Select */}
              {availableParts.length > 0 && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Pick from Showroom Catalog
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableParts.slice(0, 6).map((part) => (
                      <button
                        key={part.id}
                        type="button"
                        onClick={() => {
                          setSelectedPartId(part.id);
                          setPartName(part.part_name);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          selectedPartId === part.id
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white'
                        }`}
                      >
                        {part.part_name} (₹{part.price})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Part Name & Code Input */}
              <Input
                label="Spare Part Name / Code"
                placeholder="Engine Oil Filter BS6 / Brake Pads (BP12)"
                value={partName}
                onChange={(e) => {
                  setPartName(e.target.value);
                  setSelectedPartId('');
                }}
                required
              />

              {/* Quantity */}
              <Input
                label="Required Quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />

              {/* Saved Vehicle Picker */}
              {customerVehicles.length > 0 && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Pick Vehicle from My Garage (Optional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {customerVehicles.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVehicleDetails(`${v.title} (${v.reg_number})`)}
                        className="p-2.5 rounded-xl border border-gray-800 bg-gray-900 text-left text-xs hover:border-gray-700 transition-all"
                      >
                        <p className="font-bold text-gray-200">{v.title}</p>
                        <p className="text-[11px] font-mono text-gray-400">{v.reg_number}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Input
                label="Vehicle Details / Compatibility Notes"
                placeholder="Hero Splendor BS6 (UP32 AB 1234)"
                value={vehicleDetails}
                onChange={(e) => setVehicleDetails(e.target.value)}
              />

              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Additional Notes / Specific Part Requirements
                </label>
                <textarea
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  rows={3}
                  placeholder="Need genuine OEM part. Urgently required for regular service..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button variant="primary" type="submit" isLoading={createRequestMutation.isPending}>
                  <Send className="w-4 h-4 mr-1.5" /> Submit Part Order Request
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
