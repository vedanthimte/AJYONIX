import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CertificateService } from '../services/certificate.service';
import { QRCodeSVG } from 'qrcode.react';
import { Award, CheckCircle2, XCircle, Search, ShieldCheck, Calendar, MapPin, Building, ArrowLeft } from 'lucide-react';

export const CertificateVerify: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [queryCode, setQueryCode] = useState(
    certificateId && certificateId !== 'demo' ? certificateId : 'CERT-AYX-2026-90001'
  );
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (queryCode) {
      verifyCode(queryCode);
    }
  }, [certificateId]);

  const verifyCode = async (codeToVerify: string) => {
    setLoading(true);
    try {
      const res = await CertificateService.verify(codeToVerify);
      setVerification(res);
    } catch (err: any) {
      setVerification({
        status: 'INVALID',
        message: err.message || 'Verification failed. Certificate ID not found.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryCode.trim()) {
      verifyCode(queryCode.trim());
    }
  };

  const isValid = verification?.status === 'VALID';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Search Header */}
      <div style={{ width: '100%', maxWidth: 640, marginBottom: 32, textAlign: 'center' }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-dark btn-sm"
          style={{ marginBottom: 20, color: '#cbd5e1' }}
        >
          <ArrowLeft size={14} />
          <span>Return to Ayojanix Dashboard</span>
        </button>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Ayojanix Public Certificate Verification
        </h1>
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
          Tamper-proof academic credential verification for Dr. S. P. Akarte (Dean) & Event Cell, PRMITR
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <input
            type="text"
            className="form-input"
            style={{ backgroundColor: '#1e293b', color: '#ffffff', borderColor: '#334155' }}
            placeholder="Enter Certificate Code (e.g. CERT-AYX-2026-90001)"
            value={queryCode}
            onChange={(e) => setQueryCode(e.target.value.toUpperCase())}
          />
          <button type="submit" className="btn btn-primary">
            <Search size={16} />
            <span>Verify</span>
          </button>
        </form>
      </div>

      {/* Verification Result Card */}
      {loading ? (
        <div style={{ color: '#94a3b8', marginTop: 40 }}>Querying Ayojanix Blockchain & SQLite Registry...</div>
      ) : (
        <div
          style={{
            width: '100%',
            maxWidth: 640,
            backgroundColor: '#ffffff',
            borderRadius: 24,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              padding: '24px 32px',
              backgroundColor: isValid ? '#ecfdf5' : '#fef2f2',
              borderBottom: `2px solid ${isValid ? '#a7f3d0' : '#fecaca'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {isValid ? (
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={24} />
                </div>
              ) : (
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <XCircle size={24} />
                </div>
              )}

              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: isValid ? '#065f46' : '#991b1b',
                    textTransform: 'uppercase',
                  }}
                >
                  STATUS: {isValid ? 'OFFICIALLY VALID' : 'RECORD NOT FOUND / INVALID'}
                </span>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                  {isValid ? 'Authentic Certificate of Participation' : 'Unverified Credential'}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>Registry ID</span>
              <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: '#1e293b' }}>
                {queryCode}
              </div>
            </div>
          </div>

          {/* Certificate Detail Body */}
          {isValid ? (
            <div style={{ padding: '32px' }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Awarded To
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e1b4b', marginTop: 4 }}>
                  {verification.participantName}
                </h2>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                  for active participation and successful completion of
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#4338ca', marginTop: 6 }}>
                  {verification.eventName}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  padding: 20,
                  backgroundColor: '#f8fafc',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  marginBottom: 24,
                  fontSize: 13,
                }}
              >
                <div>
                  <span style={{ color: '#64748b' }}>Issue Date:</span>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {new Date(verification.issueDate).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b' }}>Issuing Authority:</span>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    PRMITR Badnera (CSE Department)
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b' }}>Registration Pass ID:</span>
                  <div style={{ fontWeight: 600, color: '#4f46e5', fontFamily: 'monospace' }}>
                    {verification.registrationCode}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b' }}>Dean & Faculty Endorsement:</span>
                  <div style={{ fontWeight: 600, color: '#059669' }}>Verified Active Signatures</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
                <div style={{ fontSize: 11.5, color: '#64748b', maxWidth: 360, lineHeight: 1.5 }}>
                  This credential is cryptographically anchored in the Ayojanix Campus Management Core. It can be cited in resumes and LinkedIn portfolios.
                </div>

                <div style={{ textAlign: 'center' }}>
                  <QRCodeSVG value={window.location.href} size={70} />
                  <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 4 }}>Scan to Re-verify</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '36px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#7f1d1d', lineHeight: 1.6 }}>
                The certificate code <strong>"{queryCode}"</strong> does not match any authenticated record in the PRMITR event database. Please double-check for typing errors.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
