'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { Bike, Car, Calendar, Clock, CheckCircle2, Store, ArrowRight, ArrowLeft, ShieldCheck, Wrench } from 'lucide-react';

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
  vehicle_type: 'BIKE' | 'CAR';
  reg_number: string;
}

interface CustomerVehiclesResponse {
  success: boolean;
  data: { vehicles: CustomerVehicle[] };
}

export default function CustomerServiceRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTitle = searchParams.get('service_title') || '';

  const { user } = useAuthStore();
  const { toast } = useToast();

  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedShowroomId, setSelectedShowroomId] = useState('');
  const [vehicleType, setVehicleType] = useState<'BIKE' | 'CAR'>('BIKE');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [serviceDescription, setServiceDescription] = useState(
    initialTitle ? `Booking Package: ${initialTitle}` : ''
  );
  const [preferredDate, setPreferredDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 11:00 AM');
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState('');

  // Fetch Showrooms
  const { data: showroomData } = useQuery<ShowroomsResponse>({
    queryKey: ['public-showrooms-list'],
    queryFn: () => apiClient<ShowroomsResponse>('/superadmin/showrooms'),
  });

  // Fetch Customer Vehicles
  const { data: vehicleData } = useQuery<CustomerVehiclesResponse>({
    queryKey: ['customer-vehicles-list'],
    queryFn: () => apiClient<CustomerVehiclesResponse>('/customer/vehicles'),
    enabled: !!user,
  });

  const showrooms = showroomData?.data?.showrooms || [];
  const customerVehicles = vehicleData?.data?.vehicles || [];

  useEffect(() => {
    if (showrooms.length > 0 && !selectedShowroomId) {
      setSelectedShowroomId(showrooms[0].id);
    }
  }, [showrooms, selectedShowroomId]);

  const handleSelectGarageVehicle = (v: CustomerVehicle) => {
    setSelectedVehicleId(v.id);
    setVehicleType(v.vehicle_type);
    setVehicleDetails(`${v.title} (${v.reg_number})`);
  };

  // Submit Mutation
  const submitRequestMutation = useMutation({
    mutationFn: (body: any) =>
      apiClient('/customer/service-requests', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: (res: any) => {
      toast('success', 'Service booking request submitted successfully!');
      const newId = res.data.service_request.id;
      router.push(`/customer/services/requests/${newId}`);
    },
    onError: (err: any) => toast('error', err.message || 'Failed to submit service booking'),
  });

  const handleSubmit = () => {
    if (!selectedShowroomId) {
      toast('error', 'Please select a showroom');
      return;
    }
    if (!vehicleDetails) {
      toast('error', 'Please provide vehicle details');
      return;
    }
    if (!serviceDescription) {
      toast('error', 'Please describe the service required');
      return;
    }

    submitRequestMutation.mutate({
      target_showroom_id: selectedShowroomId,
      customer_vehicle_id: selectedVehicleId || undefined,
      vehicle_type: vehicleType,
      vehicle_details: vehicleDetails,
      service_description: serviceDescription,
      preferred_date: preferredDate || undefined,
      time_slot: timeSlot,
    });
  };

  return (
    <PageWrapper
      title="Book a Vehicle Service Appointment"
      description="Follow our simple multi-step wizard to choose your vehicle, service needs, and preferred time slot."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
          {[
            { num: 1, label: 'Showroom & Vehicle' },
            { num: 2, label: 'Service Need' },
            { num: 3, label: 'Date & Time' },
            { num: 4, label: 'Review & Confirm' },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-2.5 rounded-xl border transition-all ${
                step === s.num
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                  : step > s.num
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-gray-900 border-gray-800 text-gray-500'
              }`}
            >
              <div className="font-bold">Step {s.num}</div>
              <div className="text-[11px] truncate">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Wizard Form Cards */}
        <Card glass>
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Store className="w-5 h-5 text-blue-400" />
                  <span>Step 1: Select Showroom & Vehicle</span>
                </CardTitle>
                <CardDescription>Choose target servicing showroom and vehicle details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Select Servicing Showroom Location
                  </label>
                  <select
                    value={selectedShowroomId}
                    onChange={(e) => setSelectedShowroomId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-900 border border-gray-800 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {showrooms.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}) — {s.address}
                      </option>
                    ))}
                  </select>
                </div>

                {customerVehicles.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Pick from My Saved Vehicles
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {customerVehicles.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleSelectGarageVehicle(v)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-3 ${
                            selectedVehicleId === v.id
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                              : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          {v.vehicle_type === 'BIKE' ? <Bike className="w-4 h-4 text-blue-400 shrink-0" /> : <Car className="w-4 h-4 text-indigo-400 shrink-0" />}
                          <div>
                            <p className="font-bold text-gray-200">{v.title}</p>
                            <p className="text-[11px] font-mono text-gray-400">{v.reg_number}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Vehicle Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVehicleType('BIKE')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        vehicleType === 'BIKE'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                      <span>Bike / Motorcycle</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVehicleType('CAR')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        vehicleType === 'CAR'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Car className="w-4 h-4" />
                      <span>Car / Four-Wheeler</span>
                    </button>
                  </div>
                </div>

                <Input
                  label="Vehicle Model & Reg Number"
                  placeholder="Hero Splendor BS6 (UP32 AB 1234)"
                  value={vehicleDetails}
                  onChange={(e) => {
                    setVehicleDetails(e.target.value);
                    setSelectedVehicleId('');
                  }}
                  required
                />

                <div className="pt-4 flex justify-end">
                  <Button variant="primary" onClick={() => setStep(2)}>
                    Next: Service Need <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <span>Step 2: Describe Service Needs</span>
                </CardTitle>
                <CardDescription>Specify requested servicing package or describe issues.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Service Requirements / Issue Notes
                  </label>
                  <textarea
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-900/80 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    rows={5}
                    placeholder="Describe issues (e.g. Engine oil change, brake squeal, 50-point general servicing)..."
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                  </Button>
                  <Button variant="primary" onClick={() => setStep(3)}>
                    Next: Date & Time <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <span>Step 3: Preferred Date & Time Slot</span>
                </CardTitle>
                <CardDescription>Select preferred appointment date and time window.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Preferred Service Date"
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                />

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Preferred Time Window / Slot
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    {[
                      '09:00 AM - 11:00 AM',
                      '11:00 AM - 01:00 PM',
                      '02:00 PM - 04:00 PM',
                    ].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          setIsCustomTime(false);
                          setTimeSlot(slot);
                        }}
                        className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                          !isCustomTime && timeSlot === slot
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                            : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomTime(true);
                        const initialCustom = customTime || '10:30 AM';
                        setCustomTime(initialCustom);
                        setTimeSlot(initialCustom);
                      }}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        isCustomTime
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      ✏️ Custom Time
                    </button>
                  </div>

                  {isCustomTime && (
                    <div className="pt-2">
                      <Input
                        label="Specify Custom Preferred Time (e.g. 10:30 AM, 04:15 PM)"
                        placeholder="Enter preferred time (e.g. 10:30 AM)"
                        value={customTime}
                        onChange={(e) => {
                          setCustomTime(e.target.value);
                          setTimeSlot(e.target.value);
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(2)}>
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                  </Button>
                  <Button variant="primary" onClick={() => setStep(4)}>
                    Next: Review & Confirm <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Step 4: Review & Confirm Booking</span>
                </CardTitle>
                <CardDescription>Review appointment details before submitting.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Customer Name:</span>
                    <span className="font-bold text-white">{user?.full_name} ({user?.phone})</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Vehicle:</span>
                    <span className="font-bold text-blue-400">{vehicleDetails} ({vehicleType})</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Service Description:</span>
                    <span className="font-semibold text-gray-200">{serviceDescription}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Appointment Slot:</span>
                    <span className="font-semibold text-amber-400 font-mono">
                      {preferredDate || 'Earliest Available'} • {timeSlot}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(3)}>
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                  </Button>
                  <Button
                    variant="primary"
                    className="bg-emerald-600 hover:bg-emerald-500"
                    onClick={handleSubmit}
                    isLoading={submitRequestMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirm Service Booking
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
}
