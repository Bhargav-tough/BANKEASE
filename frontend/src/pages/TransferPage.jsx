import { useState } from 'react'
import { accountAPI, transactionAPI } from '../services/api'
import { Search, Send, CheckCircle, AlertCircle, User, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './TransferPage.module.css'

export default function TransferPage() {
  const [step, setStep] = useState(1) // 1: form, 2: confirm, 3: success
  const [form, setForm] = useState({ recipientAccountNumber: '', amount: '', description: '' })
  const [recipient, setRecipient] = useState(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [transferLoading, setTransferLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [lookupError, setLookupError] = useState('')

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    if (e.target.name === 'recipientAccountNumber') {
      setRecipient(null)
      setLookupError('')
    }
  }

  const lookupRecipient = async () => {
    if (!form.recipientAccountNumber.trim()) {
      toast.error('Enter an account number first')
      return
    }
    setLookupLoading(true)
    setLookupError('')
    try {
      const { data } = await accountAPI.lookupAccount(form.recipientAccountNumber.trim())
      setRecipient(data.data)
      toast.success('Account found!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Account not found'
      setLookupError(msg)
      setRecipient(null)
    } finally {
      setLookupLoading(false)
    }
  }

  const handleProceed = (e) => {
    e.preventDefault()
    if (!recipient) { toast.error('Please verify recipient account first'); return }
    if (!form.amount || parseFloat(form.amount) < 1) { toast.error('Enter a valid amount (min ₹1)'); return }
    setStep(2)
  }

  const handleConfirmTransfer = async () => {
    setTransferLoading(true)
    try {
      const { data } = await transactionAPI.transfer({
        recipientAccountNumber: form.recipientAccountNumber,
        amount: parseFloat(form.amount),
        description: form.description || 'Fund Transfer'
      })
      setResult(data.data)
      setStep(3)
      toast.success('Transfer successful! 🎉')
    } catch (err) {
      const msg = err.response?.data?.message || 'Transfer failed'
      toast.error(msg)
    } finally {
      setTransferLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setForm({ recipientAccountNumber: '', amount: '', description: '' })
    setRecipient(null)
    setResult(null)
    setLookupError('')
  }

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Transfer Money</h1>
        <p className={styles.subtitle}>Send funds to any BankEase account instantly</p>
      </div>

      {/* Steps indicator */}
      <div className={styles.steps}>
        {['Enter Details', 'Confirm', 'Done'].map((label, i) => (
          <div key={i} className={`${styles.step} ${step === i + 1 ? styles.stepActive : ''} ${step > i + 1 ? styles.stepDone : ''}`}>
            <div className={styles.stepCircle}>{step > i + 1 ? <CheckCircle size={14} /> : i + 1}</div>
            <span>{label}</span>
            {i < 2 && <div className={styles.stepLine} />}
          </div>
        ))}
      </div>

      <div className={styles.card}>
        {/* Step 1: Form */}
        {step === 1 && (
          <form onSubmit={handleProceed} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Recipient Account Number</label>
              <div className={styles.inputRow}>
                <input
                  className={`${styles.input} ${lookupError ? styles.inputError : ''} ${recipient ? styles.inputSuccess : ''}`}
                  type="text" name="recipientAccountNumber"
                  placeholder="Enter 12-digit account number"
                  value={form.recipientAccountNumber}
                  onChange={handleChange}
                  maxLength={16}
                />
                <button type="button" className={styles.lookupBtn} onClick={lookupRecipient} disabled={lookupLoading}>
                  {lookupLoading ? <span className={styles.spinner} /> : <Search size={18} />}
                  <span>Verify</span>
                </button>
              </div>
              {lookupError && (
                <div className={styles.errorMsg}><AlertCircle size={14} /> {lookupError}</div>
              )}
              {recipient && (
                <div className={styles.recipientCard}>
                  <div className={styles.recipientAvatar}>{recipient.holderName?.[0]?.toUpperCase()}</div>
                  <div>
                    <div className={styles.recipientName}>{recipient.holderName}</div>
                    <div className={styles.recipientAcc}>{recipient.accountNumber} · {recipient.ifscCode}</div>
                  </div>
                  <CheckCircle size={18} style={{ color: 'var(--secondary)', marginLeft: 'auto' }} />
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Amount (₹)</label>
              <div className={styles.amountWrap}>
                <span className={styles.rupee}>₹</span>
                <input
                  className={`${styles.input} ${styles.amountInput}`}
                  type="number" name="amount"
                  placeholder="0.00"
                  value={form.amount} onChange={handleChange}
                  min="1" step="0.01"
                />
              </div>
              <div className={styles.quickAmounts}>
                {[500, 1000, 2000, 5000].map(amt => (
                  <button key={amt} type="button" className={styles.quickAmt}
                    onClick={() => setForm(p => ({ ...p, amount: amt.toString() }))}>
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description (Optional)</label>
              <input
                className={styles.input} type="text" name="description"
                placeholder="e.g. Rent, Groceries, Loan repayment"
                value={form.description} onChange={handleChange}
                maxLength={100}
              />
            </div>

            <button type="submit" className={styles.primaryBtn}>
              Proceed to Confirm <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && (
          <div className={styles.confirm}>
            <h3 className={styles.confirmTitle}>Review Transfer</h3>
            <div className={styles.confirmCard}>
              <div className={styles.confirmRow}>
                <span>To</span>
                <span className={styles.confirmVal}>
                  <User size={14} /> {recipient?.holderName}
                </span>
              </div>
              <div className={styles.confirmRow}>
                <span>Account</span>
                <span className={styles.confirmVal}>{form.recipientAccountNumber}</span>
              </div>
              <div className={styles.confirmRow}>
                <span>Amount</span>
                <span className={`${styles.confirmVal} ${styles.confirmAmt}`}>
                  {formatCurrency(form.amount)}
                </span>
              </div>
              <div className={styles.confirmRow}>
                <span>Description</span>
                <span className={styles.confirmVal}>{form.description || 'Fund Transfer'}</span>
              </div>
            </div>
            <div className={styles.confirmNote}>
              ⚠️ Please review carefully. Transfers cannot be reversed once confirmed.
            </div>
            <div className={styles.confirmBtns}>
              <button className={styles.secondaryBtn} onClick={() => setStep(1)}>Back</button>
              <button className={styles.primaryBtn} onClick={handleConfirmTransfer} disabled={transferLoading}>
                {transferLoading ? <><span className={styles.spinner} /> Processing...</> : <>Confirm Transfer <Send size={16} /></>}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className={styles.success}>
            <div className={styles.successIcon}><CheckCircle size={48} /></div>
            <h3 className={styles.successTitle}>Transfer Successful!</h3>
            <p className={styles.successSub}>Your money has been sent successfully</p>
            <div className={styles.successDetails}>
              <div className={styles.confirmRow}>
                <span>Reference</span>
                <span className={styles.confirmVal} style={{ fontFamily: 'monospace', fontSize: 13 }}>
                  {result?.transactionRef}
                </span>
              </div>
              <div className={styles.confirmRow}>
                <span>Amount Sent</span>
                <span className={`${styles.confirmVal} ${styles.confirmAmt}`}>
                  {formatCurrency(result?.amount)}
                </span>
              </div>
              <div className={styles.confirmRow}>
                <span>Balance Left</span>
                <span className={styles.confirmVal}>
                  {formatCurrency(result?.balanceAfterTransaction)}
                </span>
              </div>
            </div>
            <button className={styles.primaryBtn} onClick={resetForm}>
              Make Another Transfer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

