
import React from 'react';
import { ApplicationStatus } from '../types';
import { CheckCircle2, Circle, XCircle, AlertCircle } from 'lucide-react';

interface TimelineProps {
  status: ApplicationStatus;
}

const Timeline: React.FC<TimelineProps> = ({ status }) => {
  // Mapping statuses to logical "Steps" in the linear view of the complex flowchart
  const steps = [
    { 
      id: 1, 
      label: 'Request', 
      description: 'Submission & Docs',
      activeStatuses: [ApplicationStatus.SUBMITTED, ApplicationStatus.DRAFT, ApplicationStatus.RETURNED_FOR_CORRECTION] 
    },
    { 
      id: 2, 
      label: 'Scrutiny', 
      description: 'Director/Comm Review',
      activeStatuses: [ApplicationStatus.UNDER_SCRUTINY, ApplicationStatus.PENDING_COMMITTEE] 
    },
    { 
      id: 3, 
      label: 'Decision', 
      description: 'Committee Approval',
      activeStatuses: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED] 
    },
    { 
      id: 4, 
      label: 'Gazette', 
      description: 'Notice of Intention',
      activeStatuses: [ApplicationStatus.GAZETTE_INTENTION, ApplicationStatus.PUBLIC_PARTICIPATION] 
    },
    { 
      id: 5, 
      label: 'Inquiry', 
      description: 'Survey, Hearing & Awards',
      activeStatuses: [ApplicationStatus.INQUIRY_NOTICE, ApplicationStatus.INQUIRY_CONDUCTED, ApplicationStatus.COMPENSATION_SCHEDULE] 
    },
    { 
      id: 6, 
      label: 'Funds', 
      description: 'Deposit & Verification',
      activeStatuses: [ApplicationStatus.FUNDS_REQ_SENT, ApplicationStatus.FUNDS_DEPOSITED] 
    },
    { 
      id: 7, 
      label: 'Conclusion', 
      description: 'Payment & Vesting',
      activeStatuses: [ApplicationStatus.AWARDS_ISSUED, ApplicationStatus.PAYMENT_PROCESSING, ApplicationStatus.VESTING, ApplicationStatus.TITLE_REGISTERED] 
    }
  ];

  const getCurrentStepIndex = () => {
    // Find the step that contains the current status
    const exactMatch = steps.findIndex(s => s.activeStatuses.includes(status));
    if (exactMatch !== -1) return exactMatch;
    
    // Fallback logic
    if (status === ApplicationStatus.DRAFT) return 0;
    return steps.length - 1; 
  };

  const currentStep = getCurrentStepIndex();

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">Workflow Progress</h3>
      <div className="relative flex justify-between">
        {/* Connector Line */}
        <div className="absolute top-4 left-0 w-full h-1 bg-slate-100 -z-0"></div>
        <div 
          className="absolute top-4 left-0 h-1 bg-blue-500 transition-all duration-500 ease-out -z-0"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isRejected = status === ApplicationStatus.REJECTED && index === currentStep;
          const isReturned = status === ApplicationStatus.RETURNED_FOR_CORRECTION && index === 0;

          return (
            <div key={step.id} className="flex flex-col items-center z-10">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center border-4 transition-colors duration-300 shadow-sm
                  ${isRejected 
                    ? 'bg-red-100 border-red-500 text-red-600' 
                    : isReturned
                      ? 'bg-orange-100 border-orange-500 text-orange-600'
                      : isCompleted 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : isCurrent 
                          ? 'bg-white border-blue-500 text-blue-600' 
                          : 'bg-white border-slate-200 text-slate-300'
                  }
                `}
              >
                {isRejected ? (
                  <XCircle size={18} />
                ) : isReturned ? (
                  <AlertCircle size={18} />
                ) : isCompleted ? (
                  <CheckCircle2 size={18} />
                ) : isCurrent ? (
                  <Circle size={18} fill="currentColor" className="text-blue-600" />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              <div className="mt-3 text-center">
                <p className={`text-sm font-bold ${isCurrent ? 'text-blue-800' : 'text-slate-800'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-slate-600 font-medium mt-1 hidden md:block">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
