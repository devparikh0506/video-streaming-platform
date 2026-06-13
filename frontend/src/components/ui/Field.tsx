import { useId, type ReactNode } from 'react'

interface FieldProps {
  label: string
  hint?: string
  children: (id: string) => ReactNode
}

/**
 * Form field wrapper that pairs a label with its control via a generated id.
 * The control is provided as a render-prop so the id can be wired correctly.
 */
export function Field({ label, hint, children }: FieldProps) {
  const id = useId()
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children(id)}
      {hint && <span className="field__hint">{hint}</span>}
    </div>
  )
}
