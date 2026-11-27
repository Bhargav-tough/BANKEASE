import { useEffect, useState } from 'react'
import { transactionAPI, accountAPI } from '../services/api'
import { ArrowUpRight, ArrowDownLeft, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import styles from './TransactionsPage.module.css'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [search, setSearch] = useState('')
  const PAGE_SIZE = 10

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const { data } = await accountAPI.getMyAccount()
        setAccount(data.data)
      } catch {}
    }
    fetchAccount()
  }, [])

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      try {
        const { data } = await transactionAPI.getHistory(page, PAGE_SIZE)
        const pageData = data.data
        setTransactions(pageData.content || [])
        setTotalPages(pageData.totalPages || 0)
        setTotalElements(pageData.totalElements || 0)
      } catch (err) {
        toast.error('Failed to load transactions')
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [page])

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0)

  const isCredit = (txn) => txn.receiverAccountNumber === account?.accountNumber

  const filtered = transactions.filter(t =>
    !search ||
    t.description?.toLowerCase().includes(search.toLowerCase()) ||
    t.transactionRef?.toLowerCase().includes(search.toLowerCase()) ||
    t.senderAccountNumber?.includes(search) ||
    t.receiverAccountNumber?.includes(search)
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Transaction History</h1>
          <p className={styles.subtitle}>{totalElements} total transactions</p>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchBar}>
        <Search size={16} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search by description, reference, or account..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>Loading transactions...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <ArrowUpRight size={40} style={{ color: 'var(--text-muted)', marginBottom: 10 }} />
            <p>{search ? 'No results found for your search.' : 'No transactions yet.'}</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Reference</th>
                    <th>Date & Time</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(txn => {
                    const credit = isCredit(txn)
                    return (
                      <tr key={txn.id}>
                        <td>
                          <div className={`${styles.typeIcon} ${credit ? styles.credit : styles.debit}`}>
                            {credit ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                          </div>
                        </td>
                        <td>
                          <div className={styles.descCell}>
                            <span className={styles.desc}>{txn.description || 'Fund Transfer'}</span>
                            <span className={styles.party}>
                              {credit
                                ? `From: ${txn.senderName || txn.senderAccountNumber}`
                                : `To: ${txn.receiverName || txn.receiverAccountNumber}`}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.ref}>{txn.transactionRef}</span>
                        </td>
                        <td>
                          <span className={styles.date}>
                            {txn.timestamp ? format(new Date(txn.timestamp), 'dd MMM yyyy') : '—'}
                          </span>
                          <span className={styles.time}>
                            {txn.timestamp ? format(new Date(txn.timestamp), 'hh:mm a') : ''}
                          </span>
                        </td>
                        <td>
                          <span className={credit ? styles.amtCredit : styles.amtDebit}>
                            {credit ? '+' : '-'}{formatCurrency(txn.amount)}
                          </span>
                        </td>
                        <td>
                          <span className={styles.balance}>
                            {txn.balanceAfterTransaction != null ? formatCurrency(txn.balanceAfterTransaction) : '—'}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${styles['badge' + txn.status]}`}>
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  Page {page + 1} of {totalPages}
                </span>
                <div className={styles.paginationBtns}>
                  <button
                    className={styles.pageBtn}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pg = page < 3 ? i : page - 2 + i
                    if (pg >= totalPages) return null
                    return (
                      <button
                        key={pg}
                        className={`${styles.pageBtn} ${pg === page ? styles.pageBtnActive : ''}`}
                        onClick={() => setPage(pg)}
                      >
                        {pg + 1}
                      </button>
                    )
                  })}
                  <button
                    className={styles.pageBtn}
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

