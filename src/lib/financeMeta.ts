import { QUOTATION_CATEGORIES } from './quotationCategories';

export const PO_STATUSES = [
  { key: 'active', label: 'Active', color: '#3B82F6' },
  { key: 'closed', label: 'Closed', color: '#2ECC71' },
  { key: 'cancelled', label: 'Cancelled', color: '#EF4444' },
] as const;

export const poStatusMeta = (s: string) => PO_STATUSES.find((x) => x.key === s) ?? PO_STATUSES[0];

export const PAYMENT_METHODS = ['Cheque', 'Bank Transfer', 'Cash', 'bKash', 'Nagad', 'Card', 'Other'];

export const EXPENSE_CATEGORIES = [...QUOTATION_CATEGORIES, 'Agency Overhead', 'Salary', 'Office', 'Other'];

export const EXPENSE_APPROVAL = [
  { key: 'pending', label: 'Pending', color: '#F59E0B' },
  { key: 'approved', label: 'Approved', color: '#2ECC71' },
  { key: 'rejected', label: 'Rejected', color: '#EF4444' },
] as const;

export const approvalMeta = (s: string) => EXPENSE_APPROVAL.find((x) => x.key === s) ?? EXPENSE_APPROVAL[0];
