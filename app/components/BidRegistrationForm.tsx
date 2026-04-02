'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface BidRegistrationFormProps {
  onRegister: (bidderInfo: {
    name: string
    address: string
    phone: string
    email: string
  }) => void
}

export default function BidRegistrationForm({
  onRegister,
}: BidRegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onRegister(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Enter your details to place a bid
      </h3>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Full Name
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your full name"
          className={`bg-input text-input-foreground placeholder:text-input-placeholder border border-border rounded-md ${
            errors.name ? 'border-destructive' : ''
          }`}
        />
        {errors.name && (
          <p className="text-destructive text-xs mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Address
        </label>
        <Textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Your full address"
          className={`bg-input text-input-foreground placeholder:text-input-placeholder border border-border rounded-md min-h-24 ${
            errors.address ? 'border-destructive' : ''
          }`}
        />
        {errors.address && (
          <p className="text-destructive text-xs mt-1">{errors.address}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Phone Number
        </label>
        <Input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Your phone number"
          className={`bg-input text-input-foreground placeholder:text-input-placeholder border border-border rounded-md ${
            errors.phone ? 'border-destructive' : ''
          }`}
        />
        {errors.phone && (
          <p className="text-destructive text-xs mt-1">{errors.phone}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Email Address
        </label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className={`bg-input text-input-foreground placeholder:text-input-placeholder border border-border rounded-md ${
            errors.email ? 'border-destructive' : ''
          }`}
        />
        {errors.email && (
          <p className="text-destructive text-xs mt-1">{errors.email}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
      >
        Continue to Bid
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Your details are collected solely to verify your identity and
        facilitate payment if you win. We do not share your information.
      </p>
    </form>
  )
}
