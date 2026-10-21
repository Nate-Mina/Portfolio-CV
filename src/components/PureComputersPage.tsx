import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Wrench,
  ShieldCheck,
  Zap,
  Phone,
  Mail,
  MapPin,
  Globe,
  CheckCircle2,
  ChevronRight,
  HardDrive,
  Activity,
  Award,
  Sparkles,
  Layers,
  Send,
  Check,
  Laptop,
  Server,
  Droplet,
  ExternalLink,
  Calculator,
  ListTodo,
  FileSpreadsheet,
  LogOut,
  CheckSquare,
} from 'lucide-react';
import { JekyllTheme } from '../types';
import { profileData } from '../data/profileData';
import {
  initAuth,
  googleSignIn,
  logout as googleLogout,
  getAccessToken,
  createGoogleTask,
  listGoogleTasks,
  completeGoogleTask,
  createServiceGoogleForm,
  GoogleTaskItem,
} from '../services/googleWorkspace';
import { User } from 'firebase/auth';
import { useToast } from '../context/ToastContext';
import { GoogleFormModal } from './GoogleFormModal';

interface PureComputersPageProps {
  currentTheme: JekyllTheme;
  onOpenTerminal: () => void;
}

export const PureComputersPage: React.FC<PureComputersPageProps> = ({ currentTheme }) => {
  // Configurator state for custom PC estimate
  const [workload, setWorkload] = useState<'gaming' | 'ai' | 'cad' | 'office'>('gaming');
  const [cooling, setCooling] = useState<'air' | 'aio' | 'custom_loop'>('aio');
  const [tier, setTier] = useState<'mid' | 'high' | 'ultra'>('high');
  const [formSent, setFormSent] = useState(false);
  const [serviceCategory, setServiceCategory] = useState<'build' | 'repair' | 'it' | 'data'>('build');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [contactMsg, setContactMsg] = useState('');

  // Toast notifications
  const { showSuccess, showWarning, showError, showGoogleFormReceived } = useToast();

  // Google Workspace state
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showGoogleFormModal, setShowGoogleFormModal] = useState(false);
  const [creatingForm, setCreatingForm] = useState(false);
  const [formResponderUri, setFormResponderUri] = useState<string | null>(null);
  const [taskCreatedNotification, setTaskCreatedNotification] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAuthToken(token);
        fetchTasks(token);
      },
      () => {
        setUser(null);
        setAuthToken(null);
        setTasks([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAuthToken(res.accessToken);
        fetchTasks(res.accessToken);
        showSuccess('Connected to Google', `Signed in as ${res.user.displayName || res.user.email}. Tasks & Forms synchronized.`);
      }
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      showError('Google Sign-In Failed', 'Unable to authenticate with Google. Please check popup blockers.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleLogout();
    setUser(null);
    setAuthToken(null);
    setTasks([]);
    showSuccess('Signed Out', 'Disconnected from Google account.');
  };

  const fetchTasks = async (token: string) => {
    setLoadingTasks(true);
    try {
      const fetched = await listGoogleTasks(token);
      setTasks(fetched);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!authToken) return;
    const success = await completeGoogleTask(authToken, taskId);
    if (success) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
      showSuccess('Task Completed', 'Google Task marked as resolved.');
    }
  };

  const handleCreateGoogleForm = async () => {
    if (!authToken) {
      showWarning('Google Sign-In Required', 'Please sign in with your Google account first to create and manage Google Forms.');
      return;
    }
    setCreatingForm(true);
    try {
      const result = await createServiceGoogleForm(authToken);
      if (result && result.responderUri) {
        setFormResponderUri(result.responderUri);
        showSuccess(
          'Google Form Generated!',
          'Official Pure Computers service intake form configured with Phone Number and Remote Tech Support options.'
        );
      } else {
        showError('Google Form Error', 'Failed to create Google Form. Please check Google account permissions.');
      }
    } catch (err) {
      console.error('Error creating Google Form:', err);
      showError('Google Form Error', 'An unexpected error occurred while generating the Google Form.');
    } finally {
      setCreatingForm(false);
    }
  };

  // Estimate price calculation logic
  const calculateEstimate = () => {
    let base = 1200;
    if (workload === 'ai') base = 3200;
    if (workload === 'cad') base = 2400;
    if (workload === 'office') base = 750;

    if (tier === 'mid') base *= 0.85;
    if (tier === 'ultra') base *= 1.6;

    if (cooling === 'aio') base += 150;
    if (cooling === 'custom_loop') base += 650;

    return Math.round(base);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactPhone) {
      showWarning('Required Fields Missing', 'Please fill in your name, email, and phone number.');
      return;
    }
    
    const subject = encodeURIComponent(`Service Inquiry (${serviceCategory.toUpperCase()}) from ${contactName}`);
    const body = encodeURIComponent(`Hi Nate,\n\nI am submitting a service request/consultation through Pure Computers website.\n\nName: ${contactName}\nEmail: ${contactEmail}\nPhone: ${contactPhone}\nRemote Tech Support Only: ${remoteOnly ? 'Yes' : 'No'}\nService Type: ${serviceCategory}\n\nDetails:\n${contactMsg}`);
    
    window.location.href = `mailto:nate@purecomp.onmicrosoft.com?subject=${subject}&body=${body}`;

    let taskCreatedSuccessfully = false;
    // If user is logged in with Google Tasks, automatically create a task
    if (authToken) {
      const taskTitle = `Follow-up: Service Inquiry from ${contactName} (${serviceCategory.toUpperCase()})`;
      const taskNotes = `Name: ${contactName}\nEmail: ${contactEmail}\nPhone: ${contactPhone}\nRemote Only: ${remoteOnly ? 'Yes' : 'No'}\nCategory: ${serviceCategory}\nDetails: ${contactMsg}`;
      const newTask = await createGoogleTask(authToken, taskTitle, taskNotes);
      if (newTask) {
        setTasks([newTask, ...tasks]);
        taskCreatedSuccessfully = true;
        setTaskCreatedNotification('Google Task automatically created for follow-up!');
        setTimeout(() => setTaskCreatedNotification(null), 5000);
      }
    }

    // Trigger Toast Notification confirming Google Form service request receipt
    showGoogleFormReceived({
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      remoteOnly,
      category: serviceCategory,
      details: contactMsg,
      taskCreated: taskCreatedSuccessfully,
      onViewTasks: () => setShowTasksModal(true),
    });

    setFormSent(true);
    setTimeout(() => {
      setFormSent(false);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setRemoteOnly(false);
      setContactMsg('');
    }, 4000);
  };

  // Quick helper to demo/test Google Form receipt toast
  const handleDemoToast = () => {
    showGoogleFormReceived({
      name: 'Dr. Michael Vance',
      email: 'm.vance@engineering-lab.com',
      phone: '(585) 234-8890',
      remoteOnly: true,
      category: 'it',
      details: 'Dual RTX 4090 workstation crash logs under heavy thermal simulation loads. Remote diagnostic session requested.',
      taskCreated: !!authToken,
      onViewTasks: () => setShowTasksModal(true),
    });
  };

  const handleGoogleFormModalSubmit = async (formData: {
    name: string;
    email: string;
    phone: string;
    remoteOnly: boolean;
    category: string;
    details: string;
  }) => {
    let taskCreated = false;
    if (authToken) {
      const taskTitle = `Google Form Intake: ${formData.name} (${formData.category.toUpperCase()})`;
      const taskNotes = `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nRemote Only: ${formData.remoteOnly ? 'Yes' : 'No'}\nCategory: ${formData.category}\nDetails: ${formData.details}`;
      const newTask = await createGoogleTask(authToken, taskTitle, taskNotes);
      if (newTask) {
        setTasks((prev) => [newTask, ...prev]);
        taskCreated = true;
      }
    }

    // Trigger toast notification confirming Google Form service request has been received
    showGoogleFormReceived({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      remoteOnly: formData.remoteOnly,
      category: formData.category,
      details: formData.details,
      taskCreated,
      onViewTasks: () => setShowTasksModal(true),
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Google Workspace Integration Header Card */}
      <div className={`p-6 rounded-3xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-xl flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono">
            <ListTodo className="w-3.5 h-3.5" />
            <span>Google Workspace &amp; Tasks Integration</span>
          </div>
          <h3 className="text-lg font-mono font-bold text-slate-100">
            {user ? `Connected as ${user.displayName || user.email}` : 'Sync Service Requests with Google Tasks & Forms'}
          </h3>
          <p className="text-xs font-sans text-slate-400">
            Automatically log client inquiries into Google Tasks and manage custom Google Forms service intakes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowGoogleFormModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Form Intake</span>
          </button>

          {!user ? (
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="gsi-material-button inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs shadow-lg transition-all border border-slate-300 cursor-pointer"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>Sign in with Google</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTasksModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-md transition-all"
              >
                <ListTodo className="w-4 h-4" />
                <span>Google Tasks ({tasks.filter(t => t.status === 'needsAction').length})</span>
              </button>

              <button
                onClick={handleCreateGoogleForm}
                disabled={creatingForm}
                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-md transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{creatingForm ? 'Creating Form...' : 'Create Service Google Form'}</span>
              </button>

              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {formResponderUri && (
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-mono flex items-center justify-between">
          <span>Google Form Created! Service requests can now be collected directly via Google Forms.</span>
          <a href={formResponderUri} target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-sky-200">
            Open Google Form
          </a>
        </div>
      )}

      {taskCreatedNotification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{taskCreatedNotification}</span>
        </div>
      )}

      {/* Hero Banner Section */}
      <div className={`p-8 rounded-3xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-2xl relative overflow-hidden`}>
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Official Business Showcase &bull; www.PureComp.Net</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-mono font-bold text-slate-100 tracking-tight">
                Pure Computers
              </h1>
              <p className="text-base text-emerald-400 font-mono font-medium">
                Custom High-Performance PC Builds, Liquid Cooling, Hardware Diagnostics &amp; Managed IT
              </p>
            </div>

            <a
              href="https://www.PureComp.Net"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold shadow-lg transition-all"
            >
              <span>Visit www.PureComp.Net</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <p className="text-sm font-sans text-slate-300 leading-relaxed max-w-4xl">
            At <strong className="text-emerald-400 font-mono">Pure Computers</strong>, we combine mechanical engineering precision with deep IT architecture. Whether you need a bespoke liquid-cooled workstation for heavy FEA/CAD rendering, multi-GPU AI compute clusters, high-frame-rate gaming setups, or enterprise IT network support in Rochester and Pittsford, NY — we deliver unmatched performance with zero downtime.
          </p>

          {/* Quick Contact Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">Direct Phone</div>
                <a href={`tel:${profileData.phone}`} className="text-xs font-mono font-bold text-slate-200 hover:text-emerald-400">
                  {profileData.phone}
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">Email Support</div>
                <a href={`mailto:${profileData.emails[1]}`} className="text-xs font-mono font-bold text-slate-200 hover:text-sky-400">
                  {profileData.emails[1]}
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">Location</div>
                <span className="text-xs font-mono font-bold text-slate-200">
                  {profileData.location}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">Web Domain</div>
                <a href="https://www.PureComp.Net" target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-bold text-slate-200 hover:text-violet-400">
                  PureComp.Net
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Business Services Matrix */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-mono font-bold text-slate-100">
              Our Core Services &amp; Solutions
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Precision engineering applied to computer hardware, liquid loops, &amp; business IT
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service 1 */}
          <div className={`p-6 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-4 shadow-xl hover:border-emerald-500/50 transition-colors`}>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-mono font-bold text-slate-100">
                  Bespoke Custom PC Builds
                </h3>
                <p className="text-xs font-mono text-emerald-400">
                  Tailored for Gaming, AI/ML, CAD, &amp; Content Creation
                </p>
              </div>
            </div>
            <p className="text-xs font-sans text-slate-300 leading-relaxed">
              Every workstation is engineered from the silicon up. We handle component binning, custom hardline &amp; softline liquid cooling loops, thermal pad calibration, cable management art, and extensive 48-hour stress testing.
            </p>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multi-GPU AI Deep Learning Rigs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bespoke Copper &amp; Acrylic Hardline Loops</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Overclocked Gaming Battlestations</span>
              </li>
            </ul>
          </div>

          {/* Service 2 */}
          <div className={`p-6 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-4 shadow-xl hover:border-emerald-500/50 transition-colors`}>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-mono font-bold text-slate-100">
                  Hardware Diagnostics &amp; Repair
                </h3>
                <p className="text-xs font-mono text-sky-400">
                  Component-level Troubleshooting &amp; Upgrades
                </p>
              </div>
            </div>
            <p className="text-xs font-sans text-slate-300 leading-relaxed">
              Advanced oscilloscope and thermal imaging diagnostics to pinpoint motherboard faults, GPU instabilities, power delivery degradation, and storage array failures with absolute accuracy.
            </p>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>PSU &amp; Motherboard Failure Analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>BIOS Flashing &amp; Stability Tuning</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Thermal Repasting &amp; Fan Replacement</span>
              </li>
            </ul>
          </div>

          {/* Service 3 */}
          <div className={`p-6 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-4 shadow-xl hover:border-emerald-500/50 transition-colors`}>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-mono font-bold text-slate-100">
                  Managed IT &amp; Network Support
                </h3>
                <p className="text-xs font-mono text-violet-400">
                  Enterprise Security &amp; Infrastructure
                </p>
              </div>
            </div>
            <p className="text-xs font-sans text-slate-300 leading-relaxed">
              Robust IT management for small businesses and professional offices. Secure firewalls, VLAN segmentation, automated cloud/local backups, and rapid on-site or remote assistance.
            </p>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                <span>Secure VPN &amp; Firewall Deployment</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                <span>Automated 3-2-1 Backup Solutions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                <span>Remote &amp; On-Site Helpdesk Support</span>
              </li>
            </ul>
          </div>

          {/* Service 4 */}
          <div className={`p-6 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-4 shadow-xl hover:border-emerald-500/50 transition-colors`}>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-mono font-bold text-slate-100">
                  Data Recovery &amp; Storage Arrays
                </h3>
                <p className="text-xs font-mono text-amber-400">
                  RAID Reconstruction &amp; NVMe Retrieval
                </p>
              </div>
            </div>
            <p className="text-xs font-sans text-slate-300 leading-relaxed">
              Specialized data recovery from failed mechanical hard drives, corrupted RAID arrays, damaged SSD controllers, and accidental deletion with strict confidentiality.
            </p>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>RAID 0/1/5/10 Array Reconstruction</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>NVMe / SATA SSD Chip-Level Extraction</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Secure Data Migration &amp; Encryption</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Custom PC Build Configurator & Estimate Calculator */}
      <div className={`p-8 rounded-3xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-6`}>
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-mono font-bold text-slate-100">
              Custom PC Build Configurator &amp; Price Estimator
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Configure your desired workload and hardware tier for an instant estimate
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workload */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-slate-400 font-bold">
                1. Select Primary Workload Profile
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setWorkload('gaming')}
                  className={`p-3 rounded-xl border text-center font-mono transition-all ${
                    workload === 'gaming'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">Gaming / Esport</div>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkload('ai')}
                  className={`p-3 rounded-xl border text-center font-mono transition-all ${
                    workload === 'ai'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">AI / LLM Compute</div>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkload('cad')}
                  className={`p-3 rounded-xl border text-center font-mono transition-all ${
                    workload === 'cad'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">CAD / FEA Render</div>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkload('office')}
                  className={`p-3 rounded-xl border text-center font-mono transition-all ${
                    workload === 'office'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">Office Workstation</div>
                </button>
              </div>
            </div>

            {/* Cooling */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-slate-400 font-bold">
                2. Select Thermal / Cooling Solution
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setCooling('air')}
                  className={`p-3 rounded-xl border text-center font-mono transition-all ${
                    cooling === 'air'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">High-End Air Cooler</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCooling('aio')}
                  className={`p-3 rounded-xl border text-center font-mono transition-all ${
                    cooling === 'aio'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">AIO Liquid Cooler (360mm)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCooling('custom_loop')}
                  className={`p-3 rounded-xl border text-center font-mono transition-all ${
                    cooling === 'custom_loop'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">Custom Hardline Loop</div>
                </button>
              </div>
            </div>

            {/* Performance Tier */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-slate-400 font-bold">
                3. Select Hardware Tier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTier('mid')}
                  className={`p-3 rounded-xl border text-center font-mono transition-all ${
                    tier === 'mid'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">Standard</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTier('high')}
                  className={`p-3 rounded-xl border text-center font-mono transition-all ${
                    tier === 'high'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">High Performance</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTier('ultra')}
                  className={`p-3 rounded-xl border text-center font-mono transition-all ${
                    tier === 'ultra'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">Extreme / Workstation</div>
                </button>
              </div>
            </div>
          </div>

          {/* Estimate Display Box */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
                Estimated Build Budget
              </div>
              <div className="text-4xl font-mono font-bold text-slate-100">
                ~${calculateEstimate().toLocaleString()} USD
              </div>
              <p className="text-xs font-sans text-slate-400 leading-relaxed">
                Includes parts selection, mechanical assembly, stress testing, thermal calibration, Windows OS setup, and Pure Computers warranty.
              </p>

              <div className="border-t border-slate-800/80 pt-3 space-y-1.5 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Workload Profile:</span>
                  <span className="text-slate-100 font-bold uppercase">{workload}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thermal Solution:</span>
                  <span className="text-slate-100 font-bold uppercase">{cooling.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assembly &amp; Testing:</span>
                  <span className="text-emerald-400 font-bold">Included</span>
                </div>
              </div>
            </div>

            <a
              href={`mailto:nate@purecomp.onmicrosoft.com?subject=Quote%20Request%20for%20Custom%20Build%20($${calculateEstimate()})&body=Hi%20Nate,%20I%20would%20like%20to%20request%20a%20custom%20PC%20build%20consultation%20with%20workload:%20${workload},%20cooling:%20${cooling},%20tier:%20${tier}.`}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold text-center transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Request Formal Build Quote</span>
            </a>
          </div>
        </div>
      </div>

      {/* Direct Service Request / Consultation Form with Phone & Remote Tech Support Options */}
      <div className={`p-8 rounded-3xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-mono font-bold text-slate-100">
                Submit Service Request or Consultation
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Get in touch with Nate Mina. Submissions automatically log a follow-up task in Google Tasks and trigger a toast confirmation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowGoogleFormModal(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Google Form Modal</span>
            </button>
            <button
              type="button"
              onClick={handleDemoToast}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Test triggering the Google Form confirmation toast"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Test Toast</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmitQuote} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Your Full Name *</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Your Email Address *</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. alex@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Phone Number *</label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. (585) 555-0199"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">Service Needed</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setServiceCategory('build')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono transition-all ${
                  serviceCategory === 'build'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Custom PC Build
              </button>
              <button
                type="button"
                onClick={() => setServiceCategory('repair')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono transition-all ${
                  serviceCategory === 'repair'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Hardware Repair
              </button>
              <button
                type="button"
                onClick={() => setServiceCategory('it')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono transition-all ${
                  serviceCategory === 'it'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Managed IT Support
              </button>
              <button
                type="button"
                onClick={() => setServiceCategory('data')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono transition-all ${
                  serviceCategory === 'data'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Data Recovery
              </button>
            </div>
          </div>

          {/* Remote Tech Support Only Checkbox */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-xs font-mono font-bold text-slate-200 cursor-pointer">
                Remote Tech Support Only?
              </label>
              <p className="text-[11px] font-sans text-slate-400">
                Check this box if you prefer remote diagnostics and virtual troubleshooting without requiring an on-site visit or drop-off.
              </p>
            </div>
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">Project Details or System Issue</label>
            <textarea
              rows={3}
              value={contactMsg}
              onChange={(e) => setContactMsg(e.target.value)}
              placeholder="Describe your computer hardware requirements, preferred specs, or symptoms if requesting repair..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {formSent ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Request Received &amp; Google Task Logged! We will respond shortly.</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Service Inquiry (Triggers Toast &amp; Task)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowGoogleFormModal(true)}
              className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-purple-300" />
              <span>Google Form Intake</span>
            </button>
          </div>
        </form>
      </div>

      {/* Google Tasks Manager Modal / Drawer */}
      {showTasksModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl p-6 rounded-3xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-6 shadow-2xl`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ListTodo className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-mono font-bold text-slate-100">
                    Google Tasks Follow-Up List
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    Manage service request follow-ups synchronized with your Google account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTasksModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {loadingTasks ? (
                <div className="text-center py-8 text-xs font-mono text-slate-400">Loading Google Tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-xs font-mono text-slate-400">
                  No tasks found in your default Google Tasks list. Submit a service request above to automatically generate a follow-up task!
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className={`text-xs font-mono font-bold ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {task.title}
                      </div>
                      {task.notes && (
                        <p className="text-xs font-sans text-slate-400 whitespace-pre-line leading-relaxed">
                          {task.notes}
                        </p>
                      )}
                    </div>
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-mono text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Google Form Service Request Intake Modal */}
      <GoogleFormModal
        isOpen={showGoogleFormModal}
        onClose={() => setShowGoogleFormModal(false)}
        onSubmit={handleGoogleFormModalSubmit}
        currentTheme={currentTheme}
        formResponderUri={formResponderUri}
      />
    </div>
  );
};
