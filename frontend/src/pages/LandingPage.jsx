import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  ShieldCheck,
  Clock,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Briefcase,
  Layers,
  Zap,
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div>
      {/* Modern Hero Section */}
      <section
        style={{
          padding: '90px 24px 70px',
          maxWidth: '1100px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary-50)',
            color: 'var(--primary-700)',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '28px',
            border: '1px solid var(--primary-200)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <Sparkles size={16} /> Campus Infrastructure Management Reimagined
        </div>

        <h1
          style={{
            fontSize: '48px',
            fontWeight: 800,
            color: 'var(--slate-900)',
            lineHeight: 1.15,
            marginBottom: '24px',
            letterSpacing: '-1px',
          }}
        >
          CampusFix &mdash; Smart College Complaint &amp; Maintenance Platform
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'var(--slate-600)',
            maxWidth: '760px',
            margin: '0 auto 40px',
            lineHeight: 1.6,
          }}
        >
          Eliminate lost WhatsApp complaints, verbal delays, and forgotten repairs. CampusFix provides an organized digital workflow with real-time status tracking and <strong>automatic priority escalation</strong>.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link
            to="/register"
            className="btn btn-primary btn-lg"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ffffff' }}
          >
            <span style={{ color: '#ffffff' }}>Register as Student / Staff</span>
            <ArrowRight size={18} color="#ffffff" />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Sign In to Portal
          </Link>
        </div>

        {/* Hero Metric Pills */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '56px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-600)', fontSize: '13.5px', fontWeight: 600 }}>
            <CheckCircle2 size={18} color="var(--success-dot)" /> 100% Digital Lifecycle
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-600)', fontSize: '13.5px', fontWeight: 600 }}>
            <Zap size={18} color="var(--primary-600)" /> Automatic Priority Escalation
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-600)', fontSize: '13.5px', fontWeight: 600 }}>
            <ShieldCheck size={18} color="var(--info-dot)" /> Secure JWT Authentication
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section
        style={{
          backgroundColor: '#ffffff',
          padding: '72px 24px',
          borderTop: '1px solid var(--slate-200)',
          borderBottom: '1px solid var(--slate-200)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.5px' }}>
              Engineered for College Campus Realities
            </h2>
            <p style={{ color: 'var(--slate-500)', marginTop: '8px', fontSize: '15px' }}>
              Designed to solve critical maintenance bottlenecks across hostels, academic classrooms, and laboratories.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Feature 1 */}
            <div className="card" style={{ marginBottom: 0, borderTop: '4px solid var(--primary-600)' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Clock size={22} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '8px' }}>
                Option A Automatic Escalation
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--slate-600)', lineHeight: 1.6 }}>
                Complaints remaining unresolved beyond configurable day thresholds automatically escalate: <strong>Low &rarr; Medium &rarr; High</strong>. Older issues get guaranteed administrative visibility.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card" style={{ marginBottom: 0, borderTop: '4px solid var(--info-dot)' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--info-bg)',
                  color: 'var(--info-dot)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <ImageIcon size={22} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '8px' }}>
                Photo Evidence &amp; Proof
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--slate-600)', lineHeight: 1.6 }}>
                Students attach photos when reporting damaged equipment. Technicians upload completion photos upon resolution for visual verification.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card" style={{ marginBottom: 0, borderTop: '4px solid var(--success-dot)' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--success-bg)',
                  color: 'var(--success-dot)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <CheckCircle2 size={22} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '8px' }}>
                Transparent Audit Trail
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--slate-600)', lineHeight: 1.6 }}>
                Complete immutable record from <code>PENDING</code> &rarr; <code>IN_PROGRESS</code> &rarr; <code>RESOLVED</code> with technician progress notes and exact timestamps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Dedicated Portals Section */}
      <section style={{ padding: '72px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--slate-900)' }}>
            Dedicated Portals for Every Campus Role
          </h2>
          <p style={{ color: 'var(--slate-500)', marginTop: '6px', fontSize: '14.5px' }}>
            Tailored interfaces designed for specific campus responsibilities.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {/* Portal 1 */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={20} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-900)' }}>Student Portal</h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--slate-600)', lineHeight: 1.5 }}>
              Hostel plumbing, classroom projectors, campus Wi-Fi reporting with personal tracking and clear SLA expectations.
            </p>
          </div>

          {/* Portal 2 */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--info-bg)', color: 'var(--info-dot)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={20} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-900)' }}>Faculty Portal</h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--slate-600)', lineHeight: 1.5 }}>
              Department cabins, lecture hall audio/visual systems, lab equipment issues with academic priority checklists.
            </p>
          </div>

          {/* Portal 3 */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--warning-bg)', color: 'var(--warning-dot)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wrench size={20} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-900)' }}>Maintenance Hub</h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--slate-600)', lineHeight: 1.5 }}>
              Unified operational queue across campus. Field technicians take ownership, post progress notes, and upload proof photos.
            </p>
          </div>

          {/* Portal 4 */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--purple-bg)', color: 'var(--purple-dot)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={20} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-900)' }}>Admin Console</h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--slate-600)', lineHeight: 1.5 }}>
              Real-time analytics, category/location controls, escalated tickets radar, user administration, and SLA configuration.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
