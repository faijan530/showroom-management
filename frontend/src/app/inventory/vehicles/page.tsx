'use client';

import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/data-display/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { Store, Plus, Trash2, Edit3, Bike, Car, ShieldCheck } from 'lucide-react';

interface Vehicle {
  id: string;
  showroom_id: string;
  showroom_name?: string;
  title: string;
  type: 'BIKE' | 'CAR';
  brand: string;
  model: string;
  year: number;
  price: number;
  color: string;
  engine_cc: number;
  stock_quantity: number;
  description?: string | null;
  image_url?: string | null;
  created_at: string;
}

interface VehiclesResponse {
  success: boolean;
  data: { vehicles: Vehicle[] };
}

export default function InventoryVehiclesPage() {
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'BIKE' | 'CAR'>('BIKE');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2026);
  const [price, setPrice] = useState<string>('75000');
  const [color, setColor] = useState('');
  const [engineCc, setEngineCc] = useState<string>('125');
  const [stockQuantity, setStockQuantity] = useState<string>('5');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const showroomId = user?.showroom_id;

  const { data, isLoading } = useQuery<VehiclesResponse>({
    queryKey: ['showroom-vehicles', showroomId],
    queryFn: () => apiClient<VehiclesResponse>(`/vehicles${showroomId ? `?showroom_id=${showroomId}` : ''}`),
  });

  const vehicles = data?.data?.vehicles || [];

  // Create Vehicle Mutation
  const createVehicleMutation = useMutation({
    mutationFn: (body: any) => apiClient('/vehicles', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast('success', 'Vehicle listing created successfully!');
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['showroom-vehicles'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to create vehicle listing'),
  });

  // Update Vehicle Mutation
  const updateVehicleMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      apiClient(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast('success', 'Vehicle details updated successfully!');
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['showroom-vehicles'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to update vehicle'),
  });

  // Delete Vehicle Mutation
  const deleteVehicleMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/vehicles/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast('success', 'Vehicle listing deleted!');
      queryClient.invalidateQueries({ queryKey: ['showroom-vehicles'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to delete vehicle'),
  });

  const resetForm = () => {
    setTitle('');
    setType('BIKE');
    setBrand('');
    setModel('');
    setYear(2026);
    setPrice('75000');
    setColor('');
    setEngineCc('125');
    setStockQuantity('5');
    setDescription('');
    setImageUrl('');
    setEditingVehicle(null);
  };

  const handleEditClick = (v: Vehicle) => {
    setEditingVehicle(v);
    setTitle(v.title);
    setType(v.type);
    setBrand(v.brand);
    setModel(v.model);
    setYear(v.year);
    setPrice(v.price.toString());
    setColor(v.color);
    setEngineCc(v.engine_cc.toString());
    setStockQuantity(v.stock_quantity.toString());
    setDescription(v.description || '');
    setImageUrl(v.image_url || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      title,
      type,
      brand,
      model,
      year: Number(year),
      price: Number(price),
      color,
      engine_cc: Number(engineCc),
      stock_quantity: Number(stockQuantity),
      description: description || undefined,
      image_url: imageUrl || undefined,
      showroom_id: showroomId,
    };

    if (editingVehicle) {
      updateVehicleMutation.mutate({ id: editingVehicle.id, body });
    } else {
      createVehicleMutation.mutate(body);
    }
  };

  return (
    <PageWrapper
      title="Vehicle Catalog Management"
      description="Manage showroom bikes and cars listings, technical specifications, and stock quantities."
      action={
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add New Vehicle
        </Button>
      }
    >
      <div className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle & Brand</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Specs (CC / Color / Year)</TableHead>
              <TableHead>Price (₹)</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Loading vehicle catalog...
                </TableCell>
              </TableRow>
            ) : vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No vehicles listed in catalog yet. Click &quot;Add New Vehicle&quot; to populate your showroom catalog.
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <div className="font-bold text-white flex items-center gap-2">
                      {v.type === 'BIKE' ? <Bike className="w-4 h-4 text-blue-400" /> : <Car className="w-4 h-4 text-indigo-400" />}
                      <span>{v.title}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {v.brand} • {v.model}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={v.type === 'BIKE' ? 'info' : 'warning'}>{v.type}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-300">
                    <p>{v.engine_cc} CC • {v.color}</p>
                    <p className="text-gray-500 font-mono">Year {v.year}</p>
                  </TableCell>
                  <TableCell className="font-bold text-emerald-400 font-mono">
                    ₹{v.price.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="font-bold text-gray-200">{v.stock_quantity} Units</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(v)}>
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteVehicleMutation.mutate(v.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVehicle ? 'Edit Vehicle Details' : 'Add New Vehicle to Catalog'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Vehicle Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('BIKE')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  type === 'BIKE'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>Bike / Motorcycle</span>
              </button>
              <button
                type="button"
                onClick={() => setType('CAR')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  type === 'CAR'
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
            label="Vehicle Title"
            placeholder="Hero Splendor Plus BS6 (2026 Edition)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Brand / Company"
              placeholder="Hero / Maruti"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
            <Input
              label="Model Name"
              placeholder="Splendor Plus / Fortuner"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Price (₹)"
              type="number"
              placeholder="78000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label="Engine CC"
              type="number"
              placeholder="125"
              value={engineCc}
              onChange={(e) => setEngineCc(e.target.value)}
              required
            />
            <Input
              label="Stock Quantity"
              type="number"
              placeholder="5"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Color"
              placeholder="Black & Accent Red"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
            />
            <Input
              label="Model Year"
              type="number"
              placeholder="2026"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
            />
          </div>

          <Input
            label="Image URL (Optional)"
            placeholder="https://images.unsplash.com/photo-..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Description (Optional)
            </label>
            <textarea
              className="w-full px-3.5 py-2 text-sm bg-gray-900/80 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              rows={3}
              placeholder="Fuel efficient city commuter bike with i3S technology..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={createVehicleMutation.isPending || updateVehicleMutation.isPending}
            >
              {editingVehicle ? 'Save Changes' : 'Create Vehicle Listing'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
