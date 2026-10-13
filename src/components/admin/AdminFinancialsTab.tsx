import React, { useMemo } from 'react'
import {
  Wallet,
  CreditCard,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  FileText,
  CheckCircle2,
  Calendar,
  Building,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react'
import type { BookingRecord, AdminStats } from '@/services/adminApi'

interface AdminFinancialsTabProps {
  stats: AdminStats | null
  bookings: BookingRecord[]
  onOpenWalkInModal: () => void
  onSelectBooking: (b: BookingRecord) => void
}

export const AdminFinancialsTab: React.FC<AdminFinancialsTabProps> = ({
  stats,
  bookings,
  onOpenWalkInModal,
  onSelectBooking,
}) => {
  const formatCurrency = (val: number) => '₹' + (val || 0).toLocaleString('en-IN')

  // Financial aggregates
  const financialSummary = useMemo(() => {
    let grossRevenue = 0
    let totalTaxCollected = 0
    let totalDiscountGiven = 0
    let onlinePaidAmount = 0
    let payAtCheckinAmount = 0

    const roomBreakdown: Record<string, { count: number; revenue: number }> = {
      '201': { count: 0, revenue: 0 },
      '202': { count: 0, revenue: 0 },
      '203': { count: 0, revenue: 0 },
      '204': { count: 0, revenue: 0 },
      '205': { count: 0, revenue: 0 },
    }

    bookings.forEach((b) => {
      if (b.status === 'cancelled') return

      grossRevenue += b.totalAmount || 0
      totalTaxCollected += b.taxesAndGst || 0
      totalDiscountGiven += b.discount || 0

      if (b.paymentStatus === 'paid') {
        onlinePaidAmount += b.totalAmount || 0
      } else {
        payAtCheckinAmount += b.totalAmount || 0
      }

      const rm = b.roomNumber || '201'
      if (roomBreakdown[rm]) {
        roomBreakdown[rm].count += 1
        roomBreakdown[rm].revenue += b.totalAmount || 0
      }
    })

    return {
      grossRevenue,
      netTariff: grossRevenue - totalTaxCollected,
      totalTaxCollected,
      totalDiscountGiven,
      onlinePaidAmount,
      payAtCheckinAmount,
      roomBreakdown,
    }
  }, [bookings])

  const handleExportCSV = () => {
    const headers = [
      'Booking Reference',
      'Room',
      'Guest Name',
      'Check In',
      'Check Out',
      'Tariff',
      'Taxes & GST',
      'Total Amount',
      'Payment Status',
    ]
    const rows = bookings.map((b) => [
      `"${b.bookingReference}"`,
      `"Room ${b.roomNumber}"`,
      `"${b.guestDetails?.fullName || ''}"`,
      `"${b.checkInDate}"`,
      `"${b.checkOutDate}"`,
      `"${b.subtotal || 0}"`,
      `"${b.taxesAndGst || 0}"`,
      `"${b.totalAmount || 0}"`,
      `"${b.paymentStatus}"`,
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `renoos-hotel-financial-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-800 dark:text-slate-200 select-none">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Operating Vault & Financial Folios
          </h2>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Reconciliation of room tariffs, luxury tax collections, and payment gateways
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-[#131D17] hover:bg-slate-200/80 dark:hover:bg-[#1a2820] border border-slate-200 dark:border-emerald-950/80 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export Financial CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenWalkInModal}
            className="px-4 py-2.5 rounded-2xl bg-[#047857] hover:bg-[#065f46] text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-white" />
            <span>New Walk-in Folio</span>
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 bg-white dark:bg-[#131D17] border border-slate-200/80 dark:border-emerald-950/80 rounded-[28px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-mono">
            <span>Gross Revenue</span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <span className="font-sans font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white block">
              {formatCurrency(financialSummary.grossRevenue)}
            </span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
              100% Guaranteed Tariff
            </span>
          </div>
        </div>

        {/* GST & Luxury Taxes */}
        <div className="p-5 bg-white dark:bg-[#131D17] border border-slate-200/80 dark:border-emerald-950/80 rounded-[28px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-mono">
            <span>Taxes & GST (12%)</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <span className="font-sans font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white block">
              {formatCurrency(financialSummary.totalTaxCollected)}
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 block">
              Audited & Reconciled
            </span>
          </div>
        </div>

        {/* Online Pre-paid */}
        <div className="p-5 bg-white dark:bg-[#131D17] border border-slate-200/80 dark:border-emerald-950/80 rounded-[28px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-mono">
            <span>Paid Online</span>
            <CreditCard className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-3">
            <span className="font-sans font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white block">
              {formatCurrency(financialSummary.onlinePaidAmount)}
            </span>
            <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-semibold mt-1 block">
              Settled to Bank Vault
            </span>
          </div>
        </div>

        {/* Pay at Check-in */}
        <div className="p-5 bg-white dark:bg-[#131D17] border border-slate-200/80 dark:border-emerald-950/80 rounded-[28px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-mono">
            <span>Pay at Front Desk</span>
            <DollarSign className="w-4 h-4 text-[#047857] dark:text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="font-sans font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white block">
              {formatCurrency(financialSummary.payAtCheckinAmount)}
            </span>
            <span className="text-[11px] font-mono text-[#047857] dark:text-emerald-400 font-semibold mt-1 block">
              Due on Guest Arrival
            </span>
          </div>
        </div>
      </div>

      {/* Suite-by-Suite Revenue Contribution */}
      <div className="bg-white dark:bg-[#131D17] border border-slate-200/80 dark:border-emerald-950/80 rounded-[28px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-4">
          Revenue Yield by Suite
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            { room: '201', name: 'Forest Sanctuary Suite', maxBase: 5200 },
            { room: '202', name: 'Mountain View Residence', maxBase: 5800 },
            { room: '203', name: 'Executive Panoramic Suite', maxBase: 8500 },
            { room: '204', name: 'Royal Horizon Suite', maxBase: 9800 },
            { room: '205', name: 'Tropical Bohemian Suite', maxBase: 8900 },
          ].map((r) => {
            const data = financialSummary.roomBreakdown[r.room] || { count: 0, revenue: 0 }
            return (
              <div
                key={r.room}
                className="p-4 bg-slate-50 dark:bg-[#0B110E] border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#047857] dark:text-emerald-400 font-bold">Suite {r.room}</span>
                    <span className="text-slate-500 dark:text-slate-400">{data.count} Stays</span>
                  </div>
                  <div className="font-serif text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                    {r.name}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-emerald-950/60 flex items-baseline justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Total Yield</span>
                  <span className="font-sans font-bold text-lg text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(data.revenue)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AdminFinancialsTab
