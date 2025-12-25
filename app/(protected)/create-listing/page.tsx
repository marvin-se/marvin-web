"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import FloatingAlert from "@/components/ui/floating-alert"; // <-- TOAST YERİNE KULLANILAN BİLEŞEN
import { createNewListing } from "@/lib/api/create-listing" // API çağrısı

const primaryColor = "#72C69B"
const secondaryColor = "#182C53"

// Alert state yapısı
interface AlertState {
    visible: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
}

export default function CreateListingPage() {
  const router = useRouter()
    
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    description: "",
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // TOAST YERİNE KULLANILACAK ALERT STATE
  const [alert, setAlert] = useState<AlertState>({
      visible: false,
      type: 'info',
      title: '',
      message: '',
  });

  // NOTE: Backend'deki enum adlarına uygun (örneğin Sports_Outdoors)
  const categories = [ "ELECTRONICS", "BOOKS", "FASHION", "HOME", "SPORTS", "OTHER", "STATIONERY", "FURNITURE"]

  const formatCategoryName = (category: string) => {
    return category.charAt(0) + category.slice(1).toLowerCase();
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Hata düzeltme
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }
  
  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
    // Hata düzeltme
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: "" }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
      
      setUploadedFiles((prev) => [...prev, ...newFiles])
      setPreviewUrls((prev) => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.category) newErrors.category = "Category is required"
    
    const priceNumber = Number(formData.price);
    if (!formData.price) newErrors.price = "Price is required"
    else if (isNaN(priceNumber)) newErrors.price = "Price must be a number"
    else if (priceNumber <= 0) newErrors.price = "Price must be greater than zero"

    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (uploadedFiles.length === 0) newErrors.images = "At least one photo is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Geçerli değilse hatayı Alert ile göster
    if (!validateForm()) {
      setAlert({
        visible: true,
        type: 'error',
        title: "Missing Information",
        message: "Please fill in all required fields and upload at least one photo.",
      });
      return
    }

    setIsSubmitting(true)
    
    // Backend'e gönderilecek veriyi oluştur
    const listingDataToSend = {
      title: formData.title,
      // Backend enum'a uygun formatlama
      category: formData.category.toUpperCase().replace(/\s/g, '_'), 
      description: formData.description,
      price: Number(formData.price), 
      files: uploadedFiles, 
    }

    try {
      // API çağrısı
      const newListing = await createNewListing(listingDataToSend)
      
      // Başarılı Alert
      setAlert({
        visible: true,
        type: 'success',
        title: "Listing is published!",
        message: "Your new listing has been successfully created. Redirecting...",
      });
      
      // Yönlendirme (Alert'in görünmesine izin vermek için kısa bir süre bekle)
      setTimeout(() => {
          router.push(`/listing/${newListing.id}`)
      }, 1000); 

    } catch (error: any) {
      console.error("Error while creating listing:", error)
      
      // Hata Alert
      const errorMessage = error.response?.data?.message || "Server unreachable or invalid data.";
      setAlert({
        visible: true,
        type: 'error',
        title: "Error Occurred",
        message: `Failed to create listing. Details: ${errorMessage}`,
      });

    } finally {
      // Başarılı olursa zaten yönlendirileceği için finally bloğunda sadece hata durumunda kapatma gerekli,
      // ancak buraya koymak daha güvenlidir.
      // setIsSubmitting(false) // Yönlendirmeden önce zaten kapanacak
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <Link href="/browse" className="mb-4 block hover:underline" style={{ color: primaryColor }}>
          ← Back to Listings
        </Link>
        <h1 className="text-3xl font-bold mb-2" style={{ color: secondaryColor }}>Create New Listing</h1>
        <p className="text-muted-foreground">Fill out the information below to sell your item</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photo Upload */}
        <div className="p-6 bg-card rounded-xl border">
          <Label className="text-lg font-semibold block mb-4">
            Photos <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-4">
            {previewUrls.map((image, index) => (
              <div key={index} className="relative group">
                <img src={image} alt={`Uploaded image ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  X
                </button>
              </div>
            ))}
          </div>
          <label
            htmlFor="images"
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-muted transition-colors block"
          >
            <div className="text-4xl mx-auto mb-2">📤</div>
            <p className="font-medium mb-1">Click or drag to upload photos</p>
            <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
          </label>
          <input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {errors.images && <p className="text-red-500 text-sm mt-2">{errors.images}</p>}
        </div>

        {/* Listing Details */}
        <div className="p-6 bg-card rounded-xl border space-y-6">
            <h3 className="text-lg font-semibold">Listing Details</h3>
            <div className="grid gap-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Lightly used textbook"
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                    <Select name="category" onValueChange={handleCategoryChange} value={formData.category}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>{formatCategoryName(cat)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="price">Price ($) <span className="text-red-500">*</span></Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="e.g., 150"
                    />
                    {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide details about your item (condition, features, etc.)"
                rows={5}
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="lg" 
            className="text-white" 
            style={{ backgroundColor: primaryColor }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Yayınlanıyor..." : "Publish Listing"}
          </Button>
        </div>
      </form>
      
      {/* FLOATING ALERT RENDER */}
      {alert.visible && (
        <FloatingAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
        />
      )}
    </div>
  )
}