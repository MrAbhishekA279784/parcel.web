import React, { useState, useEffect } from 'react';
import { Invoice } from '../../../types';
import { apiFetch } from '../../../shared/lib/api';
import { formatINR, formatDate } from '../../../shared/lib/formatters';
import { Button } from '../../../shared/components/Button';
import { Modal } from '../../../shared/components/Modal';
import { FileText, Printer, CheckCircle2, Search } from 'lucide-react';

export const AdminBilling: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Preview Invoice Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchInvoices = () => {
    setIsLoading(true);
    apiFetch<Invoice[]>('/billing/invoices')
      .then(setInvoices)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filtered = invoices.filter(inv => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      inv.id.toLowerCase().includes(q) ||
      inv.order_id.toLowerCase().includes(q) ||
      inv.customer_name.toLowerCase().includes(q) ||
      inv.destination_city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">GST Billing &amp; Invoices</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Automated tax invoice generation, 18% GST ledger (CGST + SGST), and compliance records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={fetchInvoices}>
            Refresh Invoices
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search invoice number, order ID, customer..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Invoice No</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Order Ref</th>
              <th className="py-3 px-4">Billed To</th>
              <th className="py-3 px-4">Subtotal</th>
              <th className="py-3 px-4">GST (18%)</th>
              <th className="py-3 px-4">Total Amount</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-mono">
            {filtered.map(inv => (
              <tr key={inv.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="py-3 px-4 font-bold text-zinc-900">{inv.id}</td>
                <td className="py-3 px-4 text-zinc-500 font-sans">{formatDate(inv.issued_at)}</td>
                <td className="py-3 px-4 text-zinc-700">{inv.order_id}</td>
                <td className="py-3 px-4 font-sans font-medium text-zinc-900">{inv.customer_name}</td>
                <td className="py-3 px-4 text-zinc-600">{formatINR(inv.subtotal)}</td>
                <td className="py-3 px-4 text-zinc-600">{formatINR(inv.gst_amount)}</td>
                <td className="py-3 px-4 font-bold text-indigo-700">{formatINR(inv.total_amount)}</td>
                <td className="py-3 px-4 font-sans">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    PAID
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-sans">
                  <button
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                    title="View Tax Invoice"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Modal Preview */}
      {selectedInvoice && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Tax Invoice - ${selectedInvoice.id}`}
          subtitle={`GSTIN: ${selectedInvoice.gstin}`}
          maxWidth="md"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="indigo"
                size="sm"
                onClick={() => window.print()}
                icon={<Printer className="w-3.5 h-3.5" />}
              >
                Print Invoice
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">Customer:</span>
                <span className="font-bold text-zinc-900">{selectedInvoice.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Address:</span>
                <span className="text-zinc-700">{selectedInvoice.city}, {selectedInvoice.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Order Reference:</span>
                <span className="font-mono text-zinc-900">{selectedInvoice.order_id}</span>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-zinc-200 pt-3">
              <div className="flex justify-between text-zinc-600">
                <span>Taxable Subtotal:</span>
                <span className="font-mono text-zinc-900 font-medium">{formatINR(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>CGST (9%):</span>
                <span className="font-mono text-zinc-900 font-medium">{formatINR(Math.round(selectedInvoice.gst_amount / 2))}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>SGST (9%):</span>
                <span className="font-mono text-zinc-900 font-medium">{formatINR(selectedInvoice.gst_amount - Math.round(selectedInvoice.gst_amount / 2))}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-900 border-t border-zinc-200 pt-2">
                <span>Total Invoice Value:</span>
                <span className="font-mono text-indigo-600 text-base">{formatINR(selectedInvoice.total_amount)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
