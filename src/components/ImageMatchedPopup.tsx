import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, ExternalLink } from 'lucide-react';
import type { GameMode, TierLevel } from '@/services/playerService';

interface ImageMatchedPopupProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  ign: string | null;
}

export function ImageMatchedPopup({ isOpen, onClose, imageUrl, ign }: ImageMatchedPopupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<string | null>(null);

  const supportedGameModes: GameMode[] = ["Crystal", "skywars", "midfight", "bridge", "UHC", "sumo", "nodebuff", "bedfight"];

  const handleSubmit = async () => {
    if (!imageUrl || !ign) {
      setSubmissionResult('Error: Image URL or IGN is missing.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const response = await fetch('/api/admin/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl, ign }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmissionResult(`Successfully processed image for ${ign}.`);
      } else {
        setSubmissionResult(`Error processing image: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      setSubmissionResult(`Error: ${error.message || 'Failed to process image'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-black/90 border-white/20 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white">
              Process Image
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {imageUrl && (
            <div className="flex justify-center">
              <img src={imageUrl} alt="Matched Result" className="max-h-64 rounded-md" />
            </div>
          )}

          {ign && (
            <div className="text-center">
              <Badge className="bg-blue-500 text-white text-lg px-4 py-2">
                {ign}
              </Badge>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>

          {submissionResult && (
            <div className="text-center">
              {submissionResult}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
