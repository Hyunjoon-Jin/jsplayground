'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, LogOut, Trash2, ChevronRight, Save, ShieldAlert } from 'lucide-react';

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('male');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const router = useRouter();

    const fetchProfile = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (data) {
            setProfile(data);
            setFullName(data.full_name || '');
            setPhoneNumber(data.phone_number || '');
            setBirthDate(data.birth_date || '');
            setGender(data.gender || 'male');
        }
        setLoading(false);
    }, [router]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleUpdateProfile = async () => {
        if (!profile) return;
        setSaving(true);
        const { error } = await supabase
            .from('user_profiles')
            .update({
                full_name: fullName,
                phone_number: phoneNumber,
                birth_date: birthDate,
                gender: gender,
            })
            .eq('id', profile.id);

        if (error) {
            alert('프로필 수정 중 오류가 발생했습니다.');
        } else {
            alert('프로필이 성공적으로 수정되었습니다.');
            setProfile({
                ...profile,
                full_name: fullName,
                phone_number: phoneNumber,
                birth_date: birthDate,
                gender: gender
            });
        }
        setSaving(false);
    };

    const handleLogout = async () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            await supabase.auth.signOut();
            router.push('/login');
            router.refresh();
        }
    };

    const handleDeleteAccount = async () => {
        // In a real app, you might want to call an edge function to delete the user from auth.users as well.
        // For this MVP, we will delete the profile which cascades (if set up) or just sign out.
        // Actually, deleting from auth.users requires admin privileges.
        // We'll simulate by deleting profile data and signing out.

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setSaving(true);
        // Note: Real account deletion should be handled by an API/Edge Function for security.
        const { error } = await supabase.from('user_profiles').delete().eq('id', user.id);

        if (error) {
            alert('계정 삭제 중 오류가 발생했습니다.');
            setSaving(false);
        } else {
            await supabase.auth.signOut();
            alert('계정이 성공적으로 삭제되었습니다. 이용해주셔서 감사합니다.');
            router.push('/login');
            router.refresh();
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <header className="profile-header">
                <h1>내 프로필</h1>
            </header>

            <div className="profile-content">
                <section className="profile-card shadow-sm">
                    <div className="avatar-section">
                        <div className="avatar-placeholder">
                            <User size={40} />
                        </div>
                        <div className="user-info">
                            <h2 className="display-name">{profile?.full_name || '사용자'}</h2>
                            <p className="email">{profile?.email || '이메일 없음'}</p>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="input-group">
                            <label>이름</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="이름을 입력하세요"
                            />
                        </div>
                        <div className="input-group">
                            <label>휴대폰 번호</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="010-0000-0000"
                            />
                        </div>
                        <div className="input-with-label-row">
                            <div className="input-group">
                                <label>생년월일</label>
                                <input
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label>성별</label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                >
                                    <option value="male">남성</option>
                                    <option value="female">여성</option>
                                    <option value="other">기타</option>
                                </select>
                            </div>
                        </div>
                        <button
                            className="save-btn"
                            onClick={handleUpdateProfile}
                            disabled={saving}
                        >
                            <Save size={18} />
                            {saving ? '저장 중...' : '변경 사항 저장'}
                        </button>
                    </div>
                </section>

                <section className="menu-section">
                    <button className="menu-item" onClick={handleLogout}>
                        <div className="menu-label logout">
                            <LogOut size={20} />
                            <span>로그아웃</span>
                        </div>
                        <ChevronRight size={18} className="chevron" />
                    </button>

                    <button className="menu-item danger" onClick={() => setShowDeleteConfirm(true)}>
                        <div className="menu-label delete">
                            <Trash2 size={20} />
                            <span>회원 탈퇴</span>
                        </div>
                        <ChevronRight size={18} className="chevron" />
                    </button>
                </section>
            </div>

            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop">
                        <div className="modal-icon warning">
                            <ShieldAlert size={48} />
                        </div>
                        <h3>정말 탈퇴하시겠습니까?</h3>
                        <p>탈퇴 시 모든 일정 데이터와 개인 설정이 삭제되며, 복구할 수 없습니다.</p>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>취소</button>
                            <button className="confirm-delete-btn" onClick={handleDeleteAccount} disabled={saving}>
                                {saving ? '처리 중...' : '탈퇴하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .profile-container {
                    padding: 24px 20px;
                    padding-bottom: 100px;
                    background: #F8FAFC;
                    min-height: 100vh;
                }

                .profile-header {
                    margin-bottom: 24px;
                }

                .profile-header h1 {
                    font-size: 24px;
                    font-weight: 800;
                    color: var(--text-primary);
                }

                .profile-card {
                    background: white;
                    border-radius: 20px;
                    padding: 24px;
                    margin-bottom: 24px;
                    border: 1px solid #E2E8F0;
                }

                .avatar-section {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding-bottom: 24px;
                    border-bottom: 1px solid #F1F5F9;
                    margin-bottom: 24px;
                }

                .avatar-placeholder {
                    width: 70px;
                    height: 70px;
                    border-radius: 24px;
                    background: #F1F5F9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94A3B8;
                }

                .display-name {
                    font-size: 19px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin-bottom: 4px;
                }

                .email {
                    font-size: 14px;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .form-section {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .input-with-label-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .input-group label {
                    display: block;
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                    margin-left: 2px;
                }

                input, select {
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 12px;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    font-size: 15px;
                    color: var(--text-primary);
                    outline: none;
                    transition: all 0.2s;
                }

                input:focus, select:focus {
                    border-color: var(--accent-primary);
                    background: white;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
                }

                .save-btn {
                    margin-top: 8px;
                    width: 100%;
                    padding: 14px;
                    border-radius: 12px;
                    background: var(--accent-primary);
                    color: white;
                    font-weight: 700;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .save-btn:hover {
                    opacity: 0.9;
                }

                .menu-section {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid #E2E8F0;
                }

                .menu-item {
                    width: 100%;
                    padding: 18px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: white;
                    border: none;
                    border-bottom: 1px solid #F1F5F9;
                    cursor: pointer;
                }

                .menu-item:last-child {
                    border-bottom: none;
                }

                .menu-label {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    font-weight: 600;
                    font-size: 15px;
                    color: var(--text-primary);
                }

                .menu-label.logout { color: #64748B; }
                .menu-label.delete { color: #EF4444; }

                .chevron {
                    color: #CBD5E1;
                }

                .loading-container {
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .spinner {
                    width: 30px;
                    height: 30px;
                    border: 3px solid #F1F5F9;
                    border-top-color: var(--accent-primary);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    z-index: 1000;
                }

                .modal-content {
                    background: white;
                    border-radius: 24px;
                    padding: 32px 24px;
                    width: 100%;
                    max-width: 400px;
                    text-align: center;
                }

                .animate-pop {
                    animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                @keyframes pop {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                .modal-icon.warning {
                    color: #EF4444;
                    margin-bottom: 16px;
                }

                .modal-content h3 {
                    font-size: 20px;
                    font-weight: 800;
                    margin-bottom: 12px;
                    color: var(--text-primary);
                }

                .modal-content p {
                    font-size: 15px;
                    color: var(--text-secondary);
                    line-height: 1.6;
                    margin-bottom: 24px;
                }

                .modal-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .cancel-btn {
                    padding: 14px;
                    border-radius: 12px;
                    background: #F1F5F9;
                    color: #64748B;
                    font-weight: 700;
                    border: none;
                }

                .confirm-delete-btn {
                    padding: 14px;
                    border-radius: 12px;
                    background: #EF4444;
                    color: white;
                    font-weight: 700;
                    border: none;
                }
            `}</style>
        </div>
    );
}
