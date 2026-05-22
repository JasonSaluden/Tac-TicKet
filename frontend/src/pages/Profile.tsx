import { useAuth } from '../context/AuthContext'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../api/services'

export default function Profile() {
    const { user, logout, refreshUser } = useAuth()
    const navigate = useNavigate()

    // Edit Profile State
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [firstName, setFirstName] = useState(user?.firstName || '')
    const [lastName, setLastName] = useState(user?.lastName || '')
    const [email, setEmail] = useState(user?.email || '')
    const [profileLoading, setProfileLoading] = useState(false)
    const [profileError, setProfileError] = useState('')
    const [profileSuccess, setProfileSuccess] = useState('')

    // Change Password State
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [passwordError, setPasswordError] = useState('')
    const [passwordSuccess, setPasswordSuccess] = useState('')

    // Edit Profile Handlers
    const handleEditProfile = useCallback(() => {
        setIsEditingProfile(true)
        setFirstName(user?.firstName || '')
        setLastName(user?.lastName || '')
        setEmail(user?.email || '')
        setProfileError('')
        setProfileSuccess('')
    }, [user])

    const handleCancelEditProfile = useCallback(() => {
        setIsEditingProfile(false)
        setProfileError('')
        setProfileSuccess('')
    }, [])

    const handleSaveProfile = useCallback(async () => {
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            setProfileError('Tous les champs sont obligatoires')
            return
        }

        try {
            setProfileLoading(true)
            setProfileError('')
            await userService.updateUser(user!.idUser, {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
            })
            await refreshUser()
            setIsEditingProfile(false)
            setProfileSuccess('Profil mis à jour avec succès ✅')
            setTimeout(() => setProfileSuccess(''), 3000)
        } catch (err: any) {
            setProfileError(err?.response?.data?.message || 'Erreur lors de la mise à jour')
        } finally {
            setProfileLoading(false)
        }
    }, [firstName, lastName, email, user])

    // Change Password Handlers
    const handleChangePassword = useCallback(() => {
        setIsChangingPassword(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setPasswordError('')
        setPasswordSuccess('')
    }, [])

    const handleCancelChangePassword = useCallback(() => {
        setIsChangingPassword(false)
        setPasswordError('')
        setPasswordSuccess('')
    }, [])

    const handleConfirmChangePassword = useCallback(async () => {
        if (!currentPassword.trim()) {
            setPasswordError('Le mot de passe actuel est obligatoire')
            return
        }

        if (!newPassword.trim()) {
            setPasswordError('Le nouveau mot de passe est obligatoire')
            return
        }

        if (newPassword.length < 6) {
            setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères')
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Les mots de passe ne correspondent pas')
            return
        }

        try {
            setPasswordLoading(true)
            setPasswordError('')
            await userService.changePassword(user!.idUser, currentPassword, newPassword)
            await refreshUser()
            setIsChangingPassword(false)
            setPasswordSuccess('Mot de passe modifié avec succès ✅')
            setTimeout(() => setPasswordSuccess(''), 3000)
        } catch (err: any) {
            setPasswordError(err?.response?.data?.message || 'Erreur lors de la modification du mot de passe')
        } finally {
            setPasswordLoading(false)
        }
    }, [currentPassword, newPassword, confirmPassword, user])

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-8 py-8">
                <p>Veuillez vous connecter</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
                <p className="text-gray-600 mt-1">Gérez vos informations personnelles et votre sécurité</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Info Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {user.firstName} {user.lastName}
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">{user.email}</p>
                            <div className="mt-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                {user.role === 'ADMIN' ? '👨‍💼 Admin' : user.role === 'AGENT' ? '🎫 Agent' : '👤 Utilisateur'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Edit Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Edit Profile Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Informations Personnelles</h3>
                            {!isEditingProfile && (
                                <button
                                    onClick={handleEditProfile}
                                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition"
                                >
                                    ✏️ Modifier
                                </button>
                            )}
                        </div>

                        {user?.oauthProvider && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                                ℹ️ Connecté via {user.oauthProvider}. Votre profil est géré par {user.oauthProvider}.
                            </div>
                        )}

                        {isEditingProfile ? (
                            <form className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* First Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Prénom
                                        </label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            disabled={profileLoading}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nom
                                        </label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            disabled={profileLoading}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Adresse Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={profileLoading || !!user?.oauthProvider}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                    {user?.oauthProvider && (
                                        <p className="text-xs text-gray-500 mt-1">Géré par {user.oauthProvider}</p>
                                    )}
                                </div>

                                {/* Error */}
                                {profileError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                        {profileError}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleSaveProfile}
                                        disabled={profileLoading}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {profileLoading ? 'Sauvegarde...' : '✅ Enregistrer'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelEditProfile}
                                        disabled={profileLoading}
                                        className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition disabled:cursor-not-allowed"
                                    >
                                        ❌ Annuler
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Prénom:</span>
                                    <span className="font-medium text-gray-900">{user.firstName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Nom:</span>
                                    <span className="font-medium text-gray-900">{user.lastName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="font-medium text-gray-900">{user.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Rôle:</span>
                                    <span className="font-medium text-gray-900">
                                        {user.role === 'ADMIN' ? 'Administrateur' : user.role === 'AGENT' ? 'Agent' : 'Utilisateur'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {profileSuccess && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                                {profileSuccess}
                            </div>
                        )}
                    </div>

                    {/* Change Password Section */}
                    {!user?.oauthProvider && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Sécurité</h3>
                                {!isChangingPassword && (
                                    <button
                                        onClick={handleChangePassword}
                                        className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition"
                                    >
                                        🔐 Changer le mot de passe
                                    </button>
                                )}
                            </div>

                            {isChangingPassword ? (
                                <form className="space-y-4">
                                    {/* Current Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mot de passe actuel
                                        </label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            disabled={passwordLoading}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                            placeholder="Entrez votre mot de passe actuel"
                                        />
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nouveau mot de passe
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            disabled={passwordLoading}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                            placeholder="Entrez un nouveau mot de passe"
                                        />
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirmer le mot de passe
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={passwordLoading}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                            placeholder="Confirmez votre nouveau mot de passe"
                                        />
                                    </div>

                                    {/* Error */}
                                    {passwordError && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                            {passwordError}
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                                        Le mot de passe doit contenir au moins 6 caractères
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={handleConfirmChangePassword}
                                            disabled={passwordLoading}
                                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {passwordLoading ? 'Modification...' : '🔐 Modifier le mot de passe'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelChangePassword}
                                            disabled={passwordLoading}
                                            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition disabled:cursor-not-allowed"
                                        >
                                            ❌ Annuler
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-gray-600">Votre mot de passe est stocké de façon sécurisée.</p>
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
                                        🔒 Changez régulièrement votre mot de passe pour sécuriser votre compte
                                    </div>
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                                    {passwordSuccess}
                                </div>
                            )}
                        </div>
                    )}

                    {/* OAuth Security Info */}
                    {user?.oauthProvider && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sécurité</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                                    🔒 Votre compte est sécurisé via {user.oauthProvider}. La gestion de la sécurité se fait directement dans votre compte {user.oauthProvider}.
                                </div>
                                <p className="text-gray-600 text-sm">
                                    Pour changer votre mot de passe ou votre email, veuillez le faire sur votre compte {user.oauthProvider}.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Logout Button */}
                    <button
                        onClick={() => {
                            logout()
                            navigate('/login')
                        }}
                        className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition border border-red-200"
                    >
                        🚪 Se déconnecter
                    </button>
                </div>
            </div>
        </div>
    )
}
