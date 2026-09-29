'use client';

import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Bike, Car, Plus, Wrench, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CustomerVehicle {
  id: string;
  title: string;
  vehicle_type: 'BIKE' | 'CAR';
  reg_number: string;
  brand: string;
  model: string;
  year: number;
  created_at: string;
}

interface CustomerVehiclesResponse {
  success: boolean;
  data: { vehicles: CustomerVehicle[] };
}

export default function CustomerGaragePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [vehicleType, setVehicleType] = useState<'BIKE' | 'CAR'>('BIKE');
  const [regNumber, setRegNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2026);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<CustomerVehiclesResponse>({
    queryKey: ['customer-vehicles-garage'],
    queryFn: () => apiClient<CustomerVehiclesResponse>('/customer/vehicles'),
  });

  const vehicles = data?.data?.vehicles || [];

  // Add Vehicle Mutation
  const addVehicleMutation = useMutation({
    mutationFn: (body: any) => apiClient('/customer/vehicles', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast('success', 'Vehicle added to your garage!');
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['customer-vehicles-garage'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to add vehicle'),
  });

  const resetForm = () => {
    setTitle('');
    setVehicleType('BIKE');
    setRegNumber('');
    setBrand('');
    setModel('');
    setYear(2026);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVehicleMutation.mutate({
      title,
      vehicle_type: vehicleType,
      reg_number: regNumber,
      brand,
      model,
      year: Number(year),
    });
  };

  return (
    <PageWrapper
      title="My Garage & Vehicle List"
      description="Manage your registered motorcycles and cars to quickly book service appointments."
      action={
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Register New Vehicle
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-3 p-12 text-center border border-dashed border-gray-800 rounded-xl space-y-2">
              <Bike className="w-8 h-8 text-gray-600 mx-auto animate-pulse" />
              <p className="text-sm font-semibold text-gray-300">Loading your garage...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="col-span-3 p-12 text-center border border-dashed border-gray-800 rounded-xl space-y-2">
              <Bike className="w-8 h-8 text-gray-600 mx-auto" />
              <p className="text-sm font-semibold text-gray-300">Your Garage is Empty</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Register your bike or car to enable instant 1-click service bookings.
              </p>
            </div>
          ) : (
            vehicles.map((v) => (
              <Card glass key={v.id} className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={v.vehicle_type === 'BIKE' ? 'info' : 'warning'}>{v.vehicle_type}</Badge>
                    <span className="text-xs font-mono text-gray-400 font-bold">{v.reg_number}</span>
                  </div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {v.vehicle_type === 'BIKE' ? <Bike className="w-5 h-5 text-blue-400" /> : <Car className="w-5 h-5 text-indigo-400" />}
                    <span>{v.title}</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-400">
                    {v.brand} • {v.model} ({v.year})
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <Link href={`/customer/services/request`}>
                    <Button variant="secondary" size="sm" className="w-full">
                      <Wrench className="w-3.5 h-3.5 mr-1" /> Book Service for this Vehicle
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Vehicle to My Garage">
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <span>Bike / Scooter</span>
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
            label="Vehicle Display Title"
            placeholder="TVS Apache RTR 200 4V"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Registration Number"
            placeholder="UP32 AB 1234"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Brand"
              placeholder="TVS / Hero"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
            <Input
              label="Model"
              placeholder="Apache / Splendor"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
            <Input
              label="Year"
              type="number"
              placeholder="2026"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={addVehicleMutation.isPending}>
              Register Vehicle
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
