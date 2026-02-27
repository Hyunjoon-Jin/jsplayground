'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [fullName, setFullName] = useState('');

  // Status states
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Agreements
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [sensitiveAgreed, setSensitiveAgreed] = useState(false);

  const router = useRouter();

  const handleCheckEmail = async () => {
    if (!email || !email.includes('@')) {
      alert('유효한 이메일을 입력해주세요.');
      return;
    }

    setCheckingEmail(true);
    try {
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      setIsEmailChecked(true);
      if (data.exists) {
        setIsEmailAvailable(false);
        alert('이미 사용 중인 이메일입니다.');
      } else {
        setIsEmailAvailable(true);
        alert('사용 가능한 이메일입니다.');
      }
    } catch (err) {
      console.error(err);
      alert('이메일 중복 확인 중 오류가 발생했습니다.');
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailChecked || !isEmailAvailable) {
      setError('이메일 중복 확인이 필요합니다.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!privacyAgreed || !sensitiveAgreed) {
      setError('모든 필수 약관에 동의해야 가입이 가능합니다.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/login`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      router.push('/login');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card scrollable">
        <h1 className="auth-title">회원가입</h1>
        <p className="auth-subtitle">Life Controller에 오신 것을 환영합니다</p>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="fullName">이름</label>
            <input
              id="fullName"
              type="text"
              placeholder="실명을 입력하세요"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group email-group">
            <label htmlFor="email">이메일 주소</label>
            <div className="input-with-button">
              <input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailChecked(false);
                }}
                required
              />
              <button
                type="button"
                className={`check-btn ${isEmailChecked && isEmailAvailable ? 'available' : ''}`}
                onClick={handleCheckEmail}
                disabled={checkingEmail}
              >
                {checkingEmail ? '확인 중...' : isEmailChecked && isEmailAvailable ? '확인 완료' : '중복 확인'}
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                id="password"
                type="password"
                placeholder="8자 이상"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="passwordConfirm">비밀번호 확인</label>
              <input
                id="passwordConfirm"
                type="password"
                placeholder="한 번 더 입력"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="agreement-section">
            <div className="agreement-box">
              <label className="agreement-title">개인정보 수집 및 이용 동의 (필수)</label>
              <div className="agreement-text">
                {`본 서비스(Life Controller)는 회원님의 개인정보를 안전하게 처리하며, 관련 법령을 준수합니다.

1. 개인정보 수집 항목
- 필수항목: 이름, 이메일, 비밀번호
- 자동수집항목: 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보

2. 개인정보 수집 및 이용 목적
- 서비스 가입 의사 확인 및 회원 식별
- 일정 관리, 메모, 루틴 등 핵심 서비스 제공
- Life Report 등 맞춤형 데이터 분석 및 리포트 생성
- 서비스 개선을 위한 통계 분석 및 중요 공지사항 전달

3. 개인정보의 보유 및 이용 기간
- 회원 탈퇴 시까지 (탈퇴 후 즉시 파기)
- 관련 법령에 따라 보관이 필요한 경우 해당 기간 동안 별도 보관

4. 동의 거부 시 불이익
- 필수항목 수집에 동의하지 않으실 경우 서비스 이용이 제한될 수 있습니다.`}
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={privacyAgreed} onChange={(e) => setPrivacyAgreed(e.target.checked)} />
                <span>내용을 확인했으며 동의합니다.</span>
              </label>
            </div>

            <div className="agreement-box">
              <label className="agreement-title">민감정보 수집 및 이용 동의 (필수)</label>
              <div className="agreement-text">
                {`Life Controller는 정밀한 맞춤형 생활 관리 서비스를 제공하기 위해 아래와 같은 정보를 수집합니다.

1. 수집하는 민감정보 항목
- 사용자가 직접 입력한 일정 상세 및 메모 내용
- 운동 기록(종류, 강도) 및 식단 정보
- 기타 생활 습관 및 목표 달성 관련 데이터

2. 민감정보 수집 및 이용 목적
- 사용자 맞춤형 분석 서비스(Life Report) 제공
- AI 기반의 개인 맞춤 루틴 및 목표 추천
- 데이터 기반의 자기관리 피드백 제공

3. 민감정보의 보유 및 이용 기간
- 회원 탈퇴 시 또는 사용자가 해당 데이터를 직접 삭제할 때까지 보관

4. 동의 거부 시 불이익
- 동의하지 않으실 경우 데이터 분석 기반의 핵심 기능 이용이 제한됩니다.`}
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={sensitiveAgreed} onChange={(e) => setSensitiveAgreed(e.target.checked)} />
                <span>내용을 확인했으며 동의합니다.</span>
              </label>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button shadow-md" disabled={loading}>
            {loading ? '가입 중...' : '회원가입 완료'}
          </button>
        </form>

        <p className="auth-footer">
          이미 계정이 있으신가요? <Link href="/login">로그인 하기</Link>
        </p>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: var(--bg-base);
        }

        .auth-card {
          width: 100%;
          max-width: 500px;
          padding: 40px 30px;
          background: var(--bg-elevated);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
          text-align: center;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid var(--border-subtle);
        }

        .auth-title {
          font-size: var(--text-xl);
          font-weight: 800;
          margin-bottom: 8px;
          color: var(--text-primary);
          letter-spacing: -1px;
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
          margin-bottom: 18px;
        }

        .form-row {
          display: flex;
          gap: 12px;
        }

        .input-with-button {
          display: flex;
          gap: 8px;
        }

        label {
          display: block;
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 8px;
          margin-left: 2px;
        }

        input, select {
          width: 100%;
          padding: 14px 16px;
          border-radius: var(--radius-md);
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          color: var(--text-primary);
          font-size: var(--text-sm);
          transition: all 0.2s ease;
          outline: none;
        }

        input:focus, select:focus {
          background: var(--bg-elevated);
          border-color: var(--border-focus);
          box-shadow: 0 0 0 4px var(--accent-glow);
        }

        .check-btn {
          white-space: nowrap;
          padding: 0 16px;
          border-radius: var(--radius-md);
          background: var(--schedule-gray-text);
          color: var(--text-inverse);
          font-size: var(--text-xs);
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .check-btn.available {
          background: var(--success);
        }

        .check-btn:disabled {
          opacity: 0.6;
        }

        .agreement-section {
          margin-top: 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .agreement-box {
          background: var(--bg-surface);
          padding: 16px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-default);
        }

        .agreement-title {
          color: var(--text-primary);
          margin-bottom: 10px;
          font-size: var(--text-xs);
          font-weight: 800;
        }

        .agreement-text {
          height: 100px;
          overflow-y: auto;
          background: var(--bg-elevated);
          padding: 12px;
          border-radius: var(--radius-sm);
          font-size: var(--text-xs);
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 12px;
          white-space: pre-wrap;
          border: 1px solid var(--border-subtle);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--text-secondary);
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
          accent-color: var(--accent-primary);
        }

        .error-message {
          padding: 14px;
          border-radius: var(--radius-md);
          background: var(--error-bg);
          color: var(--error);
          font-size: var(--text-sm);
          font-weight: 600;
          margin: 20px 0;
          border: 1px solid var(--error-border);
          text-align: center;
        }

        .auth-button {
          width: 100%;
          padding: 16px;
          border-radius: var(--radius-md);
          background: var(--accent-primary);
          color: var(--text-inverse);
          font-weight: 800;
          font-size: var(--text-base);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 12px;
        }

        .auth-button:hover {
          background: var(--accent-primary-hover);
          transform: translateY(-2px);
        }

        .auth-button:disabled {
          opacity: 0.6;
          transform: none;
        }

        .auth-footer {
          margin-top: 28px;
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .auth-footer a {
          color: var(--accent-primary);
          font-weight: 700;
          text-decoration: none;
          margin-left: 4px;
        }

        .auth-card::-webkit-scrollbar, .agreement-text::-webkit-scrollbar {
          width: 5px;
        }
        .auth-card::-webkit-scrollbar-thumb, .agreement-text::-webkit-scrollbar-thumb {
          background: var(--border-default);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
