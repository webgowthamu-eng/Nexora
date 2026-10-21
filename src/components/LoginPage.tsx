import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  Mail, 
  Lock, 
  ArrowRight, 
  UserPlus, 
  LogIn, 
  Sun, 
  Moon, 
  CheckCircle2,
  Info,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  resetPassword,
  firebaseConfig 
} from '../firebase';
import { BusinessSettings } from '../types';

interface LoginPageProps {
  settings: BusinessSettings;
  onSuccess: (user: any) => void;
  onContinueAsGuest: () => void;
  onToggleTheme: () => void;
  hasActiveSession?: boolean;
  onBackToWorkspace?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  settings,
  onSuccess,
  onContinueAsGuest,
  onToggleTheme,
  hasActiveSession = false,
  onBackToWorkspace
}) => {
  const [authTab, setAuthTab] = useState<'quick' | 'email'>('quick');
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseSettingsUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;

  const copyDomain = () => {
    if (navigator.clipboard && currentHost) {
      navigator.clipboard.writeText(currentHost);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);
    setIsUnauthorizedDomain(false);
    try {
      const user = await loginWithGoogle();
      onSuccess(user);
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      const code = err?.code ? ` [${err.code}]` : '';
      let hint = "Sign in encountered an issue. Your saved jobs remain safe.";

      if (err?.code === 'auth/unauthorized-domain') {
        setIsUnauthorizedDomain(true);
        hint = `Domain "${currentHost}" is not yet registered under Authorized domains in Firebase project "${firebaseConfig.projectId}". Follow the quick steps below to add it, or click "Continue as Guest" to use the workspace immediately.`;
      } else if (err?.code === 'auth/popup-blocked') {
        hint = "The browser popup was blocked. Please allow popups for this site and click sign-in again.";
      } else if (err?.code === 'auth/popup-closed-by-user') {
        hint = "Sign-in popup was closed before finishing.";
      } else if (err?.message) {
        hint = err.message;
      }
      setErrorMessage(`Google sign-in error${code}: ${hint}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      if (isRegistering) {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        const user = await registerWithEmail(email, password);
        onSuccess(user);
      } else {
        const user = await loginWithEmail(email, password);
        onSuccess(user);
      }
    } catch (err: any) {
      console.error("Email auth error:", err);
      let hint = err.message || "Failed to authenticate.";
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        hint = "Invalid email or password. Please verify and try again.";
      } else if (err?.code === 'auth/user-not-found') {
        hint = "No account found with this email. Switch to 'Create new account' tab.";
      } else if (err?.code === 'auth/email-already-in-use') {
        hint = "An account with this email already exists. Try signing in instead.";
      }
      setErrorMessage(hint);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMessage('Enter your email address above to receive a password reset link.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      await resetPassword(email);
      setInfoMessage(`Password reset link sent to ${email}. Check your inbox!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-radial-[at_top_right] from-sky-100/70 via-[var(--bg)] to-slate-200/50 dark:from-sky-950/20 dark:via-[#0c1422] dark:to-[#070b14] transition-colors">
      {/* Background ambient decorative glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* Header controls: Back to workspace + Theme toggle */}
      <div className="absolute top-5 inset-x-5 z-10 flex items-center justify-between pointer-events-none">
        {hasActiveSession && onBackToWorkspace ? (
          <button
            onClick={onBackToWorkspace}
            className="pointer-events-auto px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-xs font-bold text-[var(--text)] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <span>← Back to Workspace</span>
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="pointer-events-auto w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[var(--text)] flex items-center justify-center shadow-xs transition-colors cursor-pointer"
          title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[440px] bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-9 shadow-[0_25px_80px_rgba(16,35,63,0.14)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.4)] text-center relative z-10 transition-all">
        {/* Brand Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#10233f] to-[#17506c] shadow-lg flex items-center justify-center text-[var(--accent)] font-black text-3xl mx-auto mb-3 select-none">
          L
        </div>

        <div className="text-[10px] font-black tracking-widest text-[var(--accent)] uppercase mb-1">
          LAKSHNEXA WORKSPACE
        </div>

        <h1 className="text-2xl sm:text-[26px] font-extrabold text-[var(--text)] tracking-tight">
          Welcome to Nexora
        </h1>

        <p className="text-xs text-[var(--muted)] mt-1.5 mb-5 leading-relaxed">
          Sign in with Google, or continue as a guest. Your existing jobs saved in this browser will be kept.
        </p>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-[var(--surface2)] border border-[var(--border)] p-1 mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthTab('quick');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              authTab === 'quick'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Quick Access
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthTab('email');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              authTab === 'email'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Email & Password
          </button>
        </div>

        {/* Diagnostic alert message if any */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-medium text-left leading-relaxed border border-amber-200 dark:border-amber-800 space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                {errorMessage}
              </div>
            </div>

            {isUnauthorizedDomain && (
              <div className="p-3 rounded-xl bg-white dark:bg-[#131f31] border border-amber-200 dark:border-amber-800/80 space-y-2.5">
                <div className="font-bold text-[11px] text-[var(--text)] flex items-center justify-between">
                  <span>Domain to authorize:</span>
                  <button
                    type="button"
                    onClick={copyDomain}
                    className="px-2 py-0.5 rounded-md bg-[var(--surface2)] hover:bg-[var(--accent2)] border border-[var(--border)] text-[10px] font-bold text-[var(--accent)] cursor-pointer transition-colors"
                  >
                    {copiedDomain ? '✓ Copied!' : 'Copy Domain'}
                  </button>
                </div>

                <div className="p-1.5 rounded-lg bg-[var(--surface2)] border border-[var(--border)] font-mono text-[10px] text-[var(--text)] break-all select-all">
                  {currentHost}
                </div>

                <div className="text-[10px] text-[var(--muted)] space-y-1">
                  <div>1. Go to <a href={firebaseSettingsUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] font-bold underline inline-flex items-center gap-0.5">Firebase Console Settings ↗</a></div>
                  <div>2. Scroll to <strong>Authorized domains</strong> → click <strong>Add domain</strong> and paste.</div>
                </div>

                <div className="pt-1 border-t border-[var(--border)]/70 flex items-center justify-between">
                  <span className="text-[10px] text-[var(--muted)]">Or skip setup right now:</span>
                  <button
                    type="button"
                    onClick={onContinueAsGuest}
                    className="px-2.5 py-1 rounded-lg bg-[var(--navy)] text-white text-[10px] font-bold hover:bg-[#1a3860] transition-colors cursor-pointer"
                  >
                    Continue as Guest →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium text-left leading-relaxed border border-emerald-200 dark:border-emerald-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-[11px]">{infoMessage}</div>
          </div>
        )}

        {/* Tab 1: Quick Access */}
        {authTab === 'quick' && (
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)] active:scale-98 text-xs font-bold text-[var(--text)] flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Connecting with Google...' : 'Continue with Google'}</span>
            </button>

            <button
              onClick={onContinueAsGuest}
              className="w-full py-3 px-4 rounded-xl bg-[var(--navy)] text-white hover:bg-[#1a3860] active:scale-98 text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue as Guest</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)]" />
            </button>
          </div>
        )}

        {/* Tab 2: Email & Password */}
        {authTab === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-3.5 text-left">
            <div>
              <label className="block text-[11px] font-bold text-[var(--muted)] mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] text-xs text-[var(--text)] outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[var(--muted)]">
                  Password
                </label>
                {!isRegistering && (
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="text-[10px] text-[var(--accent)] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] text-xs text-[var(--text)] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--navy)] text-white hover:bg-[#1a3860] active:scale-98 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : isRegistering ? (
                <>
                  <UserPlus className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Create Account</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Sign In</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-[var(--muted)]">
              {isRegistering ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(false);
                      setErrorMessage(null);
                    }}
                    className="text-[var(--accent)] font-bold hover:underline"
                  >
                    Sign in
                  </button>
                </span>
              ) : (
                <span>
                  New to Nexora?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setErrorMessage(null);
                    }}
                    className="text-[var(--accent)] font-bold hover:underline"
                  >
                    Create account
                  </button>
                </span>
              )}
            </div>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-xs text-[var(--muted)] hover:text-[var(--text)] underline"
              >
                Or continue as Guest without signing in
              </button>
            </div>
          </form>
        )}

        {/* Explanatory notes */}
        <p className="text-[11px] text-[var(--muted)] mt-5 leading-normal opacity-90">
          Guest mode keeps data in this browser only. Google sign-in enables multi-device cloud backup with project <strong className="font-semibold text-[var(--text)]">{firebaseConfig.projectId}</strong>.
        </p>

        <div className="mt-4 pt-3 border-t border-[var(--border)] text-[11px] text-[var(--muted)] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Local storage encryption & Cloud Firestore ready</span>
        </div>
      </div>
    </div>
  );
};
