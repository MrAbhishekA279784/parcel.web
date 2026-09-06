export function formatINR(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString.replace(' ', 'T'));
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString.replace(' ', 'T'));
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getStatusTheme(status: string): { bg: string; text: string; border: string; label: string } {
  switch (status) {
    case 'CONFIRMED':
    case 'PAID':
    case 'SUCCESS':
    case 'DELIVERED':
    case 'SORTED':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: status.replace('_', ' ') };
    case 'PICKING':
    case 'PACKING':
    case 'SORTING':
    case 'DETECTED':
    case 'ON_CONVEYOR':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: status.replace('_', ' ') };
    case 'PICKED':
    case 'PACKED':
    case 'DISPATCHED':
      return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', label: status.replace('_', ' ') };
    case 'PLACED':
    case 'PENDING':
    case 'RETURN_REQUESTED':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: status.replace('_', ' ') };
    case 'CANCELLED':
    case 'FAILED':
    case 'PAYMENT_FAILED':
    case 'CRITICAL':
    case 'RETURN_REJECTED':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: status.replace('_', ' ') };
    default:
      return { bg: 'bg-zinc-100', text: 'text-zinc-700', border: 'border-zinc-200', label: status };
  }
}
