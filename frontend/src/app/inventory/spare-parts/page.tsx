'use client';

import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { StatCard } from '@/components/data-display/stat-card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/data-display/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { Package, Plus, Trash2, Edit3, AlertTriangle, Search, Filter, Wrench, IndianRupee, Layers } from 'lucide-react';

interface SparePart {
  id: string;
  showroom_id: string;
  showroom_name?: string;
  part_name: string;
  part_code: string;
  category: string;
  vehicle_type: 'BIKE' | 'CAR' | 'BOTH';
  price: number;
  stock_quantity: number;
  min_stock_alert: number;
  is_low_stock: boolean;
  description?: string | null;
  image_url?: string | null;
  created_at: string;
}

interface SparePartsResponse {
  success: boolean;
  data: { spare_parts: SparePart[] };
}

export default function InventorySparePartsPage() {
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState<'ALL' | 'BIKE' | 'CAR' | 'BOTH'>('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Form state
  const [partName, setPartName] = useState('');
  const [partCode, setPartCode] = useState('');
  const [category, setCategory] = useState('General');
  const [vehicleType, setVehicleType] = useState<'BIKE' | 'CAR' | 'BOTH'>('BOTH');
  const [price, setPrice] = useState<string>('450');
  const [stockQuantity, setStockQuantity] = useState<string>('20');
  const [minStockAlert, setMinStockAlert] = useState<string>('5');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const showroomId = user?.showroom_id;

  const { data, isLoading } = useQuery<SparePartsResponse>({
    queryKey: ['showroom-spare-parts', showroomId, searchQuery, selectedVehicleType, showLowStockOnly],
    queryFn: () => {
      const params = new URLSearchParams();
      if (showroomId) params.set('showroom_id', showroomId);
      if (searchQuery) params.set('search', searchQuery);
      if (selectedVehicleType !== 'ALL') params.set('vehicle_type', selectedVehicleType);
      if (showLowStockOnly) params.set('low_stock', 'true');
      return apiClient<SparePartsResponse>(`/spare-parts?${params.toString()}`);
    },
  });

  const spareParts = data?.data?.spare_parts || [];

  const totalPartsCount = spareParts.length;
  const lowStockCount = spareParts.filter((p) => p.is_low_stock).length;
  const totalValuation = spareParts.reduce((acc, p) => acc + p.price * p.stock_quantity, 0);

  // Create Spare Part Mutation
  const createPartMutation = useMutation({
    mutationFn: (body: any) => apiClient('/spare-parts', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast('success', 'Spare part added to inventory successfully!');
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['showroom-spare-parts'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to add spare part'),
  });

  // Update Spare Part Mutation
  const updatePartMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      apiClient(`/spare-parts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast('success', 'Spare part details updated successfully!');
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['showroom-spare-parts'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to update spare part'),
  });

  // Delete Spare Part Mutation
  const deletePartMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/spare-parts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast('success', 'Spare part listing removed from inventory!');
      queryClient.invalidateQueries({ queryKey: ['showroom-spare-parts'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to delete spare part'),
  });

  const resetForm = () => {
    setPartName('');
    setPartCode('');
    setCategory('General');
    setVehicleType('BOTH');
    setPrice('450');
    setStockQuantity('20');
    setMinStockAlert('5');
    setDescription('');
    setImageUrl('');
    setEditingPart(null);
  };

  const handleEditClick = (p: SparePart) => {
    setEditingPart(p);
    setPartName(p.part_name);
    setPartCode(p.part_code);
    setCategory(p.category);
    setVehicleType(p.vehicle_type);
    setPrice(p.price.toString());
    setStockQuantity(p.stock_quantity.toString());
    setMinStockAlert(p.min_stock_alert.toString());
    setDescription(p.description || '');
    setImageUrl(p.image_url || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      part_name: partName,
      part_code: partCode,
      category,
      vehicle_type: vehicleType,
      price: Number(price),
      stock_quantity: Number(stockQuantity),
      min_stock_alert: Number(minStockAlert),
      description: description || undefined,
      image_url: imageUrl || undefined,
      showroom_id: showroomId,
    };

    if (editingPart) {
      updatePartMutation.mutate({ id: editingPart.id, body });
    } else {
      createPartMutation.mutate(body);
    }
  };

  return (
    <PageWrapper
      title="Spare Parts Inventory & Stock Control"
      description="Manage showroom replacement parts catalog, stock levels, reorder thresholds, and pricing."
      action={
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add New Spare Part
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Catalog Items"
            value={`${totalPartsCount} Parts`}
            change="Active Inventory"
            isPositive
            icon={Package}
            iconColor="text-blue-400"
          />
          <StatCard
            title="Low Stock Warning"
            value={`${lowStockCount} Items`}
            change={lowStockCount > 0 ? 'Action Needed' : 'Inventory Healthy'}
            isPositive={lowStockCount === 0}
            icon={AlertTriangle}
            iconColor={lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}
          />
          <StatCard
            title="Total Stock Valuation"
            value={`₹${totalValuation.toLocaleString('en-IN')}`}
            change="Estimated Inventory Value"
            isPositive
            icon={IndianRupee}
            iconColor="text-emerald-400"
          />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-gray-800/80 bg-gray-950/60 backdrop-blur-md">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by part name or part code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1 text-xs">
              {(['ALL', 'BIKE', 'CAR', 'BOTH'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedVehicleType(t)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    selectedVehicleType === t
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showLowStockOnly
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low Stock Only</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part & Code</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Compatibility</TableHead>
              <TableHead>Price (₹)</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Loading spare parts inventory...
                </TableCell>
              </TableRow>
            ) : spareParts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No spare parts found matching your criteria. Click &quot;Add New Spare Part&quot; to populate your inventory.
                </TableCell>
              </TableRow>
            ) : (
              spareParts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-bold text-white flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-400" />
                      <span>{p.part_name}</span>
                    </div>
                    <p className="text-xs text-blue-400 font-mono mt-0.5">{p.part_code}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral">{p.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.vehicle_type === 'BIKE'
                          ? 'info'
                          : p.vehicle_type === 'CAR'
                          ? 'warning'
                          : 'success'
                      }
                    >
                      {p.vehicle_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-emerald-400 font-mono">
                    ₹{p.price.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-200 font-mono">{p.stock_quantity} Units</span>
                      {p.is_low_stock && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">Min Alert: {p.min_stock_alert} units</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(p)}>
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deletePartMutation.mutate(p.id)}>
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

      {/* Add / Edit Spare Part Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPart ? 'Edit Spare Part Details' : 'Add New Spare Part to Inventory'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Part Name"
            placeholder="Disc Brake Pad Set (Front)"
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Part SKU / Code"
              placeholder="BP-2026-HERO"
              value={partCode}
              onChange={(e) => setPartCode(e.target.value)}
              required
            />
            <Input
              label="Category"
              placeholder="Brakes / Engine / Body"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Vehicle Compatibility
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['BIKE', 'CAR', 'BOTH'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setVehicleType(t)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    vehicleType === t
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Unit Price (₹)"
              type="number"
              placeholder="450"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label="Stock Quantity"
              type="number"
              placeholder="20"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              required
            />
            <Input
              label="Min Alert Limit"
              type="number"
              placeholder="5"
              value={minStockAlert}
              onChange={(e) => setMinStockAlert(e.target.value)}
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
              Description / Notes (Optional)
            </label>
            <textarea
              className="w-full px-3.5 py-2 text-sm bg-gray-900/80 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              rows={3}
              placeholder="Heavy-duty ceramic front brake pad compatible with Hero Splendor and Passion..."
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
              isLoading={createPartMutation.isPending || updatePartMutation.isPending}
            >
              {editingPart ? 'Save Changes' : 'Add Spare Part'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
