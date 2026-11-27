import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { accountAPI } from '../services/api'
import { User, Mail, Phone, MapPin, CreditCard, Calendar, Shield, Building2 } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { user } = useAuth()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const { data } = await accountAPI.getMyAccount()
        setAccount(data.data)
      } catch {
        toast.error('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }
    fetchAccount()
  }, [])

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className={styles.infoRow}>
      <div className={styles.infoIcon}><Icon size={16} /></div>
      <div className={styles.infoContent}>
        <span className={styles.infoLabel}>{label}</span>
        <span className={styles.infoValue}>{value || '—'}</span>
      </div>
    </div>
  )

  if (loading) return <div className={styles.loading}>Loading profile...</div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Profile</h1>
        <p className={styles.subtitle}>View your account and personal details</p>
      </div>

      <div className={styles.grid}>
        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.avatarLg}>{account?.holderName?.[0]?.toUpperCase() || 'U'}</div>
          <h2 className={styles.name}>{account?.holderName || user?.fullName}</h2>
          <span className={styles.roleBadge}><Shield size={12} /> {user?.role || 'USER'}</span>
          <div className={styles.joinDate}>
            Member since {account?.createdAt ? format(new Date(account.createdAt), 'MMMM yyyy') : '—'}
          </div>
          <div className={styles.statusChip} data-active={account?.isActive}>
            <span className={styles.statusDot} />
            {account?.isActive ? 'Account Active' : 'Account Inactive'}
          </div>
        </div>

        {/* Details */}
        <div className={styles.detailsCard}>
          <h3 className={styles.sectionTitle}>Personal Information</h3>
          <div className={styles.infoList}>
            <InfoRow icon={User} label="Full Name" value={account?.holderName} />
            <InfoRow icon={Mail} label="Email Address" value={account?.email} />
            <InfoRow icon={Phone} label="Phone Number" value={account?.phoneNumber} />
            <InfoRow icon={MapPin} label="Address" value={account?.address} />
          </div>

          <div className={styles.divider} />

          <h3 className={styles.sectionTitle}>Bank Account Details</h3>
          <div className={styles.infoList}>
            <InfoRow icon={CreditCard} label="Account Number" value={account?.accountNumber} />
            <InfoRow icon={Building2} label="IFSC Code" value={account?.ifscCode} />
            <InfoRow icon={CreditCard} label="Account Type" value={account?.accountType} />
            <InfoRow icon={Calendar} label="Account Opened"
              value={account?.createdAt ? format(new Date(account.createdAt), 'dd MMMM yyyy') : '—'} />
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className={styles.securityNote}>
        <Shield size={16} />
        <p>Your account is secured with BCrypt password hashing and JWT-based session management.
          All transfers are protected with real-time balance validation.</p>
      </div>
    </div>
  )
}

