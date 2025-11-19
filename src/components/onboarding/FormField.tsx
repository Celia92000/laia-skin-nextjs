'use client'

interface FormFieldProps {
  label: string
  name: string
  type?: string
  value: string | boolean
  onChange: (value: string | boolean) => void
  error?: string
  placeholder?: string
  required?: boolean
  helpText?: string
  disabled?: boolean
  icon?: string
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  helpText,
  disabled = false,
  icon
}: FormFieldProps) {
  if (type === 'checkbox') {
    return (
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={name}
          checked={value as boolean}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="mt-1 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
        />
        <div className="flex-1">
          <label htmlFor={name} className="text-sm font-medium text-gray-900 cursor-pointer">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {helpText && (
            <p className="text-xs text-gray-500 mt-0.5">{helpText}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={name}
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-lg border
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
          focus:ring-2 focus:ring-purple-500 focus:border-purple-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-colors
        `}
      />
      {helpText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  )
}
