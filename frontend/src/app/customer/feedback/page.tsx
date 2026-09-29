'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Star, MessageSquare, Store, ShieldCheck, Sparkles, User } from 'lucide-react';

interface FeedbackItem {
  id: string;
  customer_display_name: string;
  showroom_name?: string;
  vehicle_details?: string;
  rating: number;
  comment?: string | null;
  admin_response?: string | null;
  created_at: string;
}

interface PublicFeedbackResponse {
  success: boolean;
  data: {
    average_rating: number;
    total_reviews: number;
    feedbacks: FeedbackItem[];
  };
}

export default function PublicShowroomFeedbackPage() {
  const { data, isLoading } = useQuery<PublicFeedbackResponse>({
    queryKey: ['public-showroom-feedbacks'],
    queryFn: () => apiClient<PublicFeedbackResponse>('/feedback'),
  });

  const feedbacks = data?.data?.feedbacks || [];
  const avgRating = data?.data?.average_rating || 5.0;
  const totalReviews = data?.data?.total_reviews || 0;

  return (
    <PageWrapper
      title="Customer Reviews & Service Feedback"
      description="Verified post-service reviews and ratings from showroom customers."
    >
      <div className="space-y-6">
        {/* Rating Overview Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-gray-900 to-indigo-950/40 border border-amber-500/20 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Authorized Showroom Reviews
            </div>
            <h2 className="text-xl font-bold text-white">Genuine Customer Satisfaction</h2>
            <p className="text-xs text-gray-300 max-w-lg leading-relaxed">
              Read transparent feedback from verified vehicle owners after completed maintenance and repair services.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 text-center min-w-[200px] space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-3xl font-extrabold text-amber-400 font-mono">{avgRating}</span>
              <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-xs font-semibold text-gray-300">Overall Service Score</p>
            <p className="text-[11px] text-gray-500 font-mono">{totalReviews} Verified Reviews</p>
          </div>
        </div>

        {/* Feedback Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="col-span-2 p-12 text-center border border-dashed border-gray-800 rounded-2xl space-y-2">
              <Star className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
              <p className="text-sm font-semibold text-gray-300">Loading customer reviews...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="col-span-2 p-12 text-center border border-dashed border-gray-800 rounded-2xl space-y-2">
              <MessageSquare className="w-8 h-8 text-gray-600 mx-auto" />
              <p className="text-sm font-semibold text-gray-300">No Reviews Published Yet</p>
              <p className="text-xs text-gray-500">Service reviews will appear here once verified by showroom management.</p>
            </div>
          ) : (
            feedbacks.map((f) => (
              <Card glass key={f.id} className="space-y-3">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                        {f.customer_display_name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-200">{f.customer_display_name}</p>
                        <p className="text-[10px] text-gray-400">{f.showroom_name || 'Showroom'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      <span className="text-xs font-bold text-amber-300 font-mono">{f.rating}.0</span>
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {f.vehicle_details && (
                    <Badge variant="neutral" className="text-[10px] bg-gray-900 border-gray-800">
                      Vehicle: {f.vehicle_details}
                    </Badge>
                  )}
                  {f.comment && (
                    <p className="text-xs text-gray-300 italic leading-relaxed">
                      "{f.comment}"
                    </p>
                  )}
                  {f.admin_response && (
                    <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs space-y-1">
                      <p className="font-semibold text-blue-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Showroom Management Response:
                      </p>
                      <p className="text-gray-300 italic">"{f.admin_response}"</p>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-500 font-mono text-right">
                    {new Date(f.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
