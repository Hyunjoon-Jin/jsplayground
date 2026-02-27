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
      <div className="auth-card">
        <h1 className="auth-title">로그인</h1>
        <p className="auth-subtitle">Life Controller 계정으로 계속하기</p>

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

          <button type="submit" className="auth-button shadow-md" disabled={loading}>
            {loading ? '로그인 중...' : '로그인 하기'}
          </button>
        </form>

        <div className="auth-divider">
          <span>또는</span>
        </div>

        <p className="auth-footer">
          계정이 없으신가요? <Link href="/register">회원가입 하기</Link>
        </p>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: var(--bg-base);
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 48px 32px;
          background: var(--bg-elevated);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
          text-align: center;
          border: 1px solid var(--border-subtle);
        }

        .auth-title {
          font-size: var(--text-2xl);
          font-weight: 800;
          margin-bottom: 8px;
          color: var(--text-primary);
          letter-spacing: -1px;
        }

        .auth-subtitle {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: 40px;
        }

        .auth-form {
          text-align: left;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 10px;
          margin-left: 2px;
        }

        .form-group input {
          width: 100%;
          padding: 16px;
          border-radius: var(--radius-md);
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          color: var(--text-primary);
          font-size: var(--text-base);
          transition: all 0.25s ease;
          outline: none;
        }

        .form-group input:focus {
          background: var(--bg-elevated);
          border-color: var(--border-focus);
          box-shadow: 0 0 0 4px var(--accent-glow);
        }

        .error-message {
          padding: 14px;
          border-radius: var(--radius-md);
          background: var(--error-bg);
          color: var(--error);
          font-size: var(--text-sm);
          font-weight: 600;
          margin-bottom: 24px;
          border: 1px solid var(--error-border);
          text-align: center;
        }

        .auth-button {
          width: 100%;
          padding: 18px;
          border-radius: var(--radius-lg);
          background: var(--accent-primary);
          color: var(--text-inverse);
          font-weight: 800;
          font-size: var(--text-md);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
        }

        .auth-button:hover {
          background: var(--accent-primary-hover);
          transform: translateY(-2px);
        }

        .auth-button:disabled {
          opacity: 0.6;
          transform: none;
        }

        .auth-divider {
          margin: 32px 0;
          position: relative;
          text-align: center;
        }

        .auth-divider::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--border-subtle);
        }

        .auth-divider span {
          position: relative;
          background: var(--bg-elevated);
          padding: 0 16px;
          font-size: var(--text-xs);
          color: var(--text-muted);
          font-weight: 500;
        }

        .auth-footer {
          margin-top: 8px;
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .auth-footer a {
          color: var(--accent-primary);
          font-weight: 700;
          text-decoration: none;
          margin-left: 6px;
        }
      `}</style>
    </div>
  );
}
