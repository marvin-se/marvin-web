"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import FloatingAlert from "@/components/ui/floating-alert"
import { getListingDetailById, updateListing } from "@/lib/api/listings"
import { Listing } from "@/lib/types"
import { ArrowLeft, Save, Loader2 } from "lucide-react"

const primaryColor = "#72C69B"
const secondaryColor = "#182C53"

export default function EditListingPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<{
    title: string
    price: string
    description: string
    images: string[]
  }>({
    title: "",
    price: "",
    description: "",
    images: [],
  })
  
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
        setFormData({
          title: listing.title,
          price: listing.price.toString(),
          description: listing.description,
          images: listing.images || [],
        })
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // Note: In a real app, you would upload these to a server.
      // Here we just create local URLs for preview/demo.
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }))
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateListing(id, {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        images: formData.images,
      })

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
                value={formData.title}
                onChange={handleInputChange}
                required
                maxLength={100}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                maxLength={500}
              />
            </div>

            {/* Images */}
            <div className="space-y-4">
              <Label>Photos</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={image}
                      alt={`Listing ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors aspect-square">
                  <span className="text-2xl mb-1">+</span>
                  <span className="text-xs text-gray-500">Add Photo</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 text-white"
                style={{ backgroundColor: primaryColor }}
                disabled={isSaving}
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
