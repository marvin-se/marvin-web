"use client"

import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import getCroppedImg from '@/lib/crop-image'

interface ImageCropperProps {
  imageSrc: string | null
  open: boolean
  onClose: () => void
  onCropComplete: (croppedImageBlob: Blob) => void
}

export default function ImageCropper({ imageSrc, open, onClose, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    if (imageSrc && croppedAreaPixels) {
      try {
        setIsLoading(true)
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
        if (croppedImage) {
          onCropComplete(croppedImage)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Profile Picture</DialogTitle>
        </DialogHeader>
        
        <div className="relative h-[350px] w-full bg-black rounded-md overflow-hidden">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteCallback}
              onZoomChange={onZoomChange}
              cropShape="round"
              showGrid={false}
            />
          )}
        </div>

        <div className="py-4">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Zoom</span>
                <Slider 
                    value={[zoom]} 
                    min={1} 
                    max={3} 
                    step={0.1} 
                    onValueChange={(vals) => setZoom(vals[0])} 
                    className="flex-1"
                />
            </div>
        </div>

        <div className="flex flex-row justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-green-600 text-white hover:bg-green-700">
            {isLoading ? "Saving..." : "Save Picture"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
