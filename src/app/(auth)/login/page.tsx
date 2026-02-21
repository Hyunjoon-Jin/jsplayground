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
          background: #FFFFFF;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 48px 32px;
          background: #FFFFFF;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
          text-align: center;
          border: 1px solid #F1F5F9;
        }

        .auth-title {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
          color: #1E293B;
          letter-spacing: -1px;
        }

        .auth-subtitle {
          font-size: 15px;
          color: #64748B;
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
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 10px;
          margin-left: 2px;
        }

        .form-group input {
          width: 100%;
          padding: 16px;
          border-radius: 14px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          color: #1E293B;
          font-size: 16px;
          transition: all 0.25s ease;
          outline: none;
        }

        .form-group input:focus {
          background: #FFFFFF;
          border-color: #3B82F6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .error-message {
          padding: 14px;
          border-radius: 12px;
          background: #FEF2F2;
          color: #EF4444;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
          border: 1px solid #FEE2E2;
          text-align: center;
        }

        .auth-button {
          width: 100%;
          padding: 18px;
          border-radius: 16px;
          background: #3B82F6;
          color: white;
          font-weight: 800;
          font-size: 17px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
        }

        .auth-button:hover {
          background: #2563EB;
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
          background: #F1F5F9;
        }

        .auth-divider span {
          position: relative;
          background: #FFFFFF;
          padding: 0 16px;
          font-size: 13px;
          color: #94A3B8;
          font-weight: 500;
        }

        .auth-footer {
          margin-top: 8px;
          font-size: 15px;
          color: #64748B;
        }

        .auth-footer a {
          color: #3B82F6;
          font-weight: 700;
          text-decoration: none;
          margin-left: 6px;
        }
      `}</style>
    </div>
  );
}
