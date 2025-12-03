import { AcquisitionRequest, ApplicationStatus, UserRole, Document, Parcel, DocumentFlowStageStatus } from './types';

const DOCUMENT_FLOW_SEQUENCE = [
  { name: 'Acquiring Body Intake', department: 'Acquiring Body' },
  { name: 'Land Registrar Check', department: 'Land Registrar' },
  { name: 'Legal Assessment', department: 'Legal Team' },
  { name: 'Valuation Review', department: 'Valuation Team' },
  { name: 'NLCC Chairman Review', department: 'NLCC Chairman' }
];

export const createDocumentFlow = (): Document['flow'] =>
  DOCUMENT_FLOW_SEQUENCE.map((stage, index) => ({
    id: `flow-${stage.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`,
    name: stage.name,
    department: stage.department,
    status: 'Pending' as DocumentFlowStageStatus,
    updatedAt: new Date().toISOString()
  }));

export const MOCK_DOCUMENTS: Document[] = [
  { id: 'd1', name: 'Acquisition Plan v1.pdf', type: 'PDF', category: 'Acquisition Plan', uploadedBy: 'KeNHA', date: '2023-10-01', verified: true, flow: createDocumentFlow() },
  { id: 'd2', name: 'Affected Parcels List.pdf', type: 'PDF', category: 'Parcel List', uploadedBy: 'KeNHA', date: '2023-10-01', verified: true, flow: createDocumentFlow() },
  { id: 'd3', name: 'ESIA Report.pdf', type: 'PDF', category: 'ESIA Report', uploadedBy: 'NEMA', date: '2023-09-15', verified: true, flow: createDocumentFlow() },
  { id: 'd4', name: 'RAP Report.pdf', type: 'PDF', category: 'RAP Report', uploadedBy: 'Consultant', date: '2023-10-02', verified: false, flow: createDocumentFlow() },
  { id: 'd5', name: 'Funds Availability Cert.pdf', type: 'PDF', category: 'Funds Avail', uploadedBy: 'Treasury', date: '2023-10-05', verified: true, flow: createDocumentFlow() }
];

export const MOCK_PARCELS: Parcel[] = [
  { id: 'p1', parcelNumber: 'KJM/BLOCK/102', owner: 'John Doe', size: '0.5 Ha', estimatedValue: 5000000, coordinates: '-1.2921, 36.8219', isUnregistered: false, status: 'Verified' },
  { id: 'p2', parcelNumber: 'KJM/BLOCK/103', owner: 'Jane Smith', size: '1.2 Ha', estimatedValue: 12000000, coordinates: '-1.2925, 36.8222', isUnregistered: false, status: 'Verified' },
  { id: 'p3', parcelNumber: 'UNREG-001', owner: 'Community Trust', size: '0.8 Ha', estimatedValue: 8000000, coordinates: '-1.2930, 36.8230', isUnregistered: true, status: 'Pending' }
];

const stageBase = (stage: string, desc: string) => [{
  id: `${stage.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
  stage,
  description: desc,
  timestamp: new Date().toISOString(),
  completed: true,
  triggeredBy: 'System'
}];

export const INITIAL_REQUESTS: AcquisitionRequest[] = [
  {
    id: 'REQ-2023-001',
    title: 'Nairobi Eastern Bypass Expansion',
    description: 'Compulsory acquisition of land for the dualing of the Eastern Bypass from City Cabanas to Ruiru.',
    acquiringBody: 'KeNHA',
    status: ApplicationStatus.UNDER_SCRUTINY,
    dateCreated: '2023-10-01',
    lastUpdated: '2023-10-10',
    documents: MOCK_DOCUMENTS,
    logs: [
      { id: 'l1', action: 'Request Submitted', user: 'Project Manager', role: UserRole.ACQUIRING_BODY, timestamp: '2023-10-01 09:00' },
      { id: 'l2', action: 'Docs Verified', user: 'Registrar One', role: UserRole.LAND_REGISTRAR, timestamp: '2023-10-03 14:00' }
    ],
    parcels: MOCK_PARCELS,
    budget: 250000000,
    stageEvents: stageBase('Submission', 'Request submitted and documents attached')
  },
  {
    id: 'REQ-2023-002',
    title: 'Dandora Waste Energy Plant',
    description: 'Land for new sustainable waste management facility.',
    acquiringBody: 'Nairobi County Govt',
    status: ApplicationStatus.APPROVED,
    dateCreated: '2023-09-15',
    lastUpdated: '2023-10-12',
    documents: [MOCK_DOCUMENTS[0]],
    logs: [],
    parcels: [],
    budget: 150000000,
    stageEvents: stageBase('Approved', 'Approved but awaiting gazette notice')
  }
];

export const REQUIRED_DOCUMENT_CATEGORIES: Document['category'][] = [
  'Acquisition Plan',
  'Parcel List',
  'ESIA Report',
  'RAP Report',
  'Funds Avail'
];

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ACQUIRING_BODY]: 'Applicant (Acquiring Body)',
  [UserRole.NLCC_CHAIRMAN]: 'NLC Chairman (NLCC)',
  [UserRole.DIRECTOR_VALUATION]: 'Director Valuation & Taxation',
  [UserRole.VALUATION_TEAM]: 'Valuation Team',
  [UserRole.LEGAL_TEAM]: 'Legal Team',
  [UserRole.LAND_REGISTRAR]: 'Land Registrar',
  [UserRole.COMMITTEE]: 'Land Acquisition Committee',
  [UserRole.GOVT_PRINTER]: 'Government Printer',
  [UserRole.FINANCE]: 'Finance Committee',
  [UserRole.INTERESTED_PARTY]: 'Interested Party / Claimant'
};