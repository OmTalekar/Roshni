import { useState, useEffect } from 'react'
import api from '../services/api'

export default function BlockchainExplorer({ feederCode }) {
  const [networkParams, setNetworkParams] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [billHash, setBillHash] = useState('')
  const [verifyResult, setVerifyResult] = useState(null)

  // ✅ Fix: was useState(() => {}, []) — useState never runs side effects
  useEffect(() => {
    fetchNetworkParams()
  }, [])

  const fetchNetworkParams = async () => {
    try {
      const res = await api.get('/blockchain/network-params')
      setNetworkParams(res.data)
      setError(null)
    } catch (error) {
      console.error('Error fetching blockchain params:', error)
      setError('Could not connect to Algorand network. Check backend configuration.')
    } finally {
      setLoading(false)
    }
  }

  const verifyBillHash = async () => {
    if (!billHash.trim()) {
      alert('Enter a bill hash or transaction ID')
      return
    }
    try {
      const res = await api.get(`/blockchain/bill-hash/verify/${billHash}`)
      setVerifyResult(res.data)
    } catch (error) {
      alert(`Verification failed: ${error.message}`)
    }
  }

  if (loading) return <div className="spinner" />

  return (
    <div>
      <h1>⛓️ Blockchain Explorer</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>Algorand Testnet - Bill & Allocation Verification</p>

      {error && (
        <div className="alert warning" style={{ marginBottom: '1.5rem' }}>
          <strong>⚠️ Network Error:</strong> {error}
        </div>
      )}

      {networkParams && (
        <div className="card">
          <h3>📡 Network Parameters</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
          }}>
            <div>
              <small style={{ opacity: 0.7 }}>Network</small>
              <div style={{ fontWeight: 'bold', marginTop: '0.3rem' }}>
                {networkParams.network}
              </div>
            </div>
            <div>
              <small style={{ opacity: 0.7 }}>Latest Round</small>
              <div style={{ fontWeight: 'bold', marginTop: '0.3rem' }}>
                {networkParams.latest_round}
              </div>
            </div>
            <div>
              <small style={{ opacity: 0.7 }}>Min Fee</small>
              <div style={{ fontWeight: 'bold', marginTop: '0.3rem' }}>
                {networkParams.min_fee} microAlgos
              </div>
            </div>
            <div>
              <small style={{ opacity: 0.7 }}>SUN ASA ID</small>
              <div style={{ fontWeight: 'bold', marginTop: '0.3rem', color: 'var(--primary)' }}>
                {networkParams.sun_asa_id || 'Not deployed'}
              </div>
            </div>
          </div>
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(255, 140, 66, 0.05)',
            borderRadius: '8px',
            fontSize: '0.85rem',
          }}>
            <strong>Node:</strong> {networkParams.node_url}
          </div>
        </div>
      )}

      <div className="card">
        <h3>🔍 Verify Bill Hash</h3>
        <p style={{ opacity: 0.7, marginBottom: '1rem' }}>
          Enter a transaction ID or bill hash to verify on blockchain
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            value={billHash}
            onChange={(e) => setBillHash(e.target.value)}
            placeholder="Enter transaction ID or bill hash..."
            style={{ flex: 1 }}
            onKeyDown={(e) => e.key === 'Enter' && verifyBillHash()}
          />
          <button onClick={verifyBillHash} style={{ minWidth: '120px' }}>
            Verify
          </button>
        </div>
      </div>

      {verifyResult && (
        <div className={`card ${verifyResult.status === 'verified' ? '' : 'alert'}`}>
          <h3>Verification Result</h3>
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <small style={{ opacity: 0.7 }}>Status</small>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: verifyResult.status === 'verified' ? '#27ae60' : '#ff6b6b',
                marginTop: '0.3rem',
              }}>
                {verifyResult.status.toUpperCase()}
              </div>
            </div>
            <div>
              <small style={{ opacity: 0.7 }}>Transaction ID</small>
              <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                {verifyResult.txn_id}
              </div>
            </div>
            {verifyResult.note && (
              <div>
                <small style={{ opacity: 0.7 }}>Bill Note</small>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  marginTop: '0.3rem',
                  wordBreak: 'break-all',
                }}>
                  {verifyResult.note}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="alert info">
        <strong>ℹ️ How Blockchain Protects You:</strong>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>Monthly bills are hashed and recorded on Algorand for immutability</li>
          <li>SUN ASA tokens represent renewable allocation certificates</li>
          <li>Daily feeder aggregates are logged for transparency</li>
          <li>DISCOM maintains final settlement authority (not blockchain)</li>
          <li>All transactions are on public Algorand testnet</li>
        </ul>
      </div>

      <div className="alert warning">
        <strong>⚠️ Testnet Notice:</strong> This demo uses Algorand testnet. For production, use mainnet with proper auditing.
      </div>
    </div>
  )
}