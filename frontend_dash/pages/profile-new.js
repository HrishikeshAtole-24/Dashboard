import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ModernLayout from '../components/ModernLayout';
import { 
  Card, 
  SectionHeader, 
  Button, 
  LoadingCard
} from '../components/UIComponents';
import { useRouter } from 'next/router';
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  CameraIcon,
  CheckCircleIcon
} from '../components/icons';
import toast from 'react-hot-toast';

export default function Profile() {
  const { isAuthenticated, loading, user, updateProfile } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Set initial profile data
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);

    try {
      const updateData = {
        name: profileData.name,
        email: profileData.email
      };

      // Add password change if provided
      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          toast.error('New passwords do not match');
          return;
        }
        if (profileData.newPassword.length < 6) {
          toast.error('Password must be at least 6 characters');
          return;
        }
        updateData.currentPassword = profileData.currentPassword;
        updateData.newPassword = profileData.newPassword;
      }

      await updateProfile(updateData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileData(prev => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  if (loading) {
    return (
      <ModernLayout title="Profile">
        <div className="space-y-8">
          <LoadingCard />
          <LoadingCard />
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout title="Profile">
      <div className="space-y-8">
        {/* Profile Header */}
        <Card>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-white" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50">
                <CameraIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h1>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Button 
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? 'secondary' : 'primary'}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Profile Information */}
        <Card>
          <form onSubmit={handleProfileUpdate}>
            <SectionHeader
              title="Profile Information"
              subtitle="Update your account details and preferences"
              action={
                isEditing && (
                  <div className="flex space-x-3">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={handleCancel}
                      disabled={loadingUpdate}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loadingUpdate}
                    >
                      {loadingUpdate ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            {isEditing && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={profileData.currentPassword}
                        onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Current password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={profileData.newPassword}
                        onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="New password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={profileData.confirmPassword}
                        onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Leave password fields empty if you don't want to change your password.
                </p>
              </div>
            )}
          </form>
        </Card>

        {/* Account Stats */}
        <Card>
          <SectionHeader
            title="Account Statistics"
            subtitle="Your activity and usage summary"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {user?.websiteCount || 0}
              </div>
              <div className="text-sm text-gray-600">Websites Tracked</div>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {user?.totalPageViews || 0}
              </div>
              <div className="text-sm text-gray-600">Total Page Views</div>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {user?.daysActive || 0}
              </div>
              <div className="text-sm text-gray-600">Days Active</div>
            </div>
          </div>
        </Card>

        {/* Account Security */}
        <Card>
          <SectionHeader
            title="Account Security"
            subtitle="Manage your account security settings"
          />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Email Verified</div>
                  <div className="text-sm text-gray-600">Your email address is verified</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <KeyIcon className="w-6 h-6 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Password Strength</div>
                  <div className="text-sm text-gray-600">Strong password protection enabled</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </ModernLayout>
  );
}