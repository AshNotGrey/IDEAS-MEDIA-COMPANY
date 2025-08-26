import React, { useState, useEffect } from "react";
import { useAdminAuth } from "../../hooks/useAdminAuth.js";
import authService from "../../services/authService.js";
import {
  Shield,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  MapPin,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

const SessionManagement = () => {
  const [currentDeviceId, setCurrentDeviceId] = useState("");
  const [revokingSession, setRevokingSession] = useState(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useAdminAuth();

  // Generate current device ID (same as login)
  useEffect(() => {
    const generateDeviceId = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("Device fingerprint", 2, 2);
      return btoa(canvas.toDataURL()).slice(0, 32);
    };
    setCurrentDeviceId(generateDeviceId());
  }, []);

  // Load sessions when component mounts or token changes
  useEffect(() => {
    if (token) {
      loadSessions();
    }
  }, [token]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.getSessions(token);

      // Process sessions data
      const processedSessions =
        response.sessions?.map((session) => ({
          ...session,
          isCurrentSession: session.deviceId === currentDeviceId,
          createdAt: new Date(session.createdAt),
          lastUsedAt: new Date(session.lastUsedAt),
          expiresAt: new Date(session.expiresAt),
        })) || [];

      setSessions(processedSessions);
    } catch (error) {
      console.error("Failed to load sessions:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case "windows":
      case "macos":
      case "linux":
        return <Monitor className='w-5 h-5' />;
      case "android":
        return <Smartphone className='w-5 h-5' />;
      case "ios":
        return <Tablet className='w-5 h-5' />;
      default:
        return <Globe className='w-5 h-5' />;
    }
  };

  const getDeviceColor = (platform) => {
    switch (platform?.toLowerCase()) {
      case "windows":
        return "text-blue-600";
      case "macos":
        return "text-gray-600";
      case "linux":
        return "text-green-600";
      case "android":
        return "text-green-500";
      case "ios":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getSessionStatus = (session) => {
    if (session.revoked) {
      return {
        text: "Revoked",
        color: "text-red-600",
        bg: "bg-red-50",
        icon: <XCircle className='w-4 h-4' />,
      };
    }

    if (session.isCurrentSession) {
      return {
        text: "Current Session",
        color: "text-green-600",
        bg: "bg-green-50",
        icon: <CheckCircle className='w-4 h-4' />,
      };
    }

    const now = new Date();
    if (session.expiresAt < now) {
      return {
        text: "Expired",
        color: "text-red-600",
        bg: "bg-red-50",
        icon: <XCircle className='w-4 h-4' />,
      };
    }

    if (session.lastUsedAt < new Date(now - 24 * 60 * 60 * 1000)) {
      return {
        text: "Inactive",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        icon: <AlertTriangle className='w-4 h-4' />,
      };
    }

    return {
      text: "Active",
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: <CheckCircle className='w-4 h-4' />,
    };
  };

  const handleRevokeSession = async (sessionId) => {
    setRevokingSession(sessionId);
    try {
      await authService.revokeSession(token, sessionId);
      loadSessions(); // Reload sessions after revocation
    } catch (error) {
      console.error("Failed to revoke session:", error);
    } finally {
      setRevokingSession(null);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (
      !window.confirm(
        "Are you sure you want to revoke all other sessions? This will log you out from all other devices."
      )
    ) {
      return;
    }

    setRevokingAll(true);
    try {
      await authService.revokeAllSessions(token, currentDeviceId);
      loadSessions(); // Reload sessions after revocation
    } catch (error) {
      console.error("Failed to revoke all sessions:", error);
    } finally {
      setRevokingAll(false);
    }
  };

  const refreshSessions = async () => {
    loadSessions();
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <RefreshCw className='w-8 h-8 animate-spin text-ideas-accent mx-auto mb-2' />
          <p className='text-gray-600 dark:text-gray-400'>Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <AlertTriangle className='w-8 h-8 text-red-500 mx-auto mb-2' />
          <p className='text-red-600 dark:text-red-400 mb-2'>Failed to load sessions</p>
          <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>{error}</p>
          <button onClick={refreshSessions} className='btn-secondary'>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Active Sessions</h2>
          <p className='text-gray-600 dark:text-gray-400'>
            Manage your active sessions across different devices
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <button
            onClick={refreshSessions}
            className='btn-secondary flex items-center space-x-2'
            disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleRevokeAllSessions}
            className='btn-secondary text-red-600 hover:text-red-700 border-red-200 hover:border-red-300'
            disabled={
              revokingAll || sessions.filter((s) => !s.isCurrentSession && !s.revoked).length === 0
            }>
            {revokingAll ? (
              <>
                <RefreshCw className='w-4 h-4 animate-spin mr-2' />
                Revoking...
              </>
            ) : (
              <>
                <Trash2 className='w-4 h-4 mr-2' />
                Revoke All Others
              </>
            )}
          </button>
        </div>
      </div>

      {/* Session Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg'>
              <Shield className='w-6 h-6 text-blue-600' />
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Total Sessions</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>{sessions.length}</p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-green-100 dark:bg-green-900/20 rounded-lg'>
              <CheckCircle className='w-6 h-6 text-green-600' />
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Active</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {sessions.filter((s) => getSessionStatus(s).text === "Active").length}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg'>
              <AlertTriangle className='w-6 h-6 text-yellow-600' />
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Inactive</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {sessions.filter((s) => getSessionStatus(s).text === "Inactive").length}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-red-100 dark:bg-red-900/20 rounded-lg'>
              <XCircle className='w-6 h-6 text-red-600' />
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                Revoked/Expired
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {
                  sessions.filter((s) => ["Revoked", "Expired"].includes(getSessionStatus(s).text))
                    .length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Device Sessions</h3>
        </div>

        <div className='divide-y divide-gray-200 dark:divide-gray-700'>
          {sessions.map((session) => {
            const status = getSessionStatus(session);
            const isCurrent = session.isCurrentSession;

            return (
              <div
                key={session._id}
                className='p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-start space-x-4'>
                    {/* Device Icon */}
                    <div
                      className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700 ${getDeviceColor(session.platform)}`}>
                      {getDeviceIcon(session.platform)}
                    </div>

                    {/* Session Info */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center space-x-3 mb-2'>
                        <h4 className='text-lg font-medium text-gray-900 dark:text-white'>
                          {session.platform || "Unknown"} • {session.browser || "Unknown"}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.color}`}>
                          {status.icon}
                          <span className='ml-1'>{status.text}</span>
                        </span>
                        {isCurrent && (
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200'>
                            Current Device
                          </span>
                        )}
                        {session.revokedReason && (
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200'>
                            {session.revokedReason}
                          </span>
                        )}
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400'>
                        <div className='space-y-2'>
                          <div className='flex items-center space-x-2'>
                            <MapPin className='w-4 h-4' />
                            <span>IP: {session.ip || "Unknown"}</span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Clock className='w-4 h-4' />
                            <span>Last used: {formatTimeAgo(session.lastUsedAt)}</span>
                          </div>
                        </div>
                        <div className='space-y-2'>
                          <div className='flex items-center space-x-2'>
                            <Shield className='w-4 h-4' />
                            <span>Device ID: {session.deviceId?.slice(0, 8) || "Unknown"}...</span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Clock className='w-4 h-4' />
                            <span>Created: {formatDate(session.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* User Agent */}
                      {session.userAgent && (
                        <div className='mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-500 dark:text-gray-400 font-mono'>
                          {session.userAgent}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex items-center space-x-2'>
                    {!isCurrent && !session.revoked && (
                      <button
                        onClick={() => handleRevokeSession(session._id)}
                        disabled={revokingSession === session._id}
                        className='btn-secondary text-red-600 hover:text-red-700 border-red-200 hover:border-red-300'>
                        {revokingSession === session._id ? (
                          <>
                            <RefreshCw className='w-4 h-4 animate-spin mr-2' />
                            Revoking...
                          </>
                        ) : (
                          <>
                            <Trash2 className='w-4 h-4 mr-2' />
                            Revoke
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {sessions.length === 0 && (
        <div className='text-center py-12'>
          <Shield className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
            No Active Sessions
          </h3>
          <p className='text-gray-600 dark:text-gray-400'>
            You don't have any active sessions at the moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionManagement;
