import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { accountAPI, transactionAPI } from '../services/api'
import {
  Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp,
  Eye, EyeOff, Copy, CheckCircle, ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { user, updateUser } = useAuth()
  const [account, setAccount] = useState(null)
  const [recentTxns, setRecentTxns] = useState([])
  const [loading, setLoading] = useState(true)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accRes, txnRes] = await Promise.all([
          accountAPI.getMyAccount(),
          transactionAPI.getRecent()
        ])
        setAccount(accRes.data.data)
        setRecentTxns(txnRes.data.data || [])
        // Keep user context updated
        if (accRes.data.data.accountNumber) {
          updateUser({ accountNumber: accRes.data.data.accountNumber })
        }
      } catch (err) {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(account?.accountNumber || '')
    setCopied(true)
    toast.success('Account number copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0)

  const getTxnIcon = (txn) => {
    const isCredit = txn.receiverAccountNumber === account?.accountNumber
    return isCredit
      ? <span className={`${styles.txnIcon} ${styles.credit}`}><ArrowDownLeft size={16} /></span>
      : <span className={`${styles.txnIcon} ${styles.debit}`}><ArrowUpRight size={16} /></span>
  }

  const getTxnAmount = (txn) => {
    const isCredit = txn.receiverAccountNumber === account?.accountNumber
    return (
      <span className={isCredit ? styles.amtCredit : styles.amtDebit}>
        {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
      </span>
    )
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>Good day, {user?.fullName?.split(' ')[0]} 👋</h1>
          <p className={styles.subtitle}>Here's your financial overview</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className={styles.balanceCard}>
        <div className={styles.balanceCardBg} />
        <div className={styles.balanceTop}>
          <div className={styles.balanceLabel}>
            <Wallet size={16} />
            <span>Savings Account</span>
          </div>
          <button className={styles.visibleBtn} onClick={() => setBalanceVisible(p => !p)}>
            {balanceVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className={styles.balanceAmount}>
          {balanceVisible ? formatCurrency(account?.balance) : '₹ ••••••'}
        </div>
        <div className={styles.balanceFooter}>
          <div className={styles.accountNum}>
            <span>Acc: {account?.accountNumber}</span>
            <button onClick={copyAccountNumber} className={styles.copyBtn}>
              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <span className={styles.ifsc}>IFSC: {account?.ifscCode}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <ArrowDownLeft size={20} />
          </div>
          <div>
            <div className={styles.statLabel}>Credits (Month)</div>
            <div className={styles.statValue}>
              {formatCurrency(
                recentTxns
                  .filter(t => t.receiverAccountNumber === account?.accountNumber)
                  .reduce((s, t) => s + (t.amount || 0), 0)
              )}
            </div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconRed}`}>
            <ArrowUpRight size={20} />
          </div>
          <div>
            <div className={styles.statLabel}>Debits (Month)</div>
            <div className={styles.statValue}>
              {formatCurrency(
                recentTxns
                  .filter(t => t.senderAccountNumber === account?.accountNumber)
                  .reduce((s, t) => s + (t.amount || 0), 0)
              )}
            </div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div className={styles.statLabel}>Total Transactions</div>
            <div className={styles.statValue}>{recentTxns.length}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsRow}>
          <Link to="/transfer" className={styles.actionBtn}>
            <ArrowUpRight size={22} />
            <span>Transfer Money</span>
          </Link>
          <Link to="/transactions" className={styles.actionBtn}>
            <TrendingUp size={22} />
            <span>View History</span>
          </Link>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Transactions</h2>
          <Link to="/transactions" className={styles.viewAll}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentTxns.length === 0 ? (
          <div className={styles.emptyState}>
            <TrendingUp size={40} style={{ color: 'var(--text-muted)', marginBottom: 10 }} />
            <p>No transactions yet. Make your first transfer!</p>
          </div>
        ) : (
          <div className={styles.txnList}>
            {recentTxns.map(txn => (
              <div key={txn.id} className={styles.txnRow}>
                {getTxnIcon(txn)}
                <div className={styles.txnDetails}>
                  <div className={styles.txnDesc}>{txn.description || 'Fund Transfer'}</div>
                  <div className={styles.txnMeta}>
                    {txn.receiverAccountNumber === account?.accountNumber
                      ? `From: ${txn.senderName || txn.senderAccountNumber}`
                      : `To: ${txn.receiverName || txn.receiverAccountNumber}`
                    }
                    <span className={styles.dot}>•</span>
                    {txn.timestamp ? format(new Date(txn.timestamp), 'dd MMM, hh:mm a') : ''}
                  </div>
                </div>
                <div className={styles.txnRight}>
                  {getTxnAmount(txn)}
                  <div className={styles.txnRef}>{txn.transactionRef}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.skeleton} style={{ height: 32, width: 240, marginBottom: 24 }} />
      <div className={styles.skeleton} style={{ height: 170, borderRadius: 16, marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} style={{ height: 80, borderRadius: 12 }} />)}
      </div>
      <div className={styles.skeleton} style={{ height: 200, borderRadius: 12 }} />
    </div>
  )
}

