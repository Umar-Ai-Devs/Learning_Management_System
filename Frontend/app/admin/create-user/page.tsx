'use client'

import { useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Input, Card } from '@/components/ui'
import Button from '@/components/ui/Button'
import api from '@/lib/api'

interface FormData {
  name: string
  email: string
  password: string
  role: 'student' | 'teacher' | 'admin'
  roll_number?: string
  semester?: string
  department?: string
  phone?: string
  address?: string
  qualification?: string
  specialization?: string
}

interface FormErrors {
  [key: string]: string
}

export default function CreateUser() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    role: 'student',
    roll_number: '',
    semester: '',
    department: '',
    phone: '',
    address: '',
    qualification: '',
    specialization: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Role-specific validation
    if (formData.role === 'student') {
      if (formData.roll_number && formData.roll_number.length < 3) {
        newErrors.roll_number = 'Roll number must be at least 3 characters'
      }
      if (formData.semester && (parseInt(formData.semester) < 1 || parseInt(formData.semester) > 8)) {
        newErrors.semester = 'Semester must be between 1 and 8'
      }
    }

    if (formData.role === 'teacher') {
      if (formData.qualification && formData.qualification.length < 2) {
        newErrors.qualification = 'Qualification must be at least 2 characters'
      }
    }

    // Optional field validation
    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (successMessage) {
      setSuccessMessage('')
    }
  }

  const handleRoleChange = (role: 'student' | 'teacher' | 'admin') => {
    setFormData(prev => ({ 
      ...prev, 
      role,
      // Clear role-specific fields
      roll_number: '',
      semester: '',
      department: '',
      phone: '',
      address: '',
      qualification: '',
      specialization: ''
    }))
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      const response = await api.post('/admin/users/create', formData)
      setSuccessMessage(response.data.message || 'User created successfully!')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'student',
        roll_number: '',
        semester: '',
        department: '',
        phone: '',
        address: '',
        qualification: '',
        specialization: ''
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create user'
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        setErrors({ general: errorMessage })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleSpecificFields = () => {
    switch (formData.role) {
      case 'student':
        return (
          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Roll Number"
                  placeholder="e.g., CS-2024-001"
                  value={formData.roll_number || ''}
                  onChange={(e) => handleInputChange('roll_number', e.target.value)}
                  error={errors.roll_number}
                />
                <Input
                  label="Semester"
                  type="number"
                  placeholder="1-8"
                  value={formData.semester || ''}
                  onChange={(e) => handleInputChange('semester', e.target.value)}
                  error={errors.semester}
                />
                <Input
                  label="Department"
                  placeholder="Computer Science"
                  value={formData.department || ''}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  error={errors.department}
                />
                <Input
                  label="Phone Number"
                  placeholder="+1 234 567 8900"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={errors.phone}
                />
              </div>
              <Input
                label="Address"
                placeholder="City, Country"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                error={errors.address}
              />
            </div>
          </div>
        )
      
      case 'teacher':
        return (
          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Qualification"
                  placeholder="PhD, MSc, etc."
                  value={formData.qualification || ''}
                  onChange={(e) => handleInputChange('qualification', e.target.value)}
                  error={errors.qualification}
                />
                <Input
                  label="Specialization"
                  placeholder="Machine Learning, etc."
                  value={formData.specialization || ''}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  error={errors.specialization}
                />
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <ProtectedRoute role="admin">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New User</h1>
          <p className="text-gray-600">Add a new student, teacher, or administrator to the system</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg text-success-800">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-800">
            {errors.general}
          </div>
        )}

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  required
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  error={errors.password}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-error-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as 'student' | 'teacher' | 'admin')}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none min-h-[48px] md:min-h-[44px]"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Role-specific fields */}
            {getRoleSpecificFields()}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Button
                type="submit"
                loading={isLoading}
                className="min-h-[48px] px-8"
              >
                Create {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  )
}