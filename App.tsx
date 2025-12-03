
import React, { useState, useEffect, useRef } from 'react';
import { 
  UserRole, 
  ApplicationStatus, 
  AcquisitionRequest,
  Document,
  LogEntry,
  Parcel,
  StageEvent,
  AIAnalysisResult
} from './types';
import { INITIAL_REQUESTS, ROLE_LABELS, MOCK_DOCUMENTS, REQUIRED_DOCUMENT_CATEGORIES, createDocumentFlow } from './constants';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';
import { generateGazetteNotice, getProjectLocationInsights, analyzeDocument, GroundingLink } from './services/aiService';
import { fetchRequests, persistRequest, isSupabaseConfigured } from './services/supabaseClient';
import { 
  Bell, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Download, 
  Eye,
  Bot,
  MapPin,
  Banknote,
  Gavel,
  Settings,
  Coins,
  Activity,
  Users,
  TrendingUp,
  FileSearch,
  Briefcase,
  Shield,
  User,
  LogOut,
  X,
  Map,
  ExternalLink,
  Scan,
  Database,
  Loader2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Upload
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// --- Helper Components ---

const StatusBadge = ({ status }: { status: ApplicationStatus | string }) => {
  const styles: Record<string, string> = {
    [ApplicationStatus.DRAFT]: 'bg-slate-100 text-slate-800',
    [ApplicationStatus.SUBMITTED]: 'bg-blue-100 text-blue-800',
    [ApplicationStatus.UNDER_SCRUTINY]: 'bg-yellow-100 text-yellow-900',
    [ApplicationStatus.RETURNED_FOR_CORRECTION]: 'bg-orange-100 text-orange-900',
    [ApplicationStatus.PENDING_COMMITTEE]: 'bg-orange-50 text-orange-800',
    [ApplicationStatus.APPROVED]: 'bg-green-100 text-green-800',
    [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-800',
    [ApplicationStatus.GAZETTE_INTENTION]: 'bg-purple-100 text-purple-800',
    [ApplicationStatus.INQUIRY_NOTICE]: 'bg-teal-100 text-teal-800',
    [ApplicationStatus.COMPENSATION_SCHEDULE]: 'bg-blue-700 text-white',
    [ApplicationStatus.FUNDS_REQ_SENT]: 'bg-pink-100 text-pink-800',
    [ApplicationStatus.FUNDS_DEPOSITED]: 'bg-cyan-100 text-cyan-800',
    [ApplicationStatus.AWARDS_ISSUED]: 'bg-emerald-100 text-emerald-800',
    [ApplicationStatus.PAYMENT_PROCESSING]: 'bg-indigo-100 text-indigo-800',
    // Parcel Statuses
    'Verified': 'bg-green-50 text-green-800 border-green-200',
    'Pending': 'bg-yellow-50 text-yellow-800 border-yellow-200',
    'Contested': 'bg-red-50 text-red-800 border-red-200',
    'Accepted': 'bg-blue-50 text-blue-800 border-blue-200',
    'Compensated': 'bg-slate-100 text-slate-600 line-through'
  };
  
  const style = styles[status] || 'bg-slate-100 text-slate-800';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border border-transparent ${style}`}>
      {status}
    </span>
  );
};

// --- Login Component ---
interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        <div className="bg-blue-600 p-12 flex flex-col justify-between md:w-5/12 text-white">
          <div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center font-bold text-slate-900 text-xl mb-6 shadow-lg">
              NLC
            </div>
            <h1 className="text-3xl font-bold mb-2">LandCom</h1>
            <p className="text-blue-100 font-medium">Compulsory Land Acquisition Workflow Management System.</p>
          </div>
          <div>
            <p className="text-sm opacity-80">&copy; 2024 National Land Commission</p>
          </div>
        </div>

        <div className="p-12 md:w-7/12 bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Select User Portal</h2>
          <div className="grid grid-cols-1 gap-4">
            <button onClick={() => onLogin(UserRole.ACQUIRING_BODY)} className="group p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Briefcase size={24} /></div>
              <div><h3 className="font-bold text-slate-900">Acquiring Body</h3><p className="text-xs text-slate-600 font-medium">Applicant (KeNHA, etc.)</p></div>
            </button>
            <button onClick={() => onLogin(UserRole.NLCC_CHAIRMAN)} className="group p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Shield size={24} /></div>
              <div><h3 className="font-bold text-slate-900">NLC Admin / Director</h3><p className="text-xs text-slate-600 font-medium">Approvals & Workflow</p></div>
            </button>
            <button onClick={() => onLogin(UserRole.FINANCE)} className="group p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Banknote size={24} /></div>
              <div><h3 className="font-bold text-slate-900">Finance</h3><p className="text-xs text-slate-600 font-medium">Fund Verification & Payment</p></div>
            </button>
            <button onClick={() => onLogin(UserRole.INTERESTED_PARTY)} className="group p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><User size={24} /></div>
              <div><h3 className="font-bold text-slate-900">Interested Party</h3><p className="text-xs text-slate-600 font-medium">Land Owner / Claimant</p></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const ACTION_STAGE_MAP: Record<string, { stage: string; description: string }> = {
  SUBMIT: { stage: 'Submission', description: 'Request submitted for review' },
  SCRUTINIZE: { stage: 'Scrutiny', description: 'Director/committee started scrutiny' },
  DEFER: { stage: 'Corrections', description: 'Returned to applicant for corrections' },
  RECOMMEND: { stage: 'Committee', description: 'Forwarded to committee for decision' },
  APPROVE: { stage: 'Approval', description: 'Committee approved the request' },
  REJECT: { stage: 'Rejection', description: 'Committee rejected the request' },
  PUBLISH_GAZETTE: { stage: 'Gazette', description: 'Gazette notice published' },
  COMMISSION_SURVEY: { stage: 'Inquiry', description: 'Survey commissioned' },
  FINALIZE_VALUATION: { stage: 'Valuation', description: 'Compensation schedule finalized' },
  REQUEST_FUNDS: { stage: 'Funds', description: 'Funds requested' },
  DEPOSIT_FUNDS: { stage: 'Funds', description: 'Funds deposited' },
  ISSUE_AWARDS: { stage: 'Conclusion', description: 'Awards issued' },
  PROCESS_PAYMENT: { stage: 'Conclusion', description: 'Payment processing started' },
  COMPLETE_PAYMENT: { stage: 'Conclusion', description: 'Payment processing completed' }
};

const FORWARD_ACTIONS = [
  { label: 'Office of NLC Chair → Director Valuation (Scrutiny)', action: 'SCRUTINIZE' },
  { label: 'Director Valuation → Committee (Recommendation)', action: 'RECOMMEND' },
  { label: 'Committee → Gazette (Publish)', action: 'PUBLISH_GAZETTE' },
  { label: 'Gazette → Valuation Team (Commission Survey)', action: 'COMMISSION_SURVEY' },
  { label: 'Inquiry → Valuation Finalization', action: 'FINALIZE_VALUATION' },
  { label: 'Valuation → Request Funds', action: 'REQUEST_FUNDS' },
  { label: 'Finance → Issue Awards', action: 'ISSUE_AWARDS' },
  { label: 'Finance → Process Payment', action: 'PROCESS_PAYMENT' },
  { label: 'Finance → Complete Payment & Vesting', action: 'COMPLETE_PAYMENT' }
];

const FORWARD_STATUS_TRIGGER: Record<string, ApplicationStatus | ApplicationStatus[]> = {
  SCRUTINIZE: ApplicationStatus.SUBMITTED,
  RECOMMEND: ApplicationStatus.UNDER_SCRUTINY,
  PUBLISH_GAZETTE: ApplicationStatus.APPROVED,
  COMMISSION_SURVEY: ApplicationStatus.GAZETTE_INTENTION,
  FINALIZE_VALUATION: ApplicationStatus.INQUIRY_CONDUCTED,
  REQUEST_FUNDS: ApplicationStatus.COMPENSATION_SCHEDULE,
  ISSUE_AWARDS: ApplicationStatus.FUNDS_DEPOSITED,
  PROCESS_PAYMENT: ApplicationStatus.AWARDS_ISSUED,
  COMPLETE_PAYMENT: ApplicationStatus.PAYMENT_PROCESSING
};

const canForwardAction = (status: ApplicationStatus, action: string) => {
  const trigger = FORWARD_STATUS_TRIGGER[action];
  if (!trigger) return false;
  if (Array.isArray(trigger)) {
    return trigger.includes(status);
  }
  return trigger === status;
};

const App: React.FC = () => {
  const supabaseEnabled = isSupabaseConfigured();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.ACQUIRING_BODY);
  const [requests, setRequests] = useState<AcquisitionRequest[]>(() => supabaseEnabled ? [] : INITIAL_REQUESTS);
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedRequest, setSelectedRequest] = useState<AcquisitionRequest | null>(null);
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  // UI State
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const finalSurveyInputRef = useRef<HTMLInputElement>(null);

  const [notifications, setNotifications] = useState<{ id: string; message: string; timestamp: string }[]>([]);
  const [reviewComment, setReviewComment] = useState('');
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [documentViewerDoc, setDocumentViewerDoc] = useState<Document | null>(null);
  const [noticeStatusMap, setNoticeStatusMap] = useState<Record<string, string>>({});
  const [noticeType, setNoticeType] = useState<'intention' | 'inquiry' | 'awards' | 'possession' | 'vesting'>('intention');
  const [paymentScheduleText, setPaymentScheduleText] = useState('');
  const [finalSurveyUploads, setFinalSurveyUploads] = useState<Record<string, string>>({});
  const [gazetteDraft, setGazetteDraft] = useState('');

  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Modals
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [newRequestForm, setNewRequestForm] = useState({ title: '', description: '', budget: '', acquiringBody: 'KeNHA' });
  const [isAddParcelModalOpen, setIsAddParcelModalOpen] = useState(false);
  const [newParcelForm, setNewParcelForm] = useState({ parcelNumber: '', owner: '', size: '', estimatedValue: '', coordinates: '', isUnregistered: false });
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // AI State
  const [isGeneratingNotice, setIsGeneratingNotice] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isAnalyzingMap, setIsAnalyzingMap] = useState(false);
  const [mapInsights, setMapInsights] = useState<{ text: string; links: GroundingLink[] } | null>(null);
  const [analyzingDocId, setAnalyzingDocId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [verifyingDocuments, setVerifyingDocuments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
         setShowFilterMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  useEffect(() => {
    if (!selectedRequest) {
      setGazetteDraft('');
      setPaymentScheduleText('');
      return;
    }
    setGazetteDraft(selectedRequest.gazetteNoticeNumber ?? '');
    setPaymentScheduleText('');
  }, [selectedRequest]);

  const metrics = {
    total: requests.length,
    pending: requests.filter(r => r.status === ApplicationStatus.UNDER_SCRUTINY).length,
    approved: requests.filter(r => r.status === ApplicationStatus.APPROVED).length,
    budget: requests.reduce((acc, curr) => acc + curr.budget, 0)
  };

  const chartData = [
    { name: 'Jan', requests: 4 }, { name: 'Feb', requests: 3 }, { name: 'Mar', requests: 6 }, { name: 'Apr', requests: 2 }, { name: 'May', requests: 5 },
  ];

  useEffect(() => {
    if (!supabaseEnabled) return;

    setLoadingRequests(true);
    fetchRequests()
      .then(data => {
        if (data.length > 0) {
          setRequests(data);
        }
      })
      .catch(err => {
        console.error('Failed to load requests from Supabase', err);
      })
      .finally(() => {
        setLoadingRequests(false);
      });
  }, [supabaseEnabled]);

  const syncRequestState = (updatedRequest: AcquisitionRequest, updatedRequests: AcquisitionRequest[]) => {
    setRequests(updatedRequests);
    if (selectedRequest?.id === updatedRequest.id) {
      setSelectedRequest(updatedRequest);
    }
    if (supabaseEnabled) {
      persistRequest(updatedRequest);
    }
  };

  const handleLogin = (role: UserRole) => {
    setCurrentUserRole(role);
    setIsLoggedIn(true);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedRequest(null);
    setGeneratedContent(null);
    setMapInsights(null);
    setShowProfileMenu(false);
    setAnalysisResult(null);
    setSearchTerm('');
    setStatusFilter('All');
  };

  const addNotification = (message: string) => {
    setNotifications(prev => [
      { id: `${Date.now()}`, message, timestamp: new Date().toLocaleTimeString() },
      ...prev
    ]);
  };

  const validateRequiredDocs = (request: AcquisitionRequest) => {
    return REQUIRED_DOCUMENT_CATEGORIES.map(category => {
      const hasDoc = request.documents.some(d => (d.category === category || d.aiCategory === category));
      return { category, hasDoc };
    });
  };

  const handleGenerateNotice = async () => {
    if (!selectedRequest) return;
    setIsGeneratingNotice(true);
    try {
      let content = '';
      if (noticeType === 'intention') {
        content = await generateGazetteNotice({ ...selectedRequest, noticeType } as AcquisitionRequest & { noticeType: string });
      } else {
        content = `[SIMULATED NOTICE] Type: ${noticeType.toUpperCase()} for ${selectedRequest.title}`;
      }
      setGeneratedContent(content);
      setNoticeStatusMap(prev => ({ ...prev, [noticeType]: 'Generated' }));
      addNotification(`${ROLE_LABELS[currentUserRole]} generated ${noticeType} notice for ${selectedRequest.id}`);
    } finally {
      setIsGeneratingNotice(false);
    }
  };

  const handleFinalSurveyUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedRequest) return;
    setFinalSurveyUploads(prev => ({ ...prev, [selectedRequest.id]: file.name }));
    addNotification(`Final survey uploaded: ${file.name}`);
    event.target.value = '';
  };

  const handleGazetteNumberSave = () => {
    if (!selectedRequest || !gazetteDraft) return;
    const updatedRequest = { ...selectedRequest, gazetteNoticeNumber: gazetteDraft };
    const updatedRequests = requests.map(r => r.id === updatedRequest.id ? updatedRequest : r);
    syncRequestState(updatedRequest, updatedRequests);
    addNotification(`Gazette number ${gazetteDraft} recorded for ${updatedRequest.id}`);
  };

  const handlePaymentScheduleSave = () => {
    if (!selectedRequest || !paymentScheduleText) return;
    const updatedRequest = { ...selectedRequest, logs: [...selectedRequest.logs, { id: Date.now().toString(), action: 'Payment Schedule Set', user: ROLE_LABELS[currentUserRole], role: currentUserRole, timestamp: new Date().toLocaleString(), notes: paymentScheduleText }] };
    const updatedRequests = requests.map(r => (r.id === updatedRequest.id ? updatedRequest : r));
    syncRequestState(updatedRequest, updatedRequests);
    addNotification(`Payment schedule saved for ${updatedRequest.id}`);
  };

  const handleAction = (request: AcquisitionRequest, action: string, notes?: string) => {
    let newStatus = request.status;
    let fundsDeposited = request.fundsDeposited;
    const combinedNotes = notes ?? reviewComment ?? decisionRemarks ?? '';

    switch(action) {
      case 'SUBMIT': newStatus = ApplicationStatus.SUBMITTED; break;
      case 'SCRUTINIZE': newStatus = ApplicationStatus.UNDER_SCRUTINY; break;
      case 'DEFER': newStatus = ApplicationStatus.RETURNED_FOR_CORRECTION; break; // Added Deferral
      case 'RECOMMEND': newStatus = ApplicationStatus.PENDING_COMMITTEE; break;
      case 'APPROVE': newStatus = ApplicationStatus.APPROVED; break;
      case 'REJECT': newStatus = ApplicationStatus.REJECTED; break;
      case 'PUBLISH_GAZETTE': newStatus = ApplicationStatus.GAZETTE_INTENTION; break;
      case 'COMMISSION_SURVEY': newStatus = ApplicationStatus.INQUIRY_NOTICE; break; // Added Survey step
      case 'FINALIZE_VALUATION': newStatus = ApplicationStatus.COMPENSATION_SCHEDULE; break;
      case 'REQUEST_FUNDS': newStatus = ApplicationStatus.FUNDS_REQ_SENT; break; // Added Funds Logic
      case 'DEPOSIT_FUNDS': 
        newStatus = ApplicationStatus.FUNDS_DEPOSITED; 
        fundsDeposited = true; 
        break; 
      case 'ISSUE_AWARDS': newStatus = ApplicationStatus.AWARDS_ISSUED; break;
      case 'PROCESS_PAYMENT': newStatus = ApplicationStatus.PAYMENT_PROCESSING; break;
      case 'COMPLETE_PAYMENT': newStatus = ApplicationStatus.VESTING; break;
    }

    const updatedRequests = requests.map(r => {
      if (r.id === request.id) {
        return {
          ...r,
          status: newStatus,
          fundsDeposited: fundsDeposited,
          lastUpdated: new Date().toISOString().split('T')[0],
          logs: [
            ...r.logs,
            {
              id: Date.now().toString(),
              action: action,
              user: ROLE_LABELS[currentUserRole],
              role: currentUserRole,
              timestamp: new Date().toLocaleString(),
              notes: combinedNotes || undefined
            }
          ],
          stageEvents: ACTION_STAGE_MAP[action]
            ? [...r.stageEvents, createStageEvent(ACTION_STAGE_MAP[action].stage, ACTION_STAGE_MAP[action].description)]
            : r.stageEvents
        };
      }
      return r;
    });

    const updatedRequest = updatedRequests.find(r => r.id === request.id);
    if (updatedRequest) {
      syncRequestState(updatedRequest, updatedRequests);
    } else {
      setRequests(updatedRequests);
    }
    addNotification(`${ROLE_LABELS[currentUserRole]} executed ${action} on ${request.id}`);
    setReviewComment('');
    setDecisionRemarks('');
  };

  // Claimant Interaction for accepting/contesting
  const determineDocType = (name: string): Document['type'] => {
    const ext = name.split('.').pop()?.toUpperCase();
    if (ext === 'PDF' || ext === 'DOCX' || ext === 'CSV') {
      return ext as Document['type'];
    }
    return 'PDF';
  };

  const annotateDocumentFlow = (flow: Document['flow'], verificationStatus: string, summary: string) => flow.map(stage => {
    if (stage.status === 'Pending') {
      return {
        ...stage,
        status: verificationStatus === 'Verified' ? 'Approved' : 'Needs Info',
        comment: summary,
        updatedAt: new Date().toISOString()
      };
    }
    return stage;
  });

  const handleDocumentInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedRequest) return;

    const newDocument: Document = {
      id: `doc-${Date.now()}-${file.name}`,
      name: file.name,
      type: determineDocType(file.name),
      category: 'Acquisition Plan',
      uploadedBy: ROLE_LABELS[currentUserRole],
      date: new Date().toISOString().split('T')[0],
      verified: false,
      flow: createDocumentFlow()
    };

    const updatedRequest = {
      ...selectedRequest,
      documents: [...selectedRequest.documents, newDocument],
      logs: [
        ...selectedRequest.logs,
        {
          id: Date.now().toString(),
          action: 'Document Uploaded',
          user: ROLE_LABELS[currentUserRole],
          role: currentUserRole,
          timestamp: new Date().toLocaleString()
        } as LogEntry
      ]
    };

    const updatedRequests = requests.map(r => r.id === selectedRequest.id ? updatedRequest : r);
    syncRequestState(updatedRequest, updatedRequests);
    setVerifyingDocuments(prev => ({ ...prev, [newDocument.id]: true }));
    event.target.value = '';
    addNotification(`Document uploaded: ${file.name}`);
    try {
      const analysis = await analyzeDocument(newDocument.name, newDocument.category);
      applyDocumentAnalysis(selectedRequest.id, newDocument.id, analysis);
    } catch (error) {
      console.error('Document analysis failed', error);
      setVerifyingDocuments(prev => {
        const next = { ...prev };
        delete next[newDocument.id];
        return next;
      });
    }
  };

  const applyDocumentAnalysis = (requestId: string, documentId: string, result: AIAnalysisResult) => {
    setVerifyingDocuments(prev => {
      const next = { ...prev };
      delete next[documentId];
      return next;
    });

    const transform = (doc: Document) => {
      if (doc.id !== documentId) return doc;
      const aiCategory = result.suggestedCategory ?? doc.category;
      return {
        ...doc,
        verified: result.verificationStatus === 'Verified' || result.verificationStatus === 'Unverified' ? true : doc.verified,
        aiCategory,
        category: aiCategory,
        analysisSummary: result.summary
      };
    };

    setRequests(prev => prev.map(req => req.id === requestId ? {
      ...req,
      documents: req.documents.map(transform)
    } : req));

    setSelectedRequest(prev => {
      if (!prev || prev.id !== requestId) return prev;
      return {
        ...prev,
        documents: prev.documents.map(transform)
      };
    });
  };

  const createStageEvent = (stage: string, description: string, notes?: string): StageEvent => ({
    id: `stage-${stage.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    stage,
    description,
    timestamp: new Date().toLocaleString(),
    completed: true,
    triggeredBy: ROLE_LABELS[currentUserRole],
    notes
  });

  const handleClaimAction = (parcelId: string, action: 'ACCEPT' | 'CONTEST') => {
    if (!selectedRequest) return;
    const updatedParcels = selectedRequest.parcels.map(p => {
      if (p.id === parcelId) {
        return { ...p, status: action === 'ACCEPT' ? 'Accepted' : 'Contested' } as Parcel;
      }
      return p;
    });
    
    // In a real app, update main requests list too
    const updatedRequest = { ...selectedRequest, parcels: updatedParcels };
    setSelectedRequest(updatedRequest);
    
    // Update global state
    const updatedRequests = requests.map(r => r.id === selectedRequest.id ? updatedRequest : r);
    syncRequestState(updatedRequest, updatedRequests);
    
    alert(action === 'ACCEPT' ? 'You have successfully accepted the award. Payment processing will begin.' : 'Contestation logged. Please upload court documents.');
  };

  // AI and Document handlers
  const handleGenerateAI = async () => {
    if (!selectedRequest) return;
    setIsGeneratingNotice(true);
    const text = await generateGazetteNotice(selectedRequest);
    setGeneratedContent(text);
    setIsGeneratingNotice(false);
  };

  const handleMapAnalysis = async () => {
    if (!selectedRequest) return;
    setIsAnalyzingMap(true);
    const result = await getProjectLocationInsights(selectedRequest.title, 'Kenya');
    setMapInsights(result);
    setIsAnalyzingMap(false);
  };

  const handleDocumentAnalysis = async (docId: string, docName: string, category: string) => {
    setAnalyzingDocId(docId);
    try {
      const result = await analyzeDocument(docName, category);
      setAnalysisResult(result);
      setShowAnalysisModal(true);
    } finally {
      setAnalyzingDocId(null);
    }
  };

  const handleMergeAnalysisData = () => {
    if (!selectedRequest || !analysisResult) return;
    const updatedRequest = {
      ...selectedRequest,
      parcels: [...selectedRequest.parcels, ...analysisResult.extractedParcels],
      logs: [...selectedRequest.logs, { id: Date.now().toString(), action: 'AI Data Merge', user: 'System (AI)', role: currentUserRole, timestamp: new Date().toLocaleString() }],
      stageEvents: [...selectedRequest.stageEvents, createStageEvent('Parcels', 'New parcel added manually')]
    };
    setRequests(requests.map(r => r.id === selectedRequest.id ? updatedRequest : r));
    setSelectedRequest(updatedRequest);
    setShowAnalysisModal(false);
    setAnalysisResult(null);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `REQ-2023-00${requests.length + 1}`;
    const newRequest: AcquisitionRequest = {
      id: newId,
      title: newRequestForm.title,
      description: newRequestForm.description,
      acquiringBody: newRequestForm.acquiringBody,
      status: ApplicationStatus.SUBMITTED,
      dateCreated: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      documents: [],
      logs: [{ id: Date.now().toString(), action: 'Request Created', user: 'System', role: currentUserRole, timestamp: new Date().toLocaleString() }],
      parcels: [],
      budget: parseFloat(newRequestForm.budget) || 0,
      stageEvents: [createStageEvent('Submission', 'Request created and submitted')]
    };
    const updatedList = [newRequest, ...requests];
    setRequests(updatedList);
    if (supabaseEnabled) {
      persistRequest(newRequest);
    }
    setIsNewRequestModalOpen(false);
    setNewRequestForm({ title: '', description: '', budget: '', acquiringBody: 'KeNHA' });
    setActivePage('requests');
  };

  const handleAddParcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    const newParcel: Parcel = {
      id: `man-${Date.now()}`,
      parcelNumber: newParcelForm.parcelNumber,
      owner: newParcelForm.owner,
      size: newParcelForm.size,
      estimatedValue: parseFloat(newParcelForm.estimatedValue) || 0,
      coordinates: newParcelForm.coordinates,
      isUnregistered: newParcelForm.isUnregistered,
      status: 'Pending'
    };
    const updatedRequest = { ...selectedRequest, parcels: [...selectedRequest.parcels, newParcel] };
    setRequests(requests.map(r => r.id === selectedRequest.id ? updatedRequest : r));
    setSelectedRequest(updatedRequest);
    setIsAddParcelModalOpen(false);
    setNewParcelForm({ parcelNumber: '', owner: '', size: '', estimatedValue: '', coordinates: '', isUnregistered: false });
  };

  // --- Render Sections ---

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between"><div><p className="text-sm font-semibold text-slate-600">Total Requests</p><h3 className="text-3xl font-bold text-slate-900 mt-2">{metrics.total}</h3></div><div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileText size={24} /></div></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between"><div><p className="text-sm font-semibold text-slate-600">Pending Review</p><h3 className="text-3xl font-bold text-slate-900 mt-2">{metrics.pending}</h3></div><div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><Clock size={24} /></div></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between"><div><p className="text-sm font-semibold text-slate-600">Active Projects</p><h3 className="text-3xl font-bold text-slate-900 mt-2">{metrics.approved}</h3></div><div className="p-2 bg-green-50 rounded-lg text-green-600"><CheckCircle size={24} /></div></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between"><div><p className="text-sm font-semibold text-slate-600">Est. Budget</p><h3 className="text-2xl font-bold text-slate-900 mt-2">KES {(metrics.budget / 1000000).toFixed(1)}M</h3></div><div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Banknote size={24} /></div></div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-72">
          <h4 className="text-lg font-bold text-slate-800 mb-4">Acquisition Trends</h4>
          <ResponsiveContainer width="100%" height="90%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{fill: '#475569'}} /><YAxis tick={{fill: '#475569'}} /><Tooltip /><Bar dataKey="requests" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} /></BarChart></ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-72 overflow-y-auto">
          <h4 className="text-lg font-bold text-slate-800 mb-4">Pending Actions</h4>
          <div className="space-y-4">
            {requests.slice(0, 3).map(req => (
              <div key={req.id} className="flex justify-between p-3 bg-slate-50 rounded-lg border hover:border-blue-200 cursor-pointer" onClick={() => { setSelectedRequest(req); setActivePage('details'); }}>
                <div className="flex gap-3"><div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border font-bold text-slate-600">{req.acquiringBody.charAt(0)}</div><div><p className="font-bold text-sm text-slate-800">{req.title}</p><p className="text-xs text-slate-600">Submitted: {req.dateCreated}</p></div></div>
                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGazetteList = () => {
    const relevantRequests = requests.filter(r => [ApplicationStatus.APPROVED, ApplicationStatus.GAZETTE_INTENTION, ApplicationStatus.INQUIRY_NOTICE].includes(r.status));
    return (
      <div className="space-y-6">
         <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Gavel className="text-purple-600" /> Gazette Notices</h2>
         <div className="bg-white rounded-xl border shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-slate-50 border-b border-slate-200"><tr><th className="px-6 py-4 font-bold text-slate-700">Project</th><th className="px-6 py-4 font-bold text-slate-700">Acquiring Body</th><th className="px-6 py-4 font-bold text-slate-700">Status</th><th className="px-6 py-4 font-bold text-slate-700">Action</th></tr></thead>
            <tbody>{relevantRequests.map(req => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 font-medium text-slate-900">{req.title}</td><td className="px-6 py-4 text-slate-700">{req.acquiringBody}</td>
                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                    <td className="px-6 py-4">{req.status === ApplicationStatus.APPROVED && <button onClick={() => { setSelectedRequest(req); setActivePage('details'); }} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-bold hover:bg-purple-200">Draft Notice</button>}</td>
                  </tr>
                ))}</tbody></table></div></div>
    );
  };

  const renderValuationList = () => {
    const relevantRequests = requests.filter(r => [ApplicationStatus.GAZETTE_INTENTION, ApplicationStatus.INQUIRY_NOTICE, ApplicationStatus.INQUIRY_CONDUCTED].includes(r.status));
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><MapPin className="text-blue-600" /> Valuation & Inquiry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {relevantRequests.map(req => (
             <div key={req.id} className="bg-white rounded-xl border shadow-sm p-6">
                <div className="flex justify-between mb-4"><div><h3 className="font-bold text-lg text-slate-900">{req.title}</h3><p className="text-sm text-slate-600">{req.acquiringBody}</p></div><StatusBadge status={req.status} /></div>
                <div className="flex gap-2">
                   <button onClick={() => handleAction(req, 'COMMISSION_SURVEY')} disabled={req.status !== ApplicationStatus.GAZETTE_INTENTION} className="flex-1 py-2 text-center text-xs border rounded-lg hover:bg-slate-50 font-medium text-slate-700">Commission Survey</button>
                   <button onClick={() => handleAction(req, 'FINALIZE_VALUATION')} disabled={req.status === ApplicationStatus.GAZETTE_INTENTION} className="flex-1 py-2 text-center text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Prepare Schedule</button>
                </div>
             </div>
           ))}
        </div>
      </div>
    );
  };

  const renderPaymentList = () => {
    // Show requests that have a schedule, or awards issued, or pending funds
    const relevantRequests = requests.filter(r => [ApplicationStatus.COMPENSATION_SCHEDULE, ApplicationStatus.FUNDS_REQ_SENT, ApplicationStatus.FUNDS_DEPOSITED, ApplicationStatus.AWARDS_ISSUED, ApplicationStatus.PAYMENT_PROCESSING].includes(r.status));
    
    // Acquiring Body needs to see requests where they need to Deposit Funds
    const isAcquiringBody = currentUserRole === UserRole.ACQUIRING_BODY;
    const isFinance = currentUserRole === UserRole.FINANCE;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Banknote className="text-green-600" /> Payment & Funds</h2>
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-slate-50 border-b border-slate-200"><tr><th className="px-6 py-4 font-bold text-slate-700">Project</th><th className="px-6 py-4 font-bold text-slate-700">Amount</th><th className="px-6 py-4 font-bold text-slate-700">Fund Status</th><th className="px-6 py-4 font-bold text-slate-700">Action</th></tr></thead>
              <tbody>{relevantRequests.map(req => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 font-medium text-slate-900">{req.title}</td>
                    <td className="px-6 py-4 font-mono text-slate-700">KES {(req.budget).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {req.fundsDeposited ? <span className="text-green-700 font-medium flex items-center gap-1"><CheckCircle size={14} /> Deposited</span> : <span className="text-orange-600 font-medium flex items-center gap-1"><AlertTriangle size={14} /> Pending</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {/* Acquiring Body Logic: Deposit Funds */}
                       {isAcquiringBody && req.status === ApplicationStatus.FUNDS_REQ_SENT && (
                         <button onClick={() => handleAction(req, 'DEPOSIT_FUNDS')} className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700">Deposit Funds</button>
                       )}
                       {/* Finance Logic: Issue Awards only after funds deposited */}
                       {isFinance && req.status === ApplicationStatus.FUNDS_DEPOSITED && (
                          <button onClick={() => handleAction(req, 'ISSUE_AWARDS')} className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700">Issue Awards</button>
                       )}
                       {/* Finance Logic: Process Payment */}
                       {isFinance && req.status === ApplicationStatus.AWARDS_ISSUED && (
                         <button onClick={() => handleAction(req, 'PROCESS_PAYMENT')} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700">Disburse</button>
                       )}
                    </td>
                  </tr>
                ))}</tbody></table></div></div>
    );
  };

  const renderMarketData = () => {
    // ... (unchanged)
    return <div className="p-6 text-center text-slate-500">Market Data Module Loaded</div>;
  };

  const renderClaimsList = () => {
    // Assuming currentUserRole is INTERESTED_PARTY
    // Filter claims for this user (Mocked to project)
    const myClaims = selectedRequest ? selectedRequest.parcels : []; 

    return (
       <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Users className="text-green-600" /> My Claims Portal</h2>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-slate-50 border-b border-slate-200"><tr><th className="px-6 py-4 font-bold text-slate-700">Parcel</th><th className="px-6 py-4 font-bold text-slate-700">Award Amount</th><th className="px-6 py-4 font-bold text-slate-700">Status</th><th className="px-6 py-4 font-bold text-slate-700 text-right">Decision</th></tr></thead>
                <tbody>
                    <tr className="border-b">
                        <td className="px-6 py-4 text-slate-900 font-medium">KJM/BLOCK/102</td>
                        <td className="px-6 py-4 font-bold text-slate-900">KES 5,000,000</td>
                        <td className="px-6 py-4"><StatusBadge status="Awards Issued" /></td>
                        <td className="px-6 py-4 text-right flex gap-2 justify-end">
                            <button onClick={() => alert("Letter Downloaded")} className="text-blue-700 font-medium text-xs border border-blue-200 px-2 py-1 rounded hover:bg-blue-50">View Letter</button>
                            <button onClick={() => handleClaimAction('p1', 'ACCEPT')} className="bg-green-600 text-white font-bold text-xs px-3 py-1 rounded hover:bg-green-700">Accept</button>
                            <button onClick={() => handleClaimAction('p1', 'CONTEST')} className="bg-red-50 text-red-700 font-bold text-xs px-3 py-1 rounded border border-red-200 hover:bg-red-100">Contest</button>
                        </td>
                    </tr>
                </tbody></table></div></div>
    )
 }

  const renderRequestList = () => {
    const filteredRequests = requests.filter(req => {
      return (req.title.toLowerCase().includes(searchTerm.toLowerCase()) || req.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
             (statusFilter === 'All' || req.status === statusFilter);
    });
    const canCreateRequest = currentUserRole === UserRole.ACQUIRING_BODY;

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div><h2 className="text-2xl font-bold text-slate-900">Acquisition Requests</h2><p className="text-slate-600 text-sm font-medium">Manage acquisition projects.</p></div>
          <div className="flex gap-2">
             <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border rounded-lg w-64 text-slate-900" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
             <div className="relative" ref={filterRef}>
                <button onClick={() => setShowFilterMenu(!showFilterMenu)} className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white text-slate-700 font-medium hover:bg-slate-50"><Filter size={18} /><span>{statusFilter}</span></button>
                {showFilterMenu && (<div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl z-20 border"><div className="max-h-60 overflow-y-auto"><button onClick={() => {setStatusFilter('All'); setShowFilterMenu(false)}} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700">All</button>{Object.values(ApplicationStatus).map(s => <button key={s} onClick={() => {setStatusFilter(s); setShowFilterMenu(false)}} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700">{s}</button>)}</div></div>)}
             </div>
             {canCreateRequest && <button onClick={() => setIsNewRequestModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"><Plus size={18} /> New Request</button>}
          </div>
        </div>
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm"><thead className="bg-slate-50 border-b border-slate-200"><tr><th className="px-6 py-4 font-bold text-slate-700">ID</th><th className="px-6 py-4 font-bold text-slate-700">Title</th><th className="px-6 py-4 font-bold text-slate-700">Body</th><th className="px-6 py-4 font-bold text-slate-700">Date</th><th className="px-6 py-4 font-bold text-slate-700">Status</th><th className="px-6 py-4 text-right font-bold text-slate-700">Action</th></tr></thead>
            <tbody>{filteredRequests.map(req => (<tr key={req.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0"><td className="px-6 py-4 font-mono text-slate-600">{req.id}</td><td className="px-6 py-4 font-bold text-slate-900">{req.title}</td><td className="px-6 py-4 text-slate-700">{req.acquiringBody}</td><td className="px-6 py-4 text-slate-600">{req.dateCreated}</td><td className="px-6 py-4"><StatusBadge status={req.status} /></td><td className="px-6 py-4 text-right"><button onClick={() => { setSelectedRequest(req); setActivePage('details'); setMapInsights(null); }} className="text-blue-700 font-bold text-xs hover:underline">Details</button></td></tr>))}</tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderRequestDetails = () => {
    if (!selectedRequest) return null;

    // Role-Based Permissions for Actions
    const isDirector = currentUserRole === UserRole.DIRECTOR_VALUATION || currentUserRole === UserRole.NLCC_CHAIRMAN;
    const isCommittee = currentUserRole === UserRole.COMMITTEE;
    const isPrinter = currentUserRole === UserRole.GOVT_PRINTER;
    const isAcquiringBody = currentUserRole === UserRole.ACQUIRING_BODY;
    const isValuer = currentUserRole === UserRole.VALUATION_TEAM;
    const validationResults = validateRequiredDocs(selectedRequest);
    const missingDocs = validationResults.filter(result => !result.hasDoc);
    const contestedParcels = selectedRequest.parcels.filter(p => p.status === 'Contested');
    const finalSurveyFile = finalSurveyUploads[selectedRequest.id];

    return (
      <div className="space-y-6">
        <button onClick={() => { setSelectedRequest(null); setActivePage('requests'); }} className="text-slate-600 hover:text-slate-900 text-sm mb-2 font-medium">&larr; Back</button>
        <div className="flex justify-between items-center">
          <div><h2 className="text-2xl font-bold text-slate-900">{selectedRequest.title}</h2><p className="text-slate-600 font-medium">{selectedRequest.id}</p></div>
          <div className="flex gap-2">
            {/* Scrutiny Phase: Defer or Recommend */}
            {isDirector && selectedRequest.status === ApplicationStatus.SUBMITTED && (
              <button onClick={() => handleAction(selectedRequest, 'SCRUTINIZE')} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Start Scrutiny</button>
            )}
            {isDirector && selectedRequest.status === ApplicationStatus.UNDER_SCRUTINY && (
              <>
                <button onClick={() => handleAction(selectedRequest, 'DEFER')} className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg font-bold hover:bg-orange-200">Return for Corrections</button>
                <button onClick={() => handleAction(selectedRequest, 'RECOMMEND')} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Submit to Committee</button>
              </>
            )}
            
            {/* Committee Phase */}
            {isCommittee && selectedRequest.status === ApplicationStatus.PENDING_COMMITTEE && (
               <>
                <button onClick={() => handleAction(selectedRequest, 'REJECT')} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">Reject</button>
                <button onClick={() => handleAction(selectedRequest, 'APPROVE')} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">Approve</button>
               </>
            )}
            
            {/* Gazette & Survey */}
            {isPrinter && selectedRequest.status === ApplicationStatus.APPROVED && (
               <button onClick={() => handleAction(selectedRequest, 'PUBLISH_GAZETTE')} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700">Publish Gazette</button>
            )}
            {isValuer && selectedRequest.status === ApplicationStatus.GAZETTE_INTENTION && (
               <button onClick={() => handleAction(selectedRequest, 'COMMISSION_SURVEY')} className="px-4 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900">Commission Survey</button>
            )}
            {isValuer && selectedRequest.status === ApplicationStatus.INQUIRY_CONDUCTED && (
              <button onClick={() => handleAction(selectedRequest, 'FINALIZE_VALUATION')} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Finalize Schedule</button>
            )}

            {/* Funds Request */}
            {isDirector && selectedRequest.status === ApplicationStatus.COMPENSATION_SCHEDULE && (
               <button onClick={() => handleAction(selectedRequest, 'REQUEST_FUNDS')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">Request Funds</button>
            )}
            
            {/* Acquiring Body Deposit */}
            {isAcquiringBody && selectedRequest.status === ApplicationStatus.FUNDS_REQ_SENT && (
               <button onClick={() => handleAction(selectedRequest, 'DEPOSIT_FUNDS')} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">Deposit Funds</button>
            )}
          </div>
        </div>
        <Timeline status={selectedRequest.status} />
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Stage History</h3>
            <span className="text-xs text-slate-500">{selectedRequest.stageEvents.length} events</span>
          </div>
          <div className="space-y-3">
            {selectedRequest.stageEvents.slice().reverse().map(event => (
              <div key={event.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{event.stage}</p>
                  <p className="text-xs text-slate-500">{event.description}</p>
                  <p className="text-xs text-slate-400">{event.timestamp}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">{event.triggeredBy}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Validation & Document Viewer</h3>
              <span className="text-[10px] uppercase tracking-wide text-slate-500">{selectedRequest.documents.length} docs</span>
            </div>
            <p className="text-xs text-slate-500">{missingDocs.length === 0 ? 'All required documents uploaded.' : `${missingDocs.length} document${missingDocs.length > 1 ? 's' : ''} missing: ${missingDocs.map(item => item.category).join(', ')}`}</p>
            <div className="space-y-2">
              {selectedRequest.documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between gap-2 border border-slate-100 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.category} • {doc.type} • {doc.verified ? 'Verified' : 'Pending verification'}</p>
                  </div>
                  <button onClick={() => setDocumentViewerDoc(doc)} className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:text-blue-700"><Eye size={12} />View</button>
                </div>
              ))}
            </div>
            {documentViewerDoc && (
              <div className="mt-2 border border-blue-50 bg-blue-50 rounded-xl p-3 text-xs text-slate-700 space-y-1">
                <p className="text-sm font-bold text-slate-900">{documentViewerDoc.name}</p>
                <p>Category: {documentViewerDoc.category}</p>
                <p>Uploaded: {documentViewerDoc.date}</p>
                <p>Status: {documentViewerDoc.verified ? 'Verified' : 'Pending verification'}</p>
                <p className="text-[11px] text-slate-500">{documentViewerDoc.analysisSummary ?? 'No AI summary yet.'}</p>
                <button onClick={() => setDocumentViewerDoc(null)} className="text-[11px] text-blue-700 font-semibold hover:underline">Close viewer</button>
              </div>
            )}
            {contestedParcels.length > 0 && (
              <div className="mt-2 border-t border-slate-100 pt-2 space-y-1 text-[11px]">
                <p className="uppercase tracking-wide text-slate-500 font-semibold">Contestation log</p>
                {contestedParcels.map(parcel => (
                  <p key={parcel.id} className="flex items-center justify-between text-slate-700">
                    <span>{parcel.parcelNumber}</span>
                    <span className="text-amber-600 font-semibold">{parcel.status}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Notice & Survey Kit</h3>
            <div className="space-y-2 text-xs">
              <label className="text-[10px] uppercase tracking-wide text-slate-500">Notice type</label>
              <div className="flex flex-wrap gap-2">
                {['intention', 'inquiry', 'awards', 'possession', 'vesting'].map(type => (
                  <button key={type} onClick={() => setNoticeType(type as typeof noticeType)} className={`px-3 py-1 text-[11px] rounded-full border ${noticeType === type ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-300 text-slate-500 hover:border-slate-500'}`}>
                    {type}
                  </button>
                ))}
              </div>
              <button onClick={handleGenerateNotice} disabled={isGeneratingNotice} className="w-full px-3 py-2 bg-purple-600 text-white text-xs rounded-lg">
                {isGeneratingNotice ? 'Generating notice…' : 'Generate notice'}
              </button>
              <p className="text-[10px] text-slate-500">Status: {noticeStatusMap[noticeType] ?? 'Pending'}</p>
              {generatedContent && (
                <div className="text-[11px] bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {generatedContent}
                </div>
              )}
            </div>
            <div className="border-t border-slate-100 pt-2 space-y-2 text-xs">
              <p className="font-semibold text-slate-800">Final Survey Upload</p>
              <div className="flex flex-wrap gap-2">
                <input ref={finalSurveyInputRef} type="file" className="hidden" onChange={handleFinalSurveyUpload} />
                <button onClick={() => finalSurveyInputRef.current?.click()} className="px-3 py-1 text-[11px] rounded-lg border border-slate-300 hover:border-slate-400">Upload survey</button>
                {finalSurveyFile && <span className="text-[11px] text-slate-500">{finalSurveyFile}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wide text-slate-500">Gazette number</label>
                <div className="flex gap-2">
                  <input value={gazetteDraft} onChange={e => setGazetteDraft(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs" placeholder="Enter gazette number" />
                  <button onClick={handleGazetteNumberSave} disabled={!gazetteDraft} className="px-3 py-2 bg-purple-600 text-white text-xs rounded-lg">Save</button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wide text-slate-500">Payment schedule notes</label>
                <textarea value={paymentScheduleText} onChange={e => setPaymentScheduleText(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs" placeholder="Summarize the payment plan" />
                <button onClick={handlePaymentScheduleSave} disabled={!paymentScheduleText} className="px-3 py-2 bg-emerald-600 text-white text-xs rounded-lg">Save schedule</button>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Review & Decision Panel</h3>
            <label className="text-[10px] uppercase tracking-wide text-slate-500">Review comment</label>
            <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs" placeholder="Director notes" />
            <label className="text-[10px] uppercase tracking-wide text-slate-500">Decision remarks</label>
            <textarea value={decisionRemarks} onChange={e => setDecisionRemarks(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs" placeholder="Committee remarks" />
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleAction(selectedRequest, 'APPROVE', decisionRemarks)} disabled={selectedRequest.status !== ApplicationStatus.PENDING_COMMITTEE} className="px-3 py-2 bg-green-600 text-white text-xs rounded-lg">Approve</button>
              <button onClick={() => handleAction(selectedRequest, 'REJECT', decisionRemarks)} disabled={selectedRequest.status !== ApplicationStatus.PENDING_COMMITTEE} className="px-3 py-2 bg-red-600 text-white text-xs rounded-lg">Reject</button>
              <button onClick={() => handleAction(selectedRequest, 'DEFER', reviewComment)} disabled={selectedRequest.status !== ApplicationStatus.UNDER_SCRUTINY} className="px-3 py-2 bg-orange-100 text-orange-800 text-xs rounded-lg border border-orange-200">Return for corrections</button>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800">Forward to next office</h3>
            <span className="text-[10px] uppercase tracking-wide text-slate-500">{selectedRequest.status}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {FORWARD_ACTIONS.map(fwd => {
              const available = canForwardAction(selectedRequest.status, fwd.action);
              return (
                <button key={fwd.action} onClick={() => handleAction(selectedRequest, fwd.action)} disabled={!available} className={`px-3 py-2 text-xs rounded-lg font-semibold ${available ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 cursor-not-allowed'}`}>
                  {fwd.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                 <h3 className="font-bold text-slate-800 mb-4">Description</h3>
                 <p className="text-slate-700 leading-relaxed">{selectedRequest.description}</p>
                 <div className="flex gap-4 mt-4"><div className="bg-slate-100 p-3 rounded font-medium text-slate-800">Parcels: {selectedRequest.parcels.length}</div><div className="bg-slate-100 p-3 rounded font-medium text-slate-800">Budget: KES {selectedRequest.budget.toLocaleString()}</div></div>
              </div>
              
              {/* Parcels Table */}
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 flex justify-between border-b border-slate-200">
                   <h3 className="font-bold text-slate-800">Affected Parcels</h3>
                   <button onClick={() => setIsAddParcelModalOpen(true)} className="text-xs bg-white border border-slate-300 px-2 py-1 rounded flex items-center gap-1 font-medium hover:bg-slate-50"><Plus size={12}/> Add</button>
                </div>
                <table className="w-full text-sm text-left"><thead className="bg-slate-50"><tr><th className="px-4 py-2 font-bold text-slate-700">No</th><th className="px-4 py-2 font-bold text-slate-700">Owner</th><th className="px-4 py-2 font-bold text-slate-700">Size</th><th className="px-4 py-2 font-bold text-slate-700">Status</th></tr></thead>
                  <tbody>{selectedRequest.parcels.map(p => (<tr key={p.id} className="border-b last:border-0"><td className="px-4 py-2 font-medium text-slate-900">{p.parcelNumber}</td><td className="px-4 py-2 text-slate-700">{p.owner}</td><td className="px-4 py-2 text-slate-700">{p.size}</td><td className="px-4 py-2"><StatusBadge status={p.status} /></td></tr>))}</tbody></table>
              </div>
           </div>
           
           <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                 <h3 className="font-bold text-slate-800 mb-4">Location Intelligence</h3>
                 {!mapInsights ? (
                   <button onClick={handleMapAnalysis} disabled={isAnalyzingMap} className="w-full py-2 border rounded flex justify-center items-center gap-2 font-medium text-slate-700 hover:bg-slate-50">
                     {isAnalyzingMap ? 'Analyzing...' : 'Check Location'}
                   </button>
                 ) : (
                   <div className="space-y-3">
                     <div className="bg-slate-50 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words max-h-64 overflow-y-auto rounded-xl p-3 border border-slate-100 text-justify">
                       {mapInsights.text}
                     </div>
                     <div className="flex flex-wrap gap-2">
                       {mapInsights.links.map(link => (
                         <a key={link.uri} href={link.uri} target="_blank" rel="noreferrer" className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                           {link.title}
                         </a>
                       ))}
                     </div>
                     <button onClick={() => setMapInsights(null)} className="text-xs text-blue-700 font-semibold hover:underline">
                       Clear
                     </button>
                   </div>
                 )}
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm">
               <h3 className="font-bold text-slate-800 mb-4">Documents</h3>
               <div className="space-y-3">
                 {REQUIRED_DOCUMENT_CATEGORIES.map(category => {
                   const doc = selectedRequest.documents.find(d => d.category === category || d.aiCategory === category);
                   const isVerifying = doc && verifyingDocuments[doc.id];
                   const statusLabel = doc ? (doc.verified ? 'Verified by AI' : isVerifying ? 'Verifying...' : 'Awaiting verification') : 'Awaiting upload';
                   const statusColor = doc ? (doc.verified ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : isVerifying ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-amber-600 bg-amber-50 border-amber-100') : 'text-slate-600 bg-slate-50 border-slate-100';
                   const aiBadge = doc?.aiCategory && doc.aiCategory !== category ? <p className="text-[10px] text-slate-500 italic">Detected: {doc.aiCategory}</p> : null;
                   return (
                     <div key={category} className="flex items-center justify-between gap-3 border border-slate-100 rounded-xl p-3 bg-slate-50 shadow-sm">
                       <div>
                         <p className="text-sm font-semibold text-slate-900">{category}</p>
                         <p className="text-xs text-slate-500">{doc ? doc.name : 'Document not uploaded yet'}</p>
                         {aiBadge}
                       </div>
                       <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColor}`}>{statusLabel}</span>
                     </div>
                   );
                 })}
               </div>
               <div className="space-y-2 mt-4">
                 {selectedRequest.documents.map(d => (
                   <div key={d.id} className="p-2 border rounded flex justify-between bg-slate-50">
                     <div className="flex flex-col">
                       <span className="text-sm font-medium text-slate-700">{d.name}</span>
                       <span className="text-xs text-slate-400">{d.category}</span>
                     </div>
                     <div className="flex items-center gap-2 text-xs font-semibold">
                       {d.verified ? <CheckCircle size={14} className="text-emerald-500"/> : <AlertTriangle size={14} className="text-amber-500"/>}
                       {d.verified ? 'Verified' : 'Pending verification'}
                     </div>
                   </div>
                 ))}
               </div>
               <input ref={documentInputRef} type="file" className="hidden" onChange={handleDocumentInputChange} />
               <button onClick={() => documentInputRef.current?.click()} className="w-full mt-4 border border-dashed border-slate-400 py-2 rounded text-slate-600 text-sm flex items-center justify-center gap-2 hover:bg-slate-50 font-medium"><Upload size={14}/> Upload</button>
            </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                 <h3 className="font-bold text-slate-800 mb-4">Audit Trail</h3>
                 <div className="space-y-4 pl-4 border-l-2 border-slate-200">{selectedRequest.logs.map(l => <div key={l.id} className="relative"><div className="absolute -left-[21px] top-1 w-3 h-3 bg-slate-400 rounded-full"></div><p className="text-sm font-bold text-slate-800">{l.action}</p><p className="text-xs text-slate-500 font-medium">{l.timestamp}</p></div>)}</div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  // --- Modals (Request, Parcel, AI) ---
  const renderNewRequestModal = () => isNewRequestModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
       <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
          <h3 className="text-xl font-bold mb-4 text-slate-900">New Request</h3>
          <form onSubmit={handleCreateRequest} className="space-y-4">
             <input className="w-full border border-slate-300 p-2 rounded text-slate-900 placeholder:text-slate-500" placeholder="Title" required value={newRequestForm.title} onChange={e => setNewRequestForm({...newRequestForm, title: e.target.value})} />
             <input className="w-full border border-slate-300 p-2 rounded text-slate-900 placeholder:text-slate-500" placeholder="Budget" type="number" required value={newRequestForm.budget} onChange={e => setNewRequestForm({...newRequestForm, budget: e.target.value})} />
             <textarea className="w-full border border-slate-300 p-2 rounded text-slate-900 placeholder:text-slate-500" placeholder="Description" rows={3} required value={newRequestForm.description} onChange={e => setNewRequestForm({...newRequestForm, description: e.target.value})} />
             <div className="flex justify-end gap-2"><button type="button" onClick={() => setIsNewRequestModalOpen(false)} className="px-4 py-2 border rounded font-medium text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Submit</button></div>
          </form>
       </div>
    </div>
  );

  const renderAddParcelModal = () => isAddParcelModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
       <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
          <h3 className="text-xl font-bold mb-4 text-slate-900">Add Parcel</h3>
          <form onSubmit={handleAddParcel} className="space-y-4">
             <input className="w-full border border-slate-300 p-2 rounded text-slate-900 placeholder:text-slate-500" placeholder="Parcel Number" required value={newParcelForm.parcelNumber} onChange={e => setNewParcelForm({...newParcelForm, parcelNumber: e.target.value})} />
             <input className="w-full border border-slate-300 p-2 rounded text-slate-900 placeholder:text-slate-500" placeholder="Owner" required value={newParcelForm.owner} onChange={e => setNewParcelForm({...newParcelForm, owner: e.target.value})} />
             <input className="w-full border border-slate-300 p-2 rounded text-slate-900 placeholder:text-slate-500" placeholder="Size (Ha)" required value={newParcelForm.size} onChange={e => setNewParcelForm({...newParcelForm, size: e.target.value})} />
             <div className="flex justify-end gap-2"><button type="button" onClick={() => setIsAddParcelModalOpen(false)} className="px-4 py-2 border rounded font-medium text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Add</button></div>
          </form>
       </div>
    </div>
  );

  const renderAnalysisModal = () => showAnalysisModal && analysisResult && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
       <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
          <h3 className="text-xl font-bold mb-4 text-slate-900">AI Analysis</h3>
          <div className="p-4 bg-slate-50 rounded mb-4 text-sm text-slate-700 leading-relaxed border border-slate-200">{analysisResult.summary}</div>
          <div className="flex justify-end gap-2"><button onClick={() => setShowAnalysisModal(false)} className="px-4 py-2 border rounded font-medium text-slate-700 hover:bg-slate-50">Close</button><button onClick={handleMergeAnalysisData} className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Merge Data</button></div>
       </div>
    </div>
  );

  // --- Main Render ---

  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar currentRole={currentUserRole} activePage={activePage} onChangePage={(p) => { setActivePage(p); setSelectedRequest(null); }} onLogout={handleLogout} onSettings={() => setActivePage('settings')} />
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 capitalize">{activePage}</h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-slate-100 px-3 py-1 rounded border border-slate-200"><span className="text-[10px] font-bold text-slate-500 uppercase">VIEW AS</span><span className="text-xs bg-slate-800 text-white px-2 py-1 rounded font-bold shadow-sm">{ROLE_LABELS[currentUserRole]}</span></div>
            <div className="relative" ref={notificationRef}><button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-slate-600 hover:text-blue-600 transition-colors"><Bell size={20}/></button>
              {showNotifications && <div className="absolute right-0 top-full mt-2 w-72 bg-white shadow-xl border border-slate-200 rounded-lg p-0 z-50 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-bold text-xs text-slate-600">NOTIFICATIONS</div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-slate-600">No notifications yet.</div>
                ) : (
                  notifications.map(note => (
                    <div key={note.id} className="p-3 border-b border-slate-100 last:border-0 bg-white hover:bg-slate-50 cursor-pointer">
                      <p className="text-sm font-medium text-slate-800">{note.message}</p>
                      <p className="text-[11px] text-slate-400">{note.timestamp}</p>
                    </div>
                  ))
                )}
              </div>}
            </div>
            <div className="relative" ref={profileRef}>
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm cursor-pointer shadow-md hover:bg-blue-700 transition-colors" onClick={() => setShowProfileMenu(!showProfileMenu)}>JD</div>
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl border border-slate-200 rounded-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100"><p className="text-sm font-bold text-slate-900">John Doe</p><p className="text-xs text-slate-500">{ROLE_LABELS[currentUserRole]}</p></div>
                  <button onClick={() => { setActivePage('settings'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Settings size={14}/> Settings</button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut size={14}/> Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activePage === 'dashboard' && renderDashboard()}
          {activePage === 'requests' && renderRequestList()}
          {activePage === 'details' && renderRequestDetails()}
          {activePage === 'gazettes' && renderGazetteList()}
          {activePage === 'valuation' && renderValuationList()}
          {activePage === 'payments' && renderPaymentList()}
          {activePage === 'market-data' && renderMarketData()}
          {activePage === 'claims' && renderClaimsList()}
          {activePage === 'settings' && <div className="p-12 text-center text-slate-400 font-medium">Settings Page Under Construction</div>}
        </div>
        
        {renderNewRequestModal()} {renderAddParcelModal()} {renderAnalysisModal()}
      </main>
    </div>
  );
};

export default App;
