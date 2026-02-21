'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Supabase typically sends a confirmation email. 
            // For this prototype, we'll assume auto-confirm is on or just redirect.
            alert('Registration successful! Please check your email for confirmation (if enabled).');
            router.push('/login');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Star managing your time properly</p>

                <form onSubmit={handleRegister} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            id="fullName"
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="auth-button shadow-glow" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link href="/login">Sign in</Link>
                </p>
            </div>

            <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: var(--bg-base);
        }

        .auth-card {
          width: 100%;
          max-width: 400px;
          padding: 40px;
          border-radius: var(--radius-lg);
          text-align: center;
        }

        .auth-title {
          font-size: var(--text-2xl);
          font-weight: var(--weight-bold);
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .auth-subtitle {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: 32px;
        }

        .auth-form {
          text-align: left;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          color: var(--text-muted);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .form-group input:focus {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 4px rgba(108, 99, 255, 0.1);
        }

        .error-message {
          padding: 12px;
          border-radius: var(--radius-sm);
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
          font-size: var(--text-sm);
          margin-bottom: 20px;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .auth-button {
          width: 100%;
          padding: 14px;
          border-radius: var(--radius-md);
          background: var(--accent-primary);
          color: white;
          font-weight: var(--weight-semibold);
          font-size: var(--text-base);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 12px;
        }

        .auth-button:hover {
          background: var(--accent-secondary);
          transform: translateY(-1px);
        }

        .auth-button:active {
          transform: translateY(1px);
        }

        .auth-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .auth-footer {
          margin-top: 24px;
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .auth-footer a {
          color: var(--accent-primary);
          font-weight: var(--weight-medium);
        }

        .auth-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
        </div>
    );
}
