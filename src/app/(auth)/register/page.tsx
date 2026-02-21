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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('male');

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

          <div className="form-row">
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
            <div className="form-group">
              <label htmlFor="gender">성별</label>
              <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="other">기타</option>
              </select>
            </div>
          </div>

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

          <div className="agreement-section">
            <div className="agreement-box">
              <label className="agreement-title">개인정보 수집 및 이용 동의 (필수)</label>
              <div className="agreement-text">
                {`본 서비스(Life Controller)는 회원님의 개인정보를 안전하게 처리하며, 관련 법령을 준수합니다.

1. 개인정보 수집 항목
- 필수항목: 이름, 이메일, 비밀번호, 연락처, 생년월일, 성별
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
          background: #FFFFFF;
        }

        .auth-card {
          width: 100%;
          max-width: 500px;
          padding: 40px 30px;
          background: #FFFFFF;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
          text-align: center;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid #F1F5F9;
        }

        .auth-title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 8px;
          color: #1E293B;
          letter-spacing: -1px;
        }

        .auth-subtitle {
          font-size: 14px;
          color: #64748B;
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
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 8px;
          margin-left: 2px;
        }

        input, select {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          color: #1E293B;
          font-size: 15px;
          transition: all 0.2s ease;
          outline: none;
        }

        input:focus, select:focus {
          background: #FFFFFF;
          border-color: #3B82F6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .check-btn {
          white-space: nowrap;
          padding: 0 16px;
          border-radius: 12px;
          background: #334155;
          color: white;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .check-btn.available {
          background: #10B981;
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
          background: #F8FAFC;
          padding: 16px;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
        }

        .agreement-title {
          color: #1E293B;
          margin-bottom: 10px;
          font-size: 13px;
          font-weight: 800;
        }

        .agreement-text {
          height: 100px;
          overflow-y: auto;
          background: #FFFFFF;
          padding: 12px;
          border-radius: 8px;
          font-size: 11px;
          color: #64748B;
          line-height: 1.6;
          margin-bottom: 12px;
          white-space: pre-wrap;
          border: 1px solid #F1F5F9;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
          accent-color: #3B82F6;
        }

        .error-message {
          padding: 14px;
          border-radius: 12px;
          background: #FEF2F2;
          color: #EF4444;
          font-size: 14px;
          font-weight: 600;
          margin: 20px 0;
          border: 1px solid #FEE2E2;
          text-align: center;
        }

        .auth-button {
          width: 100%;
          padding: 16px;
          border-radius: 14px;
          background: #3B82F6;
          color: white;
          font-weight: 800;
          font-size: 16px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 12px;
        }

        .auth-button:hover {
          background: #2563EB;
          transform: translateY(-2px);
        }

        .auth-button:disabled {
          opacity: 0.6;
          transform: none;
        }

        .auth-footer {
          margin-top: 28px;
          font-size: 14px;
          color: #64748B;
        }

        .auth-footer a {
          color: #3B82F6;
          font-weight: 700;
          text-decoration: none;
          margin-left: 4px;
        }

        .auth-card::-webkit-scrollbar, .agreement-text::-webkit-scrollbar {
          width: 5px;
        }
        .auth-card::-webkit-scrollbar-thumb, .agreement-text::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
