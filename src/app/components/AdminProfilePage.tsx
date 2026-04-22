import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, Camera, Check, Loader2, Menu, User } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useAppContext } from './AppContext';
import { AdminNavPanel } from './AdminNavPanel';
import { updateUserProfile } from '../services/auth';
import { toast } from 'sonner';

type PermissionStatus = 'unknown' | 'granted' | 'denied';

const RECENT_PROFILE_IMAGE_KEY = 'bjc_admin_recent_profile_image';

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image data.'));
    reader.readAsDataURL(blob);
  });
}

function normalizePermission(value?: string): PermissionStatus {
  if (value === 'granted' || value === 'limited') return 'granted';
  if (value === 'denied') return 'denied';
  return 'unknown';
}

export function AdminProfilePage() {
  const navigate = useNavigate();
  const { firebaseUser, userProfile, updateUserProfileLocal, authLoading } = useAppContext();

  const [showNavPanel, setShowNavPanel] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('unknown');

  useEffect(() => {
    if (authLoading) return;
    if (userProfile?.role !== 'ADMIN') {
      navigate('/home', { replace: true });
    }
  }, [authLoading, userProfile, navigate]);

  useEffect(() => {
    if (userProfile?.profileImage) {
      setProfileImage(userProfile.profileImage);
      try {
        localStorage.setItem(RECENT_PROFILE_IMAGE_KEY, userProfile.profileImage);
      } catch {
        // Ignore storage errors.
      }
      return;
    }

    setProfileImage('');
  }, [userProfile]);

  const fallbackToRecentProfileImage = () => {
    try {
      const recent = localStorage.getItem(RECENT_PROFILE_IMAGE_KEY) ?? '';
      if (recent) {
        setProfileImage(recent);
        updateUserProfileLocal({ profileImage: recent });
        return;
      }
    } catch {
      // Ignore localStorage errors.
    }

    setProfileImage(userProfile?.profileImage ?? '');
  };

  const readGalleryPermission = async (): Promise<PermissionStatus> => {
    if (!Capacitor.isNativePlatform()) return 'granted';

    const permission = await CapacitorCamera.checkPermissions();
    return normalizePermission(permission.photos ?? permission.camera);
  };

  const requestGalleryPermission = async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      setPermissionStatus('granted');
      return true;
    }

    try {
      const permission = await CapacitorCamera.requestPermissions();
      const status = normalizePermission(permission.photos ?? permission.camera);
      setPermissionStatus(status);
      return status === 'granted';
    } catch {
      setPermissionStatus('denied');
      return false;
    }
  };

  useEffect(() => {
    const syncPermission = async () => {
      try {
        const status = await readGalleryPermission();
        setPermissionStatus(status);
      } catch {
        setPermissionStatus('unknown');
      }
    };

    void syncPermission();
  }, []);

  const saveProfileImage = async (imageData: string) => {
    if (!firebaseUser) return;

    setSavingProfile(true);
    try {
      setProfileImage(imageData);
      await updateUserProfile(firebaseUser.uid, { profileImage: imageData });
      updateUserProfileLocal({ profileImage: imageData });

      try {
        localStorage.setItem(RECENT_PROFILE_IMAGE_KEY, imageData);
      } catch {
        // Ignore storage errors.
      }

      toast.success('Profile picture updated');
    } catch {
      toast.error('Failed to update profile picture');
    } finally {
      setSavingProfile(false);
    }
  };

  const pickImageFromGallery = async () => {
    if (savingProfile) return;

    if (Capacitor.isNativePlatform()) {
      let status = permissionStatus;
      if (status !== 'granted') {
        const granted = await requestGalleryPermission();
        status = granted ? 'granted' : 'denied';
      }

      if (status !== 'granted') {
        fallbackToRecentProfileImage();
        toast.error('Gallery permission denied. Showing recent photo if available.');
        return;
      }

      setSavingProfile(true);
      try {
        const photo = await CapacitorCamera.getPhoto({
          source: CameraSource.Photos,
          resultType: CameraResultType.Uri,
          quality: 85,
        });

        if (!photo.webPath) {
          throw new Error('Missing image path.');
        }

        const response = await fetch(photo.webPath);
        const blob = await response.blob();
        if (blob.size > 5 * 1024 * 1024) {
          toast.error('Image must be less than 5MB');
          return;
        }

        const base64 = await toDataUrl(blob);
        await saveProfileImage(base64);
      } catch {
        toast.error('Failed to pick image from gallery');
      } finally {
        setSavingProfile(false);
      }

      return;
    }

    toast.message('Gallery picker is optimized for Android build.');
  };

  const removeProfileImage = async () => {
    if (!firebaseUser) return;

    setSavingProfile(true);
    try {
      await updateUserProfile(firebaseUser.uid, { profileImage: '' });
      updateUserProfileLocal({ profileImage: '' });
      setProfileImage('');
      try {
        localStorage.removeItem(RECENT_PROFILE_IMAGE_KEY);
      } catch {
        // Ignore storage errors.
      }
      toast.success('Profile picture removed');
    } catch {
      toast.error('Failed to remove profile picture');
    } finally {
      setSavingProfile(false);
    }
  };

  if (authLoading || userProfile?.role !== 'ADMIN') {
    return (
      <div className="px-4 pt-10 pb-6 flex items-center justify-center">
        <Loader2 size={28} color="#00704A" className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-10 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={() => setShowNavPanel(true)}
          aria-label="Open admin menu"
          className="flex items-center justify-center w-10 h-10 rounded-full text-[#362415] cursor-pointer hover:bg-[#F2F2F2] transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-[22px] text-[#362415]" style={{ fontWeight: 700 }}>Admin Profile</h1>
      </div>
      <p className="text-[13px] text-[#757575] mt-0.5 mb-4">Profile and permissions</p>

      <div className="bg-white rounded-[16px] p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="flex flex-col items-center mb-6 pt-1">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-[#E8F5E9] overflow-hidden flex items-center justify-center border-4 border-white" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} color="#00704A" />
              )}
            </div>
            <button
              onClick={pickImageFromGallery}
              disabled={savingProfile}
              className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-[#00704A] flex items-center justify-center cursor-pointer"
              style={{ boxShadow: '0 3px 10px rgba(0,112,74,0.4)' }}
            >
              {savingProfile ? (
                <Loader2 size={18} color="white" className="animate-spin" />
              ) : (
                <Camera size={18} color="white" />
              )}
            </button>
          </div>
          <p className="text-[13px] text-[#757575] mt-4" style={{ fontWeight: 500 }}>
            Tap camera to open gallery
          </p>
        </div>

        <div className="rounded-[14px] bg-[#F8F8F8] p-4 mb-4 border border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              permissionStatus === 'granted'
                ? 'bg-[#E8F5E9]'
                : permissionStatus === 'denied'
                ? 'bg-[#FFEBEE]'
                : 'bg-[#FFF8E1]'
            }`}>
              {permissionStatus === 'granted' ? (
                <Check size={20} color="#2E7D32" />
              ) : permissionStatus === 'denied' ? (
                <AlertCircle size={20} color="#D32F2F" />
              ) : (
                <Camera size={20} color="#F59E0B" />
              )}
            </div>
            <div>
              <p className="text-[14px] text-[#362415]" style={{ fontWeight: 600 }}>Gallery Permission</p>
              <p className="text-[12px] text-[#757575]">
                {permissionStatus === 'granted'
                  ? 'Enabled'
                  : permissionStatus === 'denied'
                  ? 'Not approved'
                  : 'Checking permission'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="rounded-[12px] bg-[#F8F8F8] px-4 py-3 border border-[rgba(0,0,0,0.06)]">
            <p className="text-[11px] text-[#757575] uppercase tracking-wide" style={{ fontWeight: 600 }}>Name</p>
            <p className="text-[15px] text-[#362415] mt-1" style={{ fontWeight: 500 }}>
              {userProfile?.name || 'Not set'}
            </p>
          </div>
          <div className="rounded-[12px] bg-[#F8F8F8] px-4 py-3 border border-[rgba(0,0,0,0.06)]">
            <p className="text-[11px] text-[#757575] uppercase tracking-wide" style={{ fontWeight: 600 }}>Email</p>
            <p className="text-[15px] text-[#362415] mt-1" style={{ fontWeight: 500 }}>
              {userProfile?.email || 'Not set'}
            </p>
          </div>
          <div className="rounded-[12px] bg-[#F8F8F8] px-4 py-3 border border-[rgba(0,0,0,0.06)]">
            <p className="text-[11px] text-[#757575] uppercase tracking-wide" style={{ fontWeight: 600 }}>Role</p>
            <p className="text-[15px] text-[#00704A] mt-1" style={{ fontWeight: 600 }}>
              {userProfile?.role || 'ADMIN'}
            </p>
          </div>
        </div>

        {profileImage && (
          <button
            onClick={removeProfileImage}
            disabled={savingProfile}
            className="w-full mt-4 py-3 rounded-[12px] border border-[#D32F2F] text-[#D32F2F] text-[14px] cursor-pointer"
            style={{ fontWeight: 600 }}
          >
            Remove Photo
          </button>
        )}
      </div>

      <AdminNavPanel open={showNavPanel} onClose={() => setShowNavPanel(false)} />
    </div>
  );
}