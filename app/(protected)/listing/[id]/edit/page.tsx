"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import FloatingAlert from "@/components/ui/floating-alert"
import { getListingDetailById, updateListing, presignImages, attachImages, deleteListingImage } from "@/lib/api/listings"
import { ArrowLeft, Save, Loader2, X } from "lucide-react"

const primaryColor = "#72C69B"
const secondaryColor = "#182C53"

export default function EditListingPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form State
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  
  // Image State
  const [existingImages, setExistingImages] = useState<string[]>([]) // URLs of images already on server
  const [newFiles, setNewFiles] = useState<File[]>([]) // New files selected for upload
  const [previewUrls, setPreviewUrls] = useState<string[]>([]) // Previews for new files

  const [alert, setAlert] = useState<{
    visible: boolean
    type: 'success' | 'error'
    message: string
  }>({ visible: false, type: 'success', message: '' })

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return
      try {
        const listing = await getListingDetailById(id)
        setTitle(listing.title)
        setPrice(listing.price.toString())
        setDescription(listing.description)
        setExistingImages(listing.images || [])
      } catch (error) {
        console.error("Failed to fetch listing:", error)
        setAlert({
          visible: true,
          type: 'error',
          message: "Failed to load listing details."
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchListing()
  }, [id])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newFileArray = Array.from(files)
      setNewFiles(prev => [...prev, ...newFileArray])
      
      // Create preview URLs
      const newPreviews = newFileArray.map(file => URL.createObjectURL(file))
      setPreviewUrls(prev => [...prev, ...newPreviews])
    }
  }

  const removeExistingImage = async (index: number) => {
    const imageUrl = existingImages[index];
    
    // Optimistically remove from UI
    const updatedImages = [...existingImages];
    updatedImages.splice(index, 1);
    setExistingImages(updatedImages);

    // Extract key from URL to delete from server
    try {
        const urlObj = new URL(imageUrl);
        let key = urlObj.pathname;
        if (key.startsWith('/')) key = key.substring(1);
        
        await deleteListingImage(parseInt(id), key);
    } catch (err) {
        console.error("Failed to delete image from server:", err);
        setAlert({
            visible: true,
            type: 'error',
            message: "Failed to delete image. Please try again."
        });
        // Revert
        const revertedImages = [...updatedImages];
        revertedImages.splice(index, 0, imageUrl);
        setExistingImages(revertedImages);
    }
  }

  const removeNewFile = (index: number) => {
    const updatedFiles = [...newFiles];
    updatedFiles.splice(index, 1);
    setNewFiles(updatedFiles);

    const updatedPreviews = [...previewUrls];
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setPreviewUrls(updatedPreviews);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // 1. Update Metadata
      await updateListing(id, {
        title,
        description,
        price: parseFloat(price),
      })

      // 2. Handle New Image Uploads
      if (newFiles.length > 0) {
        // A. Presign
        const presignRequests = newFiles.map(file => ({
            fileName: file.name,
            contentType: file.type || 'application/octet-stream'
        }));
        
        const presignedImages = await presignImages(parseInt(id), presignRequests);

        // B. Upload to S3 (via Proxy)
        await Promise.all(presignedImages.map(async (img, index) => {
            const file = newFiles[index];
            await fetch('/api/s3-proxy', {
                method: 'PUT',
                headers: {
                    'X-Upload-Url': img.uploadUrl,
                    'Content-Type': file.type || 'application/octet-stream'
                },
                body: file
            });
        }));

        // C. Attach Keys to Listing
        const keysToAttach = presignedImages.map(img => img.key);
        await attachImages(parseInt(id), keysToAttach);
      }

      setAlert({
        visible: true,
        type: 'success',
        message: "Listing updated successfully! Redirecting...",
      })

      setTimeout(() => {
        router.push(`/listing/${id}`)
      }, 1500)
    } catch (error) {
      console.error("Failed to update listing:", error)
      setAlert({
        visible: true,
        type: 'error',
        message: "Failed to update listing. Please try again."
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <Link 
          href={`/listing/${id}`} 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listing
        </Link>

        <div className="bg-white rounded-xl border shadow-sm p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6" style={{ color: secondaryColor }}>
            Edit Listing
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (TL)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={500}
              />
            </div>

            {/* Images */}
            <div className="space-y-4">
              <Label>Photos</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {/* Existing Images */}
                {existingImages.map((image, index) => (
                  <div key={`existing-${index}`} className="relative group aspect-square">
                    <img
                      src={image}
                      alt={`Existing ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* New Preview Images */}
                {previewUrls.map((url, index) => (
                  <div key={`new-${index}`} className="relative group aspect-square">
                    <img
                      src={url}
                      alt={`New ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg pointer-events-none">
                        <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">New</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* Upload Button */}
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-2 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="text-xs text-gray-500">Add Photo</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link href={`/listing/${id}`}>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={isSaving}
                style={{ backgroundColor: primaryColor }}
                className="text-white hover:opacity-90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {alert.visible && (
        <FloatingAlert
          type={alert.type}
          title={alert.type === 'success' ? "Success" : "Error"}
          message={alert.message}
          onClose={() => setAlert({ ...alert, visible: false })}
        />
      )}
    </main>
  )
}
