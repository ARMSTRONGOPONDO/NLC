
export enum UserRole {
  ACQUIRING_BODY = 'ACQUIRING_BODY',
  NLCC_CHAIRMAN = 'NLCC_CHAIRMAN',
  DIRECTOR_VALUATION = 'DIRECTOR_VALUATION',
  VALUATION_TEAM = 'VALUATION_TEAM',
  LEGAL_TEAM = 'LEGAL_TEAM',
  LAND_REGISTRAR = 'LAND_REGISTRAR',
  COMMITTEE = 'LAND_ACQUISITION_COMMITTEE',
  GOVT_PRINTER = 'GOVT_PRINTER',
  FINANCE = 'FINANCE',
  INTERESTED_PARTY = 'INTERESTED_PARTY'
}

export enum ApplicationStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  UNDER_SCRUTINY = 'Under Scrutiny',
  RETURNED_FOR_CORRECTION = 'Returned for Correction', // Added per PDF feedback loop
  PENDING_COMMITTEE = 'Pending Committee',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  GAZETTE_INTENTION = 'Gazette Notice (Intention)',
  PUBLIC_PARTICIPATION = 'Public Participation',
  INQUIRY_NOTICE = 'Notice of Inquiry',
  INQUIRY_CONDUCTED = 'Inquiry Conducted',
  COMPENSATION_SCHEDULE = 'Compensation Schedule',
  FUNDS_REQ_SENT = 'Funds Requested', // Added per PDF Node 15
  FUNDS_DEPOSITED = 'Funds Deposited', // Added per PDF Node 15
  AWARDS_ISSUED = 'Awards Issued',
  PAYMENT_PROCESSING = 'Payment Processing',
  VESTING = 'Vesting',
  TITLE_REGISTERED = 'Title Registered'
}

export type DocumentCategory = 'Acquisition Plan' | 'Parcel List' | 'ESIA Report' | 'Project Cert' | 'RAP Report' | 'Funds Avail';

export type DocumentFlowStageStatus = 'Pending' | 'In Review' | 'Approved' | 'Needs Info';

export interface DocumentFlowStage {
  id: string;
  name: string;
  department: string;
  status: DocumentFlowStageStatus;
  comment?: string;
  updatedAt?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'PDF' | 'CSV' | 'DOCX';
  category: DocumentCategory;
  uploadedBy: string;
  date: string;
  verified: boolean;
  flow: DocumentFlowStage[];
  aiCategory?: DocumentCategory;
  analysisSummary?: string;
}

export interface LogEntry {
  id: string;
  action: string;
  user: string;
  role: UserRole;
  timestamp: string;
  notes?: string;
}

export interface Parcel {
  id: string;
  parcelNumber: string; // OR Coordinate ID for unregistered
  owner: string;
  size: string;
  estimatedValue: number;
  coordinates: string;
  isUnregistered: boolean;
  status: 'Pending' | 'Verified' | 'Contested' | 'Compensated' | 'Accepted'; // Added Accepted
}

export interface AcquisitionRequest {
  id: string;
  title: string;
  description: string;
  acquiringBody: string;
  status: ApplicationStatus;
  dateCreated: string;
  lastUpdated: string;
  documents: Document[];
  logs: LogEntry[];
  parcels: Parcel[];
  budget: number;
  gazetteNoticeNumber?: string;
  fundsDeposited?: boolean; // Track if applicant has paid
  stageEvents: StageEvent[];
}

export interface StageEvent {
  id: string;
  stage: string;
  description: string;
  timestamp: string;
  completed: boolean;
  triggeredBy: string;
  notes?: string;
}

export interface Stats {
  totalRequests: number;
  pendingReviews: number;
  totalCompensation: number;
  completedProjects: number;
}

export interface AIAnalysisResult {
  summary: string;
  extractedParcels: Parcel[];
  discrepancies: string[];
  verificationStatus: 'Verified' | 'Issues Found' | 'Unverified';
  suggestedCategory?: DocumentCategory;
}
