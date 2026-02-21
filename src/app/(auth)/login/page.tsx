'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('이메일 또는 비밀번호가 일치하지 않습니다.');
      setLoading(false);
    } else {
      router.push('/calendar/month');
      router.refresh();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <h1 className="auth-title">반가워요!</h1>
        <p className="auth-subtitle">로그인하여 일정을 관리해보세요</p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">이메일 주소</label>
            <input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
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
            {loading ? '로그인 중...' : '로그인 하기'}
          </button>
        </form>

        <p className="auth-footer">
          계정이 없으신가요? <Link href="/register">회원가입</Link>
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

        .auth-footer {
          margin-top: 24px;
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .auth-footer a {
          color: var(--accent-primary);
          font-weight: var(--weight-medium);
        }
      `}</style>
    </div>
  );
}
