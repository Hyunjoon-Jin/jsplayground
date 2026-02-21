'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('male');

  // Agreements
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [sensitiveAgreed, setSensitiveAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

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
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          birth_date: birthDate,
          gender: gender
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
      <div className="auth-card glass scrollable">
        <h1 className="auth-title">회원가입</h1>
        <p className="auth-subtitle">일정 관리를 위한 회원 정보를 입력해주세요</p>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="fullName">이름 (실명)</label>
            <input
              id="fullName"
              type="text"
              placeholder="홍길동"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

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
              placeholder="8자 이상 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">휴대폰 번호</label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="010-0000-0000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="birthDate">생년월일</label>
              <input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender">성별</label>
              <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="other">기타</option>
              </select>
            </div>
          </div>

          <div className="agreement-section">
            <div className="agreement-box">
              <label className="agreement-title">개인정보 수집 및 이용 동의 (필수)</label>
              <div className="agreement-text">
                본 서비스는 회원가입 및 서비스 제공을 위해 아래와 같이 개인정보를 수집합니다.
                1. 수집 항목: 이름, 이메일, 연락처, 생년월일, 성별
                2. 수집 목적: 회원 식별, 일정 관리 서비스 제공, 공지사항 전달
                3. 보유 기간: 회원 탈퇴 시까지나 법정 보유 기간 동안 보관합니다.
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={privacyAgreed} onChange={(e) => setPrivacyAgreed(e.target.checked)} />
                <span>내용을 확인했으며 동의합니다.</span>
              </label>
            </div>

            <div className="agreement-box">
              <label className="agreement-title">민감정보 수집 및 이용 동의 (필수)</label>
              <div className="agreement-text">
                본 서비스는 캘린더 일정(건강, 일정 상세 등)에 포함될 수 있는 민감정보를 처리할 수 있습니다.
                1. 수집 항목: 사용자가 일정에 기입한 모든 세부 내용
                2. 수집 목적: 개인별 맞춤 일정 관리 및 알림 서비스 제공
                3. 보유 기간: 본인 삭제 시 또는 회원 탈퇴 시까지
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={sensitiveAgreed} onChange={(e) => setSensitiveAgreed(e.target.checked)} />
                <span>내용을 확인했으며 동의합니다.</span>
              </label>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button shadow-glow" disabled={loading}>
            {loading ? '가입 중...' : '회원가입 하기'}
          </button>
        </form>

        <p className="auth-footer">
          이미 계정이 있으신가요? <Link href="/login">로그인</Link>
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
                    padding: 40px;
                    border-radius: var(--radius-lg);
                    text-align: center;
                    max-height: 90vh;
                    overflow-y: auto;
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
                    flex: 1;
                }

                .form-row {
                    display: flex;
                    gap: 16px;
                }

                label {
                    display: block;
                    font-size: var(--text-xs);
                    font-weight: var(--weight-medium);
                    color: var(--text-muted);
                    margin-bottom: 8px;
                    text-transform: uppercase;
                }

                input, select {
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: var(--radius-md);
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border-subtle);
                    color: var(--text-primary);
                    transition: all 0.2s ease;
                }

                input:focus, select:focus {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: var(--accent-primary);
                }

                .agreement-section {
                    margin-top: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .agreement-box {
                    background: rgba(255, 255, 255, 0.02);
                    padding: 16px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-subtle);
                }

                .agreement-title {
                    color: var(--text-primary);
                    margin-bottom: 8px;
                    font-size: var(--text-sm);
                }

                .agreement-text {
                    height: 100px;
                    overflow-y: auto;
                    background: rgba(0,0,0,0.2);
                    padding: 10px;
                    border-radius: var(--radius-sm);
                    font-size: 11px;
                    color: var(--text-muted);
                    line-height: 1.6;
                    margin-bottom: 12px;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-size: var(--text-xs);
                    color: var(--text-secondary);
                    text-transform: none;
                }

                .checkbox-label input {
                    width: auto;
                }

                .error-message {
                    padding: 12px;
                    border-radius: var(--radius-sm);
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--error);
                    font-size: var(--text-sm);
                    margin: 20px 0;
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

                /* Scrollbar styling for the card and agreement text */
                .auth-card::-webkit-scrollbar, .agreement-text::-webkit-scrollbar {
                    width: 4px;
                }
                .auth-card::-webkit-scrollbar-thumb, .agreement-text::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
            `}</style>
    </div>
  );
}
