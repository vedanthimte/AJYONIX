import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { AttendanceService } from '../services/attendance.service';
import { EventService } from '../services/event.service';
import { useToast } from '../context/ToastContext';
import { Event } from '../types';
import {
  ScanLine,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ArrowRight,
  Camera,
  Keyboard,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const Scanner: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [mode, setMode] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');
  const [manualCode, setManualCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [errorResult, setErrorResult] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  const { showToast } = useToast();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await EventService.getAll();
      setEvents(data);
      if (data.length > 0) {
        setSelectedEventId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Initialize HTML5 QR Code Camera Scanner
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        handleProcessScan(decodedText);
      },
      (error) => {
        // Continuous scan error callback, keep quiet
      }
    );

    scannerRef.current = scanner;

    return () => {
      try {
        scanner.clear();
      } catch {
        // Clean cleanup
      }
    };
  }, [mode, selectedEventId]);

  const handleProcessScan = async (codeOrData: string) => {
    if (processing) return;
    setProcessing(true);
    setLastResult(null);
    setErrorResult(null);

    try {
      let result;
      if (mode === 'CHECK_IN') {
        result = await AttendanceService.checkIn({
          qrData: codeOrData,
          eventId: selectedEventId || undefined,
        });
      } else {
        result = await AttendanceService.checkOut({
          qrData: codeOrData,
          eventId: selectedEventId || undefined,
        });
      }

      setLastResult(result);
      setRecentScans((prev) => [result, ...prev.slice(0, 9)]);
      showToast(`${mode === 'CHECK_IN' ? 'Checked in' : 'Checked out'} verified for ${result.participant?.name || result.participantName}!`, 'success');
      setManualCode('');
    } catch (err: any) {
      setErrorResult(err.message || 'Verification failed');
      showToast(err.message || 'Verification error', 'error');
    } finally {
      setTimeout(() => {
        setProcessing(false);
      }, 1200);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      showToast('Please enter registration ID', 'warning');
      return;
    }
    handleProcessScan(manualCode.trim());
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Campus QR Attendance Scanner</h1>
        <p className="page-subtitle">
          Verify digital registration passes, record live attendee timestamps, and manage entry/exit checkpoints
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 28 }}>
        {/* Left Column: Scanner Control & Camera View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Controls Bar */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Check-In / Check-Out Toggle */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#f1f5f9',
                  padding: 4,
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <button
                  onClick={() => setMode('CHECK_IN')}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: mode === 'CHECK_IN' ? '#10b981' : 'transparent',
                    color: mode === 'CHECK_IN' ? '#ffffff' : '#64748b',
                    fontWeight: 700,
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>CHECK-IN</span>
                </button>
                <button
                  onClick={() => setMode('CHECK_OUT')}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: mode === 'CHECK_OUT' ? '#ef4444' : 'transparent',
                    color: mode === 'CHECK_OUT' ? '#ffffff' : '#64748b',
                    fontWeight: 700,
                  }}
                >
                  <ArrowRight size={14} />
                  <span>CHECK-OUT</span>
                </button>
              </div>

              {/* Event Selector */}
              <div style={{ flex: '1 1 200px' }}>
                <select
                  className="form-select"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.status.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* HTML5 QR Code Scanner Mount Box */}
          <div className="card" style={{ textAlign: 'center', padding: 24, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              <Camera size={18} color="#4f46e5" />
              <strong style={{ fontSize: 14, color: 'var(--text-main)' }}>Live Camera Scanner Feed</strong>
            </div>

            <div
              id="qr-reader"
              style={{
                width: '100%',
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
              }}
            />

            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
              Point laptop or mobile camera at participant QR code
            </div>
          </div>

          {/* Fallback Manual Registration Code Input */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Keyboard size={18} color="#6366f1" />
              <strong style={{ fontSize: 13.5, color: 'var(--text-main)' }}>
                Manual Pass ID Fallback (Without Camera)
              </strong>
            </div>

            <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. AYX-2026-00101 or AYX-2026-00201"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                disabled={processing}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={processing}
                style={{ whiteSpace: 'nowrap' }}
              >
                {processing ? 'Verifying...' : 'Verify Entry'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Scan Verification Feedback & Recent Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Active Result Card */}
          {lastResult && (
            <div
              className="card"
              style={{
                backgroundColor: '#ecfdf5',
                border: '2px solid #34d399',
                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.2)',
                animation: 'slideUp 0.25s ease-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#065f46' }}>
                    {mode === 'CHECK_IN' ? 'Check-in Verified!' : 'Check-out Logged!'}
                  </h3>
                  <div style={{ fontSize: 12, color: '#047857' }}>
                    Registration Pass ID: {lastResult.registrationCode}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  fontSize: 13,
                  backgroundColor: '#ffffff',
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #a7f3d0',
                }}
              >
                <div>
                  <strong>Participant:</strong> {lastResult.participant?.name || lastResult.participantName}
                </div>
                <div>
                  <strong>Email:</strong> {lastResult.participant?.email || 'Student Email'}
                </div>
                <div>
                  <strong>Event:</strong> {lastResult.event?.name || lastResult.event}
                </div>
                <div>
                  <strong>Timestamp:</strong> {new Date().toLocaleTimeString()}
                </div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span className="badge badge-published">{lastResult.status}</span>
                </div>
              </div>
            </div>
          )}

          {errorResult && (
            <div
              className="card"
              style={{
                backgroundColor: '#fef2f2',
                border: '2px solid #f87171',
                boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.2)',
                animation: 'slideUp 0.25s ease-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertCircle size={24} color="#dc2626" />
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#991b1b' }}>
                    Verification Denied
                  </h3>
                  <div style={{ fontSize: 13, color: '#b91c1c', marginTop: 2 }}>{errorResult}</div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Scans Live Feed */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Gate Verification Logs</h3>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Real-time terminal buffer</span>
            </div>

            {recentScans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: 13 }}>
                No passes scanned in this session yet. Scan a QR code or submit a registration ID to begin.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Participant</th>
                      <th>Pass Code</th>
                      <th>Time</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentScans.map((scan, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>
                          {scan.participant?.name || scan.participantName}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', color: '#4f46e5' }}>
                            {scan.registrationCode}
                          </span>
                        </td>
                        <td style={{ fontSize: 12 }}>
                          {new Date(scan.time || Date.now()).toLocaleTimeString()}
                        </td>
                        <td>
                          <span className="badge badge-published">{scan.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
