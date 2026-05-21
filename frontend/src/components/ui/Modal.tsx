import { useCallback } from 'react'
import type { ReactNode } from 'react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    description?: string
    children: ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-4xl',
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
}: Readonly<ModalProps>) {
    const handleBackdropClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) {
                onClose()
            }
        },
        [onClose]
    )

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    onClose()
                }
            }}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto`}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                        {description && (
                            <p className="text-sm text-gray-500 mt-1">{description}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500 hover:text-gray-700"
                        title="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4">{children}</div>
            </div>
        </div>
    )
}
