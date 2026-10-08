import React, { useState, useMemo } from 'react'
import { Search, User, Phone, Mail, Calendar, CreditCard, Sparkles, ArrowRight } from 'lucide-react'

interface AdminGuestsTabProps {
  guests: any[]
  isLoading: boolean
  onFilterBookingsByGuest: (guestPhone: string) => void
}

export const AdminGuestsTab: React.FC<AdminGuestsTabProps> = ({
  guests,
  isLoading,
  onFilterBookingsByGuest,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const formatCurrency = (val: number) => '₹' + (val || 0).toLocaleString('en-IN')

  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return guests
    const q = searchQuery.toLowerCase().trim()
    return guests.filter(
      (g) =>
        g.fullName?.toLowerCase().includes(q) ||
        g.phone?.includes(q) ||
        g.email?.toLowerCase().includes(q)
    )
  }, [guests, searchQuery])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-cream font-semibold">
            Registered Guest Directory (CRM)
          </h2>
          <p className="text-xs text-cream/70 font-mono">
            Guest accounts, booking histories, and loyalty engagement
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-cream/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-cream/20 rounded-2xl text-xs font-mono text-cream placeholder-cream/40 focus:outline-none focus:border-amber-300/80"
          />
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-[#16251C]/80 backdrop-blur-xl border border-cream/15 rounded-3xl shadow-xl overflow-hidden">
        {isLoading && guests.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-400/20 border-t-emerald-400 animate-spin mx-auto" />
            <p className="text-xs font-mono text-cream/70">Loading guest profiles from PMS...</p>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <User className="w-8 h-8 text-cream/40 mx-auto" />
            <h4 className="font-serif text-base text-cream font-medium">No Guests Found</h4>
            <p className="text-xs font-mono text-cream/60">
              {searchQuery ? 'Try a different search query.' : 'No registered users in database yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Guest Cards (<md) */}
            <div className="md:hidden divide-y divide-cream/10">
              {filteredGuests.map((g) => (
                <div key={g.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 flex items-center justify-center font-serif font-bold text-sm shrink-0">
                        {g.fullName ? g.fullName.charAt(0).toUpperCase() : 'G'}
                      </div>
                      <div>
                        <span className="font-sans font-semibold text-cream text-sm block">
                          {g.fullName || 'Guest'}
                        </span>
                        <span className="text-[10px] text-cream/50">ID: {g.id}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-cream/10 text-cream text-[10px] font-bold">
                      {g.totalBookings || 0} stay(s)
                    </span>
                  </div>

                  <div className="p-2.5 bg-black/30 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <a
                        href={`tel:+91${g.phone}`}
                        className="text-amber-200 font-bold flex items-center gap-1.5 hover:underline"
                      >
                        <Phone className="w-3 h-3 text-amber-200/70" />
                        <span>+91 {g.phone}</span>
                      </a>
                      <span className="text-emerald-300 font-bold">
                        {formatCurrency(g.totalSpent || 0)}
                      </span>
                    </div>

                    {g.email && (
                      <a
                        href={`mailto:${g.email}`}
                        className="text-[10px] text-cream/70 flex items-center gap-1.5 truncate hover:underline"
                      >
                        <Mail className="w-3 h-3 text-cream/40 shrink-0" />
                        <span className="truncate">{g.email}</span>
                      </a>
                    )}

                    <div className="text-[10px] text-cream/50 flex items-center justify-between pt-0.5">
                      <span>Last stay: {g.lastStay || '—'}</span>
                      <span>{g.createdAt ? new Date(g.createdAt).toLocaleDateString('en-IN') : 'Direct'}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => onFilterBookingsByGuest(g.phone)}
                      className="px-3.5 py-1.5 rounded-xl bg-cream/10 hover:bg-cream/20 text-cream text-xs font-mono transition-colors cursor-pointer inline-flex items-center gap-1.5 min-h-[36px]"
                    >
                      <span>View Reservations</span>
                      <ArrowRight className="w-3 h-3 text-amber-200" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-black/40 border-b border-cream/15 text-[10px] uppercase tracking-wider text-cream/70">
                  <tr>
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Contact Details</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4">Total Reservations</th>
                    <th className="py-3 px-4">Lifetime Spend</th>
                    <th className="py-3 px-4">Last Stay</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream/10 text-cream/90">
                  {filteredGuests.map((g) => {
                    return (
                      <tr key={g.id} className="hover:bg-cream/5 transition-colors">
                        {/* Name & Initials Avatar */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 flex items-center justify-center font-serif font-bold text-xs shrink-0">
                              {g.fullName ? g.fullName.charAt(0).toUpperCase() : 'G'}
                            </div>
                            <div>
                              <span className="font-sans font-semibold text-cream text-sm block">
                                {g.fullName || 'Guest'}
                              </span>
                              <span className="text-[10px] text-cream/50">ID: {g.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-4 px-4">
                          <div className="text-amber-200 font-bold flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-amber-200/70" />
                            <span>+91 {g.phone}</span>
                          </div>
                          {g.email && (
                            <div className="text-[10px] text-cream/60 flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-cream/40" />
                              <span>{g.email}</span>
                            </div>
                          )}
                        </td>

                        {/* Registered Date */}
                        <td className="py-4 px-4 text-cream/70">
                          {g.createdAt ? new Date(g.createdAt).toLocaleDateString('en-IN') : 'Direct'}
                        </td>

                        {/* Total Bookings */}
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-cream/10 text-cream font-bold">
                            {g.totalBookings || 0} stay(s)
                          </span>
                        </td>

                        {/* Lifetime Spend */}
                        <td className="py-4 px-4 font-bold text-emerald-300">
                          {formatCurrency(g.totalSpent || 0)}
                        </td>

                        {/* Last Stay */}
                        <td className="py-4 px-4 text-cream/70">
                          {g.lastStay || '—'}
                        </td>

                        {/* Action */}
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onFilterBookingsByGuest(g.phone)}
                            className="px-3 py-1.5 rounded-xl bg-cream/10 hover:bg-cream/20 text-cream text-[11px] font-mono transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>View Folios</span>
                            <ArrowRight className="w-3 h-3 text-amber-200" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminGuestsTab

