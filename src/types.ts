export interface TORDocument {
  id: string;
  title: string;
  filename: string;
  content: string;
  source: 'drive' | 'upload' | 'submission';
  sizeBytes?: number;
  isSelected?: boolean;
  budgetNumber?: number;
  architecture?: 'edge_ai' | 'server_centric' | 'basic' | 'hybrid';
  hasBarrierGate?: boolean;
  hasVisitorSystem?: boolean;
  companyName?: string;
  lanesCount?: number;
  submittedAt?: string;
}

export interface ProposalFormData {
  title: string;
  company: string;
  taxId: string;
  contactPerson: string;
  phone: string;
  email: string;
  price: string;
  budgetNumber?: number;
  durationDays: string;
  lanesCount: number;
  architecture: 'edge_ai' | 'server_centric' | 'basic' | 'hybrid';
  hasBarrierGate: boolean;
  hasVisitorSystem: boolean;
  scope: string;
  hardwareSoftware: string;
  deliverables: string;
  warrantyAndSla: string;
  companyExpertise: string;
  expertNames?: string;
  additionalNotes: string;
}

export interface FilterOptions {
  searchQuery: string;
  source: 'all' | 'drive' | 'upload' | 'submission';
  architecture: 'all' | 'edge_ai' | 'server_centric' | 'basic' | 'hybrid';
  budgetRange: 'all' | 'under_350k' | '350k_600k' | 'over_600k';
  hasBarrierGate: 'all' | 'yes' | 'no';
  lanes: 'all' | '1' | '2' | 'multi';
}

export interface MemorandumData {
  govAgency: string;
  docNumber: string;
  docDate: string;
  subject: string;
  salutation: string;
  chairpersonName: string;
  committeeMember1: string;
  committeeMember2: string;
  procurementOfficer: string;
  officerPosition: string;
}

export interface LegalViolationItem {
  aspectId?: 'name' | 'company' | 'duration' | 'scope' | 'softwareHardware' | 'tech' | 'deliverables' | 'price' | 'expertise' | string;
  aspectName?: string;
  severity: 'violation' | 'warning'; // violation = สีแดง (เสี่ยงขัด พ.ร.บ.), warning = สีส้ม/เหลือง (ข้อพึงระวัง)
  lawSection: string; // e.g. "มาตรา ๙ พ.ร.บ. การจัดซื้อจัดจ้างฯ พ.ศ. ๒๕๖๐"
  issueTitle: string;
  description: string;
  recommendation: string;
}

export interface LegalComplianceSummary {
  hasViolation: boolean;
  violationCount: number;
  warningCount: number;
  riskLevel: 'high' | 'medium' | 'low';
  violations: LegalViolationItem[];
}

export interface TORDetail {
  torId: string;
  torName: string;
  companyOrBidder: string;
  duration: string;
  scope: string;
  softwareHardware: string;
  deliverables: string;
  price: string;
  expertise: string;
  expertNames?: string;
  highlightPoints: string[];
  strengths: string[];
  weaknesses: string[];
  legalCompliance?: LegalComplianceSummary;
}

export interface TORComparisonItem {
  aspect: string;
  summary: string;
  torValues: Record<string, string>;
}

export interface TORScore {
  torId: string;
  torName: string;
  durationScore: number;
  durationReason: string;
  expertiseScore: number;
  expertiseReason: string;
  scopeScore: number;
  scopeReason: string;
  technicalScore: number;
  technicalReason: string;
  priceScore: number;
  priceReason: string;
  totalScore: number;
  summaryVerdict: string;
}

export interface RadarDataPoint {
  criterion: string;
  fullName: string;
  [key: string]: number | string;
}

export interface ProcurementRecommendations {
  procurementStandards: string[];
  vendorLockInWarnings: string[];
  committeeInquiryQuestions: string[];
  maintenanceAndSla: string[];
  overallConclusion: string;
}

export interface FullAnalysisResponse {
  timestamp: string;
  analyzedTorIds: string[];
  torDetails: TORDetail[];
  similarities: Array<{ aspect: string; detail: string; significance: string }>;
  differences: Array<{ aspect: string; impact: string; torBreakdown: Record<string, string> }>;
  sideBySideMatrix: Array<{
    category: string;
    description: string;
    detailsByTor: Record<string, string>;
  }>;
  scores: TORScore[];
  radarData: RadarDataPoint[];
  recommendations: ProcurementRecommendations;
}
