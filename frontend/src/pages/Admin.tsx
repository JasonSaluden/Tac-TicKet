import { useState } from 'react'
import { Ticket, Users, FolderTree } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { CategoryManagement } from '../components/CategoryManagement'
import { UserManagement } from '../components/UserManagement'
import { TicketManagement } from '../components/TicketManagement'

type TabType = 'tickets' | 'users' | 'categories'

interface Tab {
    id: TabType
    label: string
    icon: LucideIcon
    description: string
}

const tabs: Tab[] = [
    {
        id: 'tickets',
        label: 'Gestion des tickets',
        icon: Ticket,
        description: 'Gérez tous les tickets du système',
    },
    {
        id: 'users',
        label: 'Gestion des utilisateurs et rôles',
        icon: Users,
        description: 'Gérez les utilisateurs et leurs rôles',
    },
    {
        id: 'categories',
        label: 'Gestion des catégories',
        icon: FolderTree,
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
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 ${activeTab === tab.id
                                        ? 'text-blue-600 border-blue-600 bg-blue-50'
                                        : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div>
                    {/* Tickets Tab */}
                    {activeTab === 'tickets' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                    {tabs[0].label}
                                </h2>
                                <p className="text-gray-600 text-sm">{tabs[0].description}</p>
                            </div>
                            <TicketManagement />
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
