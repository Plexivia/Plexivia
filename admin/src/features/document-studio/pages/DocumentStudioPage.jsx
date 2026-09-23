import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useParams, useNavigate, Navigate } from 'react-router-dom';
import { EmploymentAgreement } from '../components/agreement/EmploymentAgreement';
import { IdCard } from '../components/idcard/IdCard';
import { SalarySlip } from '../components/payroll/SalarySlip';
import { MoneyReceipt } from '../components/receipt/MoneyReceipt';
import { CashVoucher } from '../components/cash-voucher/CashVoucher';
import { ExperienceCertificate } from '../components/certificate-experience/ExperienceCertificate';
import { ResumeBuilder } from '../components/resume/ResumeBuilder';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2, Loader2 } from 'lucide-react';

// Main Document Studio routing and dossier wrapper page
export const DocumentStudioPage = ({
  activeSubmodule: propSubmodule = undefined,
} = {}) => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  const routeGenerator = params.generator || params.submodule || null;

  // Resolve current active submodule
  let resolvedSubmodule = propSubmodule;
  if (resolvedSubmodule === undefined) {
    if (routeGenerator) {
      resolvedSubmodule = routeGenerator;
    } else {
      const match = location.pathname.match(/\/(?:documents|document-studio|docs)\/([^\/?#]+)/i);
      if (match && match[1]) {
        resolvedSubmodule = match[1];
      }
    }
  }

  // Parse Case Dossier URL Query Parameters
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const clientDid = searchParams.get('clientDid') || searchParams.get('clientId');
  const caseDid = searchParams.get('caseDid') || searchParams.get('caseId');
  const caseNumberParam = searchParams.get('caseNumber');
  const amountParam = searchParams.get('amount');
  const taskIdParam = searchParams.get('taskId');
  const isLockedParam = searchParams.get('isLocked');
  const returnUrl = searchParams.get('returnUrl');

  const [dossierLoading, setDossierLoading] = useState(Boolean(clientDid || caseDid));
  const [dossierContext, setDossierContext] = useState(null);

  // Fetch client and case dossier details if linked via URL
  useEffect(() => {
    let isMounted = true;

    async function loadDossier() {
      if (!clientDid && !caseDid) {
        setDossierLoading(false);
        return;
      }

      try {
        setDossierLoading(true);
        let clientData = null;
        let caseData = null;

        if (caseDid) {
          try {
            const caseRes = await apiClient.get(`/api/v1/client/cases/${caseDid}`);
            if (caseRes.data?.data) {
              caseData = caseRes.data.data;
              clientData = (caseData.clientInfo && typeof caseData.clientInfo === 'object')
                ? caseData.clientInfo
                : (caseData.clientId && typeof caseData.clientId === 'object')
                ? caseData.clientId
                : null;
            }
          } catch (_) {
            try {
              const adminCaseRes = await apiClient.get(`/api/v1/admin/cases/${caseDid}/full-details`);
              if (adminCaseRes.data?.data) {
                caseData = adminCaseRes.data.data;
                clientData = (caseData.clientInfo && typeof caseData.clientInfo === 'object')
                  ? caseData.clientInfo
                  : (caseData.clientId && typeof caseData.clientId === 'object')
                  ? caseData.clientId
                  : null;
              }
            } catch (e) {
              console.warn('Case fetch error:', e);
            }
          }
        }

        const resolvedClientRef = (clientData && typeof clientData === 'string' ? clientData : null) || clientDid || caseData?.clientDid;
        if (!clientData && resolvedClientRef) {
          try {
            const clientRes = await apiClient.get(`/api/v1/client/clients/${resolvedClientRef}`);
            if (clientRes.data?.data) {
              clientData = clientRes.data.data;
            }
          } catch (_) {
            try {
              const fallbackClientRes = await apiClient.get(`/api/v1/admin/clients/${resolvedClientRef}`);
              if (fallbackClientRes.data?.data) {
                clientData = fallbackClientRes.data.data;
              }
            } catch (e) {
              console.warn('Client fetch fallback:', e);
            }
          }
        }

        if (isMounted) {
          setDossierContext({
            client: clientData || {},
            caseFile: caseData || {},
            isLocked: Boolean(caseDid || clientDid || isLockedParam === 'true'),
          });
        }
      } catch (err) {
        console.error('Error fetching dossier context:', err);
      } finally {
        if (isMounted) setDossierLoading(false);
      }
    }

    loadDossier();

    return () => {
      isMounted = false;
    };
  }, [clientDid, caseDid, isLockedParam]);

  // Build mapped initialData for each generator based on dossierContext
  const initialData = useMemo(() => {
    if (!dossierContext) return null;
    const { client = {}, caseFile = {} } = dossierContext;

    const applicantFullName = client.fullName || caseFile.applicantName || '';
    const phone = client.phone || client.mobileNumber || caseFile.phone || '';
    const passportNumber = client.passportNumber || caseFile.passportNumber || '';
    const nidNumber = client.nidNumber || caseFile.nidNumber || '';
    const destination = caseFile.destinationCountry || caseFile.caseType || 'Work Permit & Job Placement';
    const trade = caseFile.tradeSkill || 'General Worker';

    switch (resolvedSubmodule) {
      case 'agreement':
        return {
          parties: {
            agreementDate: new Date().toISOString().split('T')[0],
            nidPassport: passportNumber || nidNumber,
            employeeName: applicantFullName,
            employeePhone: phone,
            employeeEmail: client.email || '',
            fatherHusbandName: client.fatherName || '',
            address: client.presentAddress || client.address || client.permanentAddress || '',
          },
          guardian: {
            guardianName: client.guardian?.name || client.guardian?.fullName || '',
            guardianPhone: client.guardian?.phone || client.guardian?.mobileNumber || '',
            relationship: client.guardian?.relationship || 'Father',
            emergencyPhone: client.guardian?.phone || client.altPhone || '',
            guardianNid: client.guardian?.nidNumber || '',
            guardianAddress: client.guardian?.address || '',
          },
          position: {
            designation: trade,
            department: destination,
            location: 'Head Office / Overseas Placement',
          },
          isLocked: false,
        };

      case 'indian-visa':
        return {
          applicant: {
            fullName: applicantFullName,
            mobileNumber: phone,
            passportNumber,
            nidNumber,
            email: client.email || '',
            fatherName: client.fatherName || '',
            motherName: client.motherName || '',
            presentAddress: client.presentAddress || client.address || '',
            permanentAddress: client.permanentAddress || '',
          },
          isLocked: false,
        };

      case 'passport-sub':
        return {
          clientName: applicantFullName,
          phone,
          passportNumber,
          nidNumber,
          fatherName: client.fatherName || '',
          destinationCountry: destination,
          isLocked: false,
        };

      case 'job-verification':
        return {
          employeeName: applicantFullName,
          phone,
          passportNumber,
          nidNumber,
          designation: trade,
          country: destination,
          isLocked: false,
        };

      case 'idcard':
        return {
          fullName: applicantFullName,
          role: trade,
          idNumber: client.clientCode || (client.did ? `CLNT-${client.did.slice(0, 6)}` : 'ID-001'),
          contactPhone: phone,
          bloodGroup: client.bloodGroup || '',
          isLocked: false,
        };

      case 'invoice':
      case 'invoices': {
        const resolvedUnitPrice =
          parseFloat(amountParam) ||
          caseFile.agreedAmount ||
          caseFile.totalAgreedAmount ||
          caseFile.initialPaidAmount ||
          '';

        return {
          caseDid: caseFile.did || caseFile._id,
          caseNumber: caseFile.caseNumber || caseNumberParam || '',
          taskId: taskIdParam || null,
          clientName: applicantFullName,
          client: {
            name: applicantFullName,
            contactPerson: applicantFullName,
            phone: phone,
            email: client.email || caseFile.email || '',
            address: client.presentAddress || client.address || client.permanentAddress || '',
          },
          items: [
            {
              id: 'item-1',
              title: `${destination} - Processing & Service Charge`,
              description: `Case File #${caseFile.caseNumber || caseNumberParam || ''} • Trade: ${trade}`,
              quantity: 1,
              unitPrice: resolvedUnitPrice,
            },
          ],
          isLocked: Boolean(dossierContext?.isLocked),
        };
      }

      case 'money-receipt':
      case 'receipt': {
        const resolvedAmount =
          parseFloat(amountParam) ||
          caseFile.initialPaidAmount ||
          caseFile.advanceAmount ||
          caseFile.paymentLedger?.step1_advance?.amount ||
          caseFile.paymentLedger?.totalPaidAmount ||
          caseFile.agreedAmount ||
          '';

        return {
          caseDid: caseFile.did || caseFile._id,
          caseNumber: caseFile.caseNumber || caseNumberParam || '',
          taskId: taskIdParam || null,
          clientName: applicantFullName,
          phone: phone,
          passportNumber: passportNumber,
          purpose: `Visa & Case Processing Fee - ${destination} (File #${caseFile.caseNumber || caseNumberParam || ''})`,
          amount: resolvedAmount,
          date: new Date().toISOString().split('T')[0],
          isLocked: Boolean(dossierContext?.isLocked),
        };
      }

      case 'cash-voucher':
      case 'cash-money-voucher':
        return {
          caseDid: caseFile.did || caseFile._id,
          caseNumber: caseFile.caseNumber || caseNumberParam || '',
          taskId: taskIdParam || null,
          paidTo: applicantFullName,
          phone: phone,
          purpose: `Disbursement / Processing Expense for Case #${caseFile.caseNumber || caseNumberParam || ''}`,
          items: [
            {
              id: 'item-1',
              description: `Operational & Processing Expense for ${applicantFullName}`,
              amount: parseFloat(amountParam) || '',
            },
          ],
          isLocked: Boolean(dossierContext?.isLocked),
        };

      default:
        return {
          clientName: applicantFullName,
          phone,
          passportNumber,
          nidNumber,
          isLocked: Boolean(dossierContext?.isLocked),
        };
    }
  }, [dossierContext, resolvedSubmodule, caseNumberParam, amountParam, taskIdParam]);

  // Callback when a document is saved successfully in Document Studio
  const handleSavedSuccess = useCallback(
    (savedDoc) => {
      toast.success('Document successfully generated and recorded in database!');
      if (returnUrl) {
        toast.info('Returning to Case File Dossier in 1.5s...', {
          action: {
            label: 'Return Now',
            onClick: () => navigate(returnUrl),
          },
        });
        setTimeout(() => {
          navigate(returnUrl);
        }, 1500);
      }
    },
    [returnUrl, navigate]
  );

  // If no generator is specified, determine role-based default
  if (!resolvedSubmodule || resolvedSubmodule === 'overview' || resolvedSubmodule === 'studio' || resolvedSubmodule === 'all') {
    let userRole = '';
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        userRole = String(parsed.role || parsed.subRole || parsed.sub_role || '').toLowerCase();
      }
    } catch (_) {}

    const isAccountant = userRole.includes('account');
    const defaultGen = isAccountant ? 'payroll' : 'agreement';

    let targetPath = `/documents/${defaultGen}`;
    if (location.pathname.startsWith('/admin/docs')) {
      targetPath = `/admin/docs/${defaultGen}`;
    } else if (location.pathname.startsWith('/dashboard/docs')) {
      targetPath = `/dashboard/docs/${defaultGen}`;
    }

    return <Navigate to={targetPath} replace />;
  }

  return (
    <div className="space-y-6">
      {/* LINKED CASE DOSSIER AUDIT BANNER */}
      {dossierContext && (
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-sky-500/20 text-sky-600 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                  Linked Case File #{dossierContext.caseFile?.caseNumber || caseNumberParam || 'CASE-DOSSIER'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-800 border border-amber-500/30">
                  <Lock className="size-2.5" />
                  Client Bio Locked
                </span>
              </div>
              <p className="text-xs text-foreground font-semibold mt-0.5">
                Applicant: <strong className="text-primary">{dossierContext.client?.fullName || dossierContext.caseFile?.applicantName || 'Client'}</strong>
                {' • '}Phone: {dossierContext.client?.phone || dossierContext.caseFile?.phone || '—'}
                {' • '}Passport: <span className="font-mono font-bold text-sky-600">{dossierContext.caseFile?.passportNumber || dossierContext.client?.passportNumber || '—'}</span>
                {' • '}NID: <span className="font-mono">{dossierContext.client?.nidNumber || dossierContext.caseFile?.nidNumber || '—'}</span>
              </p>
            </div>
          </div>

          {returnUrl && (
            <button
              type="button"
              onClick={() => navigate(returnUrl)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-background border border-border hover:bg-muted text-foreground font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>← Return to Case Dossier</span>
            </button>
          )}
        </div>
      )}

      {dossierLoading && (
        <div className="p-4 bg-muted/20 border border-border rounded-xl flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span>Loading client dossier particulars from database...</span>
        </div>
      )}

      {resolvedSubmodule === 'agreement' && (
        <EmploymentAgreement
          initialData={initialData}
          onSavedSuccess={handleSavedSuccess}
          isLocked={Boolean(dossierContext?.isLocked)}
        />
      )}
      {resolvedSubmodule === 'idcard' && (
        <IdCard
          initialData={initialData}
          onSavedSuccess={handleSavedSuccess}
          isLocked={Boolean(dossierContext?.isLocked)}
        />
      )}
      {(resolvedSubmodule === 'payroll' || resolvedSubmodule === 'salary-slip' || resolvedSubmodule === 'salary') && (
        <SalarySlip
          initialData={initialData}
          onSavedSuccess={handleSavedSuccess}
          isLocked={Boolean(dossierContext?.isLocked)}
        />
      )}
      {(resolvedSubmodule === 'money-receipt' || resolvedSubmodule === 'receipt') && (
        <MoneyReceipt
          initialData={initialData}
          onSavedSuccess={handleSavedSuccess}
          isLocked={Boolean(dossierContext?.isLocked)}
        />
      )}
      {(resolvedSubmodule === 'cash-voucher' || resolvedSubmodule === 'cash-money-voucher') && (
        <CashVoucher
          initialData={initialData}
          onSavedSuccess={handleSavedSuccess}
          isLocked={Boolean(dossierContext?.isLocked)}
        />
      )}
      {(resolvedSubmodule === 'experience-certificate' || resolvedSubmodule === 'certificate-exp' || resolvedSubmodule === 'exp-cert') && (
        <ExperienceCertificate
          initialData={initialData}
          onSavedSuccess={handleSavedSuccess}
          isLocked={Boolean(dossierContext?.isLocked)}
        />
      )}
      {(resolvedSubmodule === 'resume' || resolvedSubmodule === 'cv') && (
        <ResumeBuilder />
      )}
    </div>
  );
};

export default DocumentStudioPage;

