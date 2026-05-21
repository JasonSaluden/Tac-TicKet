import { useState } from 'react'
import { CategoryManagement } from '../components/CategoryManagement'
import { UserManagement } from '../components/UserManagement'

type TabType = 'tickets' | 'users' | 'categories'

interface Tab {
    id: TabType
    label: string
    icon: string
    description: string
}

const tabs: Tab[] = [
    {
        id: 'tickets',
        label: 'Gestion Tickets',
        icon: '🎫',
        description: 'Gérez tous les tickets du système',
    },
    {
        id: 'users',
        label: 'Gestion Users & Rôles',
        icon: '👥',
        description: 'Gérez les utilisateurs et leurs rôles',
    },
    {
        id: 'categories',
        label: 'Gestion Catégories',
        icon: '📂',
        description: 'Créez, modifiez et supprimez les catégories de tickets',
    },
]

export default function Admin() {
    const [activeTab, setActiveTab] = useState<TabType>('tickets')

    return (
        <div>
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Tabs Navigation */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="flex border-b border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 ${activeTab === tab.id
                                    ? 'text-blue-600 border-blue-600 bg-blue-50'
                                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div>
                    {/* Tickets Tab */}
                    {activeTab === 'tickets' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                    <span className="text-3xl">🎫</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {tabs[0].label}
                                </h2>
                                <p className="text-gray-600 mb-8">{tabs[0].description}</p>
                                <div className="bg-gray-50 rounded-lg p-8 border border-dashed border-gray-300">
                                    <p className="text-gray-500">
                                        Cette section est en cours de développement...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                    {tabs[1].label}
                                </h2>
                                <p className="text-gray-600 text-sm">{tabs[1].description}</p>
                            </div>
                            <UserManagement />
                        </div>
                    )}

                    {/* Categories Tab */}
                    {activeTab === 'categories' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <CategoryManagement />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
