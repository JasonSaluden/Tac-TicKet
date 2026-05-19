import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'ghost'
}

export function Button({ variant = 'default', className = '', ...props }: ButtonProps) {
    const base =
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none'
    const variants: Record<string, string> = {
        default:
            'bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 shadow-sm',
        ghost: 'bg-transparent text-indigo-600 hover:bg-indigo-50 px-3 py-1',
    }

    return (
        <button className={`${base} ${variants[variant]} ${className}`} {...props} />
    )
}

export default Button
