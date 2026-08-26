/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Tablet } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { ParentPanel } from './components/ParentPanel';
import { KidSandbox } from './components/KidSandbox';
import { AdminPanel } from './components/AdminPanel';
import { SqlSchemaViewer } from './components/SqlSchemaViewer';
import { SecurityUnlockModal } from './components/SecurityUnlockModal';
import { PrivacyDataModal } from './components/PrivacyDataModal';
import { 
  User, 
  ChildProfile, 
  AllowedApp, 
  ActivityLog, 
  ParentNotification, 
  UnlockMethod,
  UserRole 
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_CHILDREN, 
  DEFAULT_ALLOWED_APPS, 
  INITIAL_LOGS, 
  INITIAL_NOTIFICATIONS 
} from './data/initialData';

export default function App() {
  // 1. Current User State (Default to 'fetahne' for instant access)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kidsafe_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_USERS[0]; // fetahne (Admin)
  });

  // 2. Users / Participants List State
  const [usersList, setUsersList] = useState<User[]>(() => {
    const saved = localStorage.getItem('kidsafe_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_USERS;
  });

  // 3. Children Profiles State
  const [childrenList, setChildrenList] = useState<ChildProfile[]>(() => {
    const saved = localStorage.getItem('kidsafe_children');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CHILDREN;
  });

  const [activeChildId, setActiveChildId] = useState<string>(() => {
    return INITIAL_CHILDREN[0]?.id || 'child-can';
  });

  // 4. Allowed Apps List
  const [allowedAppsList, setAllowedAppsList] = useState<AllowedApp[]>(() => {
    const saved = localStorage.getItem('kidsafe_allowed_apps');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_ALLOWED_APPS;
  });

  // 5. Activity Logs State
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('kidsafe_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_LOGS;
  });

  // 6. Parent Notifications State
  const [notifications, setNotifications] = useState<ParentNotification[]>(() => {
    const saved = localStorage.getItem('kidsafe_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_NOTIFICATIONS;
  });

  // 7. Navigation View State
  const [activeView, setActiveView] = useState<'PARENT' | 'KID' | 'ADMIN' | 'SQL'>('PARENT');

  // 8. Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // 9. Remote message from parent to kid
  const [remoteMessage, setRemoteMessage] = useState<string | null>(null);

  // Filtered children based on current user:
  // Admin sees all children; regular parents only see their own children
  const availableChildren = currentUser?.role === 'ADMIN'
    ? childrenList
    : currentUser
      ? childrenList.filter(c => c.parentId === currentUser.id)
      : [];

  const activeChild = availableChildren.find(c => c.id === activeChildId) || availableChildren[0] || null;

  // Active child ID sync when user or children list changes
  useEffect(() => {
    if (availableChildren.length > 0) {
      if (!availableChildren.some(c => c.id === activeChildId)) {
        setActiveChildId(availableChildren[0].id);
      }
    } else {
      setActiveChildId('');
    }
  }, [currentUser?.id, availableChildren.length]);

  // Security guard: Non-admin users cannot access the ADMIN view
  useEffect(() => {
    if (activeView === 'ADMIN' && currentUser?.role !== 'ADMIN') {
      setActiveView('PARENT');
    }
  }, [currentUser?.role, activeView]);

  // Filter notifications so parents only see notifications for their children
  const userChildIds = new Set(availableChildren.map(c => c.id));
  const visibleNotifications = currentUser?.role === 'ADMIN'
    ? notifications
    : notifications.filter(n => userChildIds.has(n.childId));

  // Persistence to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kidsafe_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('kidsafe_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('kidsafe_users', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('kidsafe_children', JSON.stringify(childrenList));
  }, [childrenList]);

  useEffect(() => {
    localStorage.setItem('kidsafe_allowed_apps', JSON.stringify(allowedAppsList));
  }, [allowedAppsList]);

  useEffect(() => {
    localStorage.setItem('kidsafe_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('kidsafe_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Log Helper
  const logAction = (
    actionType: ActivityLog['actionType'],
    details: string,
    severity: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS' = 'INFO'
  ) => {
    const currentActive = availableChildren.find(c => c.id === activeChildId) || activeChild;
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id,
      childId: currentActive?.id,
      childName: currentActive?.name || 'Sistem',
      actionType,
      details,
      severity,
      ipAddress: '176.240.12.84',
      deviceInfo: currentActive ? currentActive.deviceName : 'Ebeveyn Portalı',
    };
    setActivityLogs(prev => [newLog, ...prev]);

    // Send simulated parent notification if configured
    if (currentActive && (actionType === 'SESSION_START' || actionType === 'SESSION_END' || actionType === 'UNAUTHORIZED_ATTEMPT')) {
      const isStart = actionType === 'SESSION_START';
      const newNotif: ParentNotification = {
        id: `notif-${Date.now()}`,
        childId: currentActive.id,
        childName: currentActive.name,
        type: actionType as any,
        title: isStart ? '📱 Cihaz Açılış Bildirimi' : actionType === 'UNAUTHORIZED_ATTEMPT' ? '⚠️ Engellenen İçerik Bildirimi' : '⏱️ Oturum Kapanış Bildirimi',
        message: `${currentActive.name}: ${details}`,
        channel: currentActive.notificationChannel === 'SMS' ? 'SMS' : 'EMAIL',
        recipient: currentActive.notificationChannel === 'SMS' ? currentActive.parentPhone : currentActive.parentEmail,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    logAction('LOGIN', `${user.fullName} (${user.username}) sisteme giriş yaptı.`, 'SUCCESS');
  };

  const handleLogout = () => {
    if (currentUser) {
      logAction('LOGOUT', `${currentUser.fullName} sistemden çıkış yaptı.`, 'INFO');
    }
    setCurrentUser(null);
  };

  const handleRegister = (newUser: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'childrenCount'>) => {
    const createdUser: User = {
      ...newUser,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      childrenCount: 0,
      role: 'PARENT', // Registering from outside always creates a standard PARENT account
    };
    setUsersList(prev => [...prev, createdUser]);
    setCurrentUser(createdUser);
    setActiveView('PARENT');
    logAction('LOGIN', `Yeni ebeveyn kayıt oldu: ${createdUser.username}.`, 'SUCCESS');
  };

  // Children Profile Handlers
  const handleUpdateChild = (updatedChild: ChildProfile) => {
    setChildrenList(prev => prev.map(c => c.id === updatedChild.id ? updatedChild : c));
  };

  const handleAddChild = (newChildData: Omit<ChildProfile, 'id'>) => {
    const newChild: ChildProfile = {
      ...newChildData,
      id: `child-${Date.now()}`,
      parentId: currentUser?.id || 'user-admin-fetahne',
    };
    setChildrenList(prev => [...prev, newChild]);
    setActiveChildId(newChild.id);

    // Update user's childrenCount
    if (currentUser) {
      setUsersList(prev => prev.map(u => u.id === currentUser.id ? { ...u, childrenCount: u.childrenCount + 1 } : u));
    }

    logAction('SETTINGS_CHANGED', `Yeni çocuk profili oluşturuldu: ${newChild.name} (${newChild.age} Yaş, ${newChild.dailyTimeLimitMinutes} dk).`, 'SUCCESS');
  };

  const handleDeleteChild = (id: string) => {
    const childToDelete = childrenList.find(c => c.id === id);
    setChildrenList(prev => prev.filter(c => c.id !== id));
    if (activeChildId === id && availableChildren.length > 1) {
      const remaining = availableChildren.filter(c => c.id !== id);
      if (remaining.length > 0) {
        setActiveChildId(remaining[0].id);
      }
    }
    if (childToDelete) {
      logAction('SETTINGS_CHANGED', `${childToDelete.name} çocuk profili silindi.`, 'WARNING');
    }
  };

  // Custom App
  const handleAddCustomApp = (newApp: Omit<AllowedApp, 'id'>) => {
    const createdApp: AllowedApp = {
      ...newApp,
      id: `app-custom-${Date.now()}`,
    };
    setAllowedAppsList(prev => [...prev, createdApp]);
    // Automatically add to active child
    const current = childrenList.find(c => c.id === activeChildId);
    if (current) {
      handleUpdateChild({
        ...current,
        allowedApps: [...current.allowedApps, createdApp.id],
      });
    }
    logAction('SETTINGS_CHANGED', `Yeni özel izinli uygulama eklendi: "${createdApp.name}".`, 'SUCCESS');
  };

  // Remote Control Handlers
  const handleSendRemoteMessage = (msg: string) => {
    setRemoteMessage(msg);
    const active = availableChildren.find(c => c.id === activeChildId) || activeChild;
    logAction('TIME_EXTENDED', `Ebeveyn ${active?.name || 'Çocuğa'} anlık mesaj gönderdi: "${msg}".`, 'INFO');
  };

  const handleExtendChildTime = (minutes: number) => {
    const active = availableChildren.find(c => c.id === activeChildId) || activeChild;
    if (!active) return;
    const updated = {
      ...active,
      dailyTimeLimitMinutes: active.dailyTimeLimitMinutes + minutes,
      isLocked: false,
    };
    handleUpdateChild(updated);
    logAction('TIME_EXTENDED', `${active.name} için +${minutes} dakika ek süre tanımlandı.`, 'SUCCESS');
  };

  const handleToggleLockChild = () => {
    const active = availableChildren.find(c => c.id === activeChildId) || activeChild;
    if (!active) return;
    const nextLocked = !active.isLocked;
    const updated = { ...active, isLocked: nextLocked };
    handleUpdateChild(updated);
    logAction('REMOTE_LOCK', `${active.name} cihazı ebeveyn tarafından ${nextLocked ? 'KİLİTLENDİ' : 'AÇILDI'}.`, nextLocked ? 'ALERT' : 'SUCCESS');
  };

  // Admin User Role & Status updates
  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    logAction('SETTINGS_CHANGED', `Kullanıcı rolü güncellendi: ${userId} -> ${newRole}`, 'WARNING');
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        logAction('SETTINGS_CHANGED', `Kullanıcı durumu değiştirildi: ${u.username} -> ${nextStatus}`, 'WARNING');
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  // Export All Data (Takeout)
  const handleExportAllData = () => {
    const exportData = {
      user: currentUser,
      children: availableChildren,
      allowedApps: allowedAppsList,
      logs: activityLogs,
      notifications: visibleNotifications,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kidsafe-tam-veri-yedegi-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        notifications={visibleNotifications}
        onMarkNotificationRead={(id) => {
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        }}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onTriggerKidLock={() => setIsUnlockModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'PARENT' && (
          <ParentPanel
            currentUser={currentUser}
            childrenList={availableChildren}
            activeChildId={activeChildId}
            onSelectChild={setActiveChildId}
            onUpdateChild={handleUpdateChild}
            onAddChild={handleAddChild}
            onDeleteChild={handleDeleteChild}
            allowedAppsList={allowedAppsList}
            onAddCustomApp={handleAddCustomApp}
            onSendRemoteMessage={handleSendRemoteMessage}
            onExtendChildTime={handleExtendChildTime}
            onToggleLockChild={handleToggleLockChild}
            onLogAction={logAction}
          />
        )}

        {activeView === 'KID' && (
          activeChild ? (
            <KidSandbox
              activeChild={activeChild}
              allowedAppsList={allowedAppsList}
              onOpenParentUnlock={() => setIsUnlockModalOpen(true)}
              onSessionEnd={() => {
                logAction('SESSION_END', `${activeChild.name} oturumu sonlandırdı.`, 'INFO');
                setActiveView('PARENT');
              }}
              onLogAction={logAction}
              remoteMessage={remoteMessage}
              onClearRemoteMessage={() => setRemoteMessage(null)}
            />
          ) : (
            <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-center">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                <Tablet className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Çocuk Cihaz Modu İçin Profil Bulunamadı</h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Çocuk cihaz modunu başlatabilmek için lütfen önce ebeveyn panelinden bir çocuk profili ekleyin.
              </p>
              <button
                onClick={() => setActiveView('PARENT')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Ebeveyn Paneline Dön
              </button>
            </div>
          )
        )}

        {activeView === 'ADMIN' && currentUser?.role === 'ADMIN' && (
          <AdminPanel
            usersList={usersList}
            onUpdateUserRole={handleUpdateUserRole}
            onToggleUserStatus={handleToggleUserStatus}
            activityLogs={activityLogs}
            onViewSqlSchema={() => setActiveView('SQL')}
          />
        )}

        {activeView === 'SQL' && (
          <SqlSchemaViewer />
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        existingUsers={usersList}
      />

      {activeChild && (
        <SecurityUnlockModal
          isOpen={isUnlockModalOpen}
          onClose={() => setIsUnlockModalOpen(false)}
          childProfile={activeChild}
          onUnlockSuccess={(method) => {
            logAction('PIN_VERIFIED', `${activeChild.name} cihazında ebeveyn kilidi (${method}) ile açıldı.`, 'SUCCESS');
            setActiveView('PARENT');
          }}
          onLogAction={logAction}
        />
      )}

      <PrivacyDataModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onExportAllData={handleExportAllData}
      />

    </div>
  );
}

