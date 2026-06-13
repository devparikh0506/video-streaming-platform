import type { InputHTMLAttributes } from 'react'
import { cx } from '@/lib/cx'

type TextInputProps = InputHTMLAttributes<HTMLInputElement>

export function TextInput({ className, type = 'text', ...rest }: TextInputProps) {
  return <input className={cx('input', className)} type={type} {...rest} />
}
