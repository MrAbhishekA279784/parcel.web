import React, { useState, useEffect } from 'react';
import { Invoice, OrderItem } from '../../../types';
import { apiFetch } from '../../../shared/lib/api';
import { formatINR, formatDate } from '../../../shared/lib/formatters';
import { Button } from '../../../shared/components/Button';
import { ArrowLeft, Printer, Download, CheckCircle2 } from 'lucide-react';

interface CustomerInvoiceProps {
  orderId: string;
  onBack: () => void;
}

export const CustomerInvoice: React.FC<CustomerInvoiceProps> = ({ orderId, onBack }) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    apiFetch<{ invoice: Invoice; items: OrderItem[] }>(`/billing/invoices/order/${orderId}`)
      .then(data => {
        setInvoice(data.invoice);
        setItems(data.items || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !invoice) {
    return (
      <div className="py-20 text-center text-zinc-500">
        Loading tax invoice details...
      </div>
    );
  }

  // Calculate CGST and SGST (9% each for intra-state Maharashtra, or IGST 18%)
  const cgst = Math.round(invoice.gst_amount / 2);
  const sgst = invoice.gst_amount - cgst;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-zinc-200/80 print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            Print Tax Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Sheet */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-8 sm:p-10 shadow-sm text-zinc-800 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-base">
                PF
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900">ParcelFlow Logistics Pvt. Ltd.</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Plot 42, Hinjawadi Phase 2, Pune, Maharashtra 411057</p>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">GSTIN: <strong className="text-zinc-800">{invoice.gstin}</strong></p>
            <p className="text-xs text-zinc-500">Contact: support@parcelflow.demo | +91 20 4567 8900</p>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded inline-block">
              Tax Invoice
            </span>
            <div className="text-sm font-mono font-bold text-zinc-900 pt-1">
              Invoice No: {invoice.id}
            </div>
            <div className="text-xs text-zinc-500">Date: {formatDate(invoice.issued_at)}</div>
            <div className="text-xs text-zinc-500 font-mono">Order Ref: {invoice.order_id}</div>
          </div>
        </div>

        {/* Bill To / Ship To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pb-6 border-b border-zinc-200">
          <div>
            <span className="font-semibold uppercase tracking-wider text-zinc-400 block mb-1 text-[10px]">
              Billed &amp; Shipped To:
            </span>
            <p className="font-bold text-sm text-zinc-900">{invoice.customer_name}</p>
            <p className="text-zinc-600 mt-0.5">{invoice.line1}</p>
            <p className="text-zinc-600">
              {invoice.city}, {invoice.state} - {invoice.pincode}
            </p>
            <p className="text-zinc-500 font-mono mt-1">Phone: {invoice.customer_phone || '—'}</p>
            <p className="text-zinc-500">Email: {invoice.customer_email}</p>
          </div>

          <div className="sm:text-right">
            <span className="font-semibold uppercase tracking-wider text-zinc-400 block mb-1 text-[10px]">
              Payment &amp; Logistics:
            </span>
            <p className="text-zinc-700">Payment Mode: <strong className="text-zinc-900">{invoice.payment_method}</strong></p>
            <div className="mt-1 inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-medium border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Status: {invoice.payment_status}</span>
            </div>
            <p className="text-zinc-500 mt-2">Destination City: <strong className="text-zinc-800">{invoice.destination_city}</strong></p>
          </div>
        </div>

        {/* Item Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-300 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
                <th className="py-2.5 px-2">#</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-right">HSN/SAC</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Taxable Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {items.map((item, idx) => {
                const taxable = item.unit_price * item.quantity;
                return (
                  <tr key={item.id}>
                    <td className="py-3 px-2 text-zinc-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-zinc-900">{item.name}</div>
                      <div className="text-[10px] text-zinc-400">Rack: {item.warehouse_rack_location}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-zinc-500">851830</td>
                    <td className="py-3 px-3 text-right font-mono font-medium">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatINR(item.unit_price)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900">{formatINR(taxable)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tax Summary Breakdown */}
        <div className="flex justify-end pt-4 border-t border-zinc-200">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Taxable Value:</span>
              <span className="font-mono text-zinc-900 font-medium">{formatINR(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Central GST (CGST 9%):</span>
              <span className="font-mono text-zinc-900 font-medium">{formatINR(cgst)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>State GST (SGST 9%):</span>
              <span className="font-mono text-zinc-900 font-medium">{formatINR(sgst)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Shipping &amp; Automated Handling:</span>
              <span className="font-mono text-emerald-600 font-medium">₹0.00 (FREE)</span>
            </div>
            <div className="pt-2 border-t-2 border-zinc-900 flex justify-between text-sm font-bold text-zinc-900">
              <span>Total Invoice Value:</span>
              <span className="font-mono text-base text-orange-600 font-extrabold">
                {formatINR(invoice.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="pt-6 border-t border-zinc-200 text-[11px] text-zinc-400 space-y-1">
          <p>This is a computer-generated invoice authenticated by ParcelFlow Warehouse Management Engine.</p>
          <p>Goods once sold are covered under the standard 7-day automated return policy.</p>
        </div>
      </div>
    </div>
  );
};
