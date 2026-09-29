'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Star, Send, ArrowLeft, CheckCircle2 } from 'lucide-react';

const RATING_LABELS: Record<number, string> = {
  1: 'Terrible 😞',
  2: 'Poor 🙁',
  3: 'Average 😐',
  4: 'Good 🙂',
  5: 'Excellent 🌟',
};

export default function SubmitServiceFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const serviceJobId = params.serviceId as string;

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');

  const { toast } = useToast();

  // Submit Feedback Mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: (body: any) => apiClient('/feedback', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast('success', 'Thank you! Your feedback has been submitted for showroom review.');
      router.push('/customer/services/requests');
    },
    onError: (err: any) => toast('error', err.message || 'Failed to submit feedback'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceJobId) return;

    submitFeedbackMutation.mutate({
      service_job_id: serviceJobId,
      rating,
      comment: comment || undefined,
    });
  };

  const displayRating = hoverRating || rating;

  return (
    <PageWrapper
      title="Rate & Review Service Job"
      description="Share your experience to help us maintain authorized showroom quality standards."
      action={
        <Link href="/customer/services/requests">
          <Button variant="secondary" className="text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to My Service Requests
          </Button>
        </Link>
      }
    >
      <div className="max-w-xl mx-auto space-y-6">
        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>Post-Service Customer Feedback</span>
            </CardTitle>
            <CardDescription>Select a 1 to 5 star rating and share your service experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Interactive Star Rating */}
              <div className="space-y-2 text-center py-4 bg-gray-900/60 rounded-2xl border border-gray-800">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Select Your Rating
                </p>
                <div className="flex items-center justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= displayRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-700 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm font-bold text-amber-300">
                  {RATING_LABELS[displayRating] || 'Good'}
                </p>
              </div>

              {/* Comment Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Service Experience Comment (Optional)
                </label>
                <textarea
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  rows={4}
                  maxLength={500}
                  placeholder="Tell us about the servicing speed, technician professionalism, and vehicle performance after repair..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <p className="text-[11px] text-gray-500 text-right">{comment.length} / 500 characters</p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={submitFeedbackMutation.isPending}
                  className="bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20"
                >
                  <Send className="w-4 h-4 mr-1.5" /> Submit Review
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
