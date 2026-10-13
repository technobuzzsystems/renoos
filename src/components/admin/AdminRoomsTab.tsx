import React, { useState } from 'react'
import {
  Bed,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Brush,
  DollarSign,
  Calendar,
  User,
} from 'lucide-react'
import type { BookingRecord, RoomConfig } from '@/services/adminApi'

interface AdminRoomsTabProps {
  rooms: any[]
  bookings: BookingRecord[]
  onUpdateRoom: (roomNumber: string, updates: Partial<RoomConfig>) => Promise<void>
  onSelectBooking?: (booking: BookingRecord) => void
}

export const AdminRoomsTab: React.FC<AdminRoomsTabProps> = ({
  rooms,
  bookings,
  onUpdateRoom,
  onSelectBooking,
}) => {
  const [editingRoomNumber, setEditingRoomNumber] = useState<string | null>(null)
  const [tariffInput, setTariffInput] = useState<number>(5000)
  const [notesInput, setNotesInput] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  // Helper to extract clean display name (e.g. "Omkar", "Sujay" from "Mr Sujay Pawar")
  const getDisplayName = (fullName?: string) => {
    if (!fullName) return 'Guest'
    const parts = fullName.trim().split(/\s+/)
    const titles = ['mr', 'mrs', 'ms', 'dr', 'prof', 'master']
    if (parts.length > 1 && titles.includes(parts[0].toLowerCase().replace('.', ''))) {
      return parts[1]
    }
    return parts[0]
  }

  const formatCurrency = (val: number) => '₹' + (val || 0).toLocaleString('en-IN')

  // Generate the next 14 calendar days starting today
  const next14Days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-IN', { weekday: 'narrow' }),
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      isToday: i === 0,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    }
  })

  const startEdit = (room: any) => {
    setEditingRoomNumber(room.roomNumber)
    setTariffInput(room.baseTariff || 5200)
    setNotesInput(room.housekeepingNotes || '')
    setSaveSuccess(null)
  }

  const cancelEdit = () => {
    setEditingRoomNumber(null)
    setSaveSuccess(null)
  }

  const handleSave = async (roomNumber: string) => {
    setIsSaving(true)
    setSaveSuccess(null)
    try {
      await onUpdateRoom(roomNumber, {
        baseTariff: Number(tariffInput),
        housekeepingNotes: notesInput.trim(),
      })
      setSaveSuccess(`Room ${roomNumber} updated successfully!`)
      setEditingRoomNumber(null)
      setTimeout(() => setSaveSuccess(null), 3000)
    } catch (err: any) {
      alert(err.message || 'Failed to update room.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleQuickStatusChange = async (
    roomNumber: string,
    operationalStatus: 'available' | 'cleaning' | 'maintenance'
  ) => {
    try {
      await onUpdateRoom(roomNumber, { operationalStatus })
      setSaveSuccess(`Room ${roomNumber} status set to ${operationalStatus}.`)
      setTimeout(() => setSaveSuccess(null), 3000)
    } catch (err: any) {
      alert(err.message || 'Failed to update room status.')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-slate-900 font-semibold">
            Room Inventory & Tariff Management
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            Control live operational readiness, housekeeping notes, base tariffs, and visual occupancy calendar
          </p>
        </div>

        {saveSuccess && (
          <div className="p-2.5 px-4 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-mono text-emerald-700 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
        )}
      </div>

      {/* 1. ROOM CARDS: OPERATIONAL STATUS & RATES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rooms.map((room) => {
          const isEditing = editingRoomNumber === room.roomNumber
          const opStatus = room.operationalStatus || 'available'

          return (
            <div
              key={room.roomNumber}
              className="p-6 bg-white dark:bg-[#131D17] border border-slate-200/80 dark:border-emerald-950/80 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-5 hover:border-emerald-400/40 dark:hover:border-emerald-600/50 transition-all"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#047857] dark:text-emerald-400 font-bold block">
                      Suite {room.roomNumber}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                      {room.name}
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold border ${
                      opStatus === 'available'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80'
                        : opStatus === 'cleaning'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80'
                    }`}
                  >
                    {opStatus}
                  </span>
                </div>

                {/* Quick Status Buttons */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Operational Status Switcher
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-[#0B110E] rounded-2xl border border-slate-200/70 dark:border-emerald-950/70 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => handleQuickStatusChange(room.roomNumber, 'available')}
                      className={`py-1.5 rounded-xl font-bold transition-all min-h-[36px] flex items-center justify-center cursor-pointer ${
                        opStatus === 'available'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickStatusChange(room.roomNumber, 'cleaning')}
                      className={`py-1.5 rounded-xl font-bold transition-all min-h-[36px] flex items-center justify-center cursor-pointer ${
                        opStatus === 'cleaning'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Cleaning
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickStatusChange(room.roomNumber, 'maintenance')}
                      className={`py-1.5 rounded-xl font-bold transition-all min-h-[36px] flex items-center justify-center cursor-pointer ${
                        opStatus === 'maintenance'
                          ? 'bg-[#ef4444] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Maintenance
                    </button>
                  </div>
                  {opStatus === 'maintenance' && (
                    <p className="text-[10px] font-mono text-rose-600 dark:text-rose-400 mt-1">
                      ⚠️ Locked: Guests cannot book this room until set back to Available.
                    </p>
                  )}
                </div>

                {/* Base Tariff & Housekeeping Notes */}
                {isEditing ? (
                  <div className="p-4 bg-slate-50 dark:bg-[#0B110E] rounded-2xl border border-slate-200 dark:border-emerald-950 space-y-3 animate-in fade-in">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-700 dark:text-slate-300 font-semibold mb-1">
                        Base Tariff (₹ per night)
                      </label>
                      <input
                        type="number"
                        min="1000"
                        step="100"
                        value={tariffInput}
                        onChange={(e) => setTariffInput(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white dark:bg-[#131D17] border border-slate-200 dark:border-emerald-950 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-700 dark:text-slate-300 font-semibold mb-1">
                        Housekeeping & Inspection Notes
                      </label>
                      <textarea
                        rows={2}
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder="e.g. Deep clean completed. Fresh linen, herbal diffuser active."
                        className="w-full px-3 py-2 bg-white dark:bg-[#131D17] border border-slate-200 dark:border-emerald-950 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSave(room.roomNumber)}
                        className="flex-1 py-2 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0B110E] rounded-2xl border border-slate-100 dark:border-emerald-950/60 text-xs font-mono">
                      <span className="text-slate-500 dark:text-slate-400">Current Rate:</span>
                      <strong className="font-bold text-slate-900 dark:text-white text-sm">
                        {formatCurrency(room.baseTariff || 5200)} / night
                      </strong>
                    </div>

                    {room.housekeepingNotes && (
                      <div className="p-3 bg-slate-50 dark:bg-[#0B110E] rounded-2xl border border-slate-100 dark:border-emerald-950/60 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                        <span className="text-[10px] uppercase text-slate-400 block mb-0.5">
                          Housekeeping Log:
                        </span>
                        &ldquo;{room.housekeepingNotes}&rdquo;
                      </div>
                    )}

                    {/* Active In-House Guest if any */}
                    {(() => {
                      const todayStr = next14Days[0].dateStr
                      const currentGuestBooking = bookings.find(
                        (b) =>
                          (b.roomNumber === room.roomNumber || b.roomId === `room-${room.roomNumber}`) &&
                          (b.status === 'confirmed' || b.status === 'checked_in') &&
                          b.checkInDate <= todayStr &&
                          b.checkOutDate > todayStr
                      )
                      if (!currentGuestBooking) return null
                      return (
                        <div
                          onClick={() => onSelectBooking?.(currentGuestBooking)}
                          className="p-2.5 px-3 bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex items-center justify-between text-xs font-mono cursor-pointer hover:bg-emerald-100/90 dark:hover:bg-emerald-900/60 transition-all group shadow-xs"
                          title="Click to view full reservation details"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <User className="w-3.5 h-3.5 text-[#047857] dark:text-emerald-400 shrink-0" />
                            <div className="truncate">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">Current Guest:</span>
                              <span className="font-bold text-[#047857] dark:text-emerald-300 group-hover:underline">
                                {currentGuestBooking.guestDetails?.fullName || 'Guest'}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-white/90 dark:bg-[#131D17] border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-bold shrink-0">
                            View Booking →
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="pt-3 border-t border-slate-100 dark:border-emerald-950/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-slate-400 uppercase">Settings</span>
                  <button
                    type="button"
                    onClick={() => startEdit(room)}
                    className="text-[#047857] dark:text-emerald-400 hover:text-[#065f46] dark:hover:text-emerald-300 font-semibold underline cursor-pointer"
                  >
                    Edit Rate & Notes
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 2. 14-DAY VISUAL OCCUPANCY MATRIX / CALENDAR GRID */}
      <div className="p-4 sm:p-6 bg-white dark:bg-[#131D17] border border-slate-200/80 dark:border-emerald-950/80 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#047857] dark:text-emerald-400" />
              <span>14-Day Visual Occupancy Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Live schedule overview across all suites · Click any booking to inspect customer details
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500" />
              <span className="text-[11px] sm:text-xs">Vacant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#047857] dark:bg-emerald-500" />
              <span className="text-[11px] sm:text-xs">Reserved (Click to view)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-400 dark:bg-slate-600" />
              <span className="text-[11px] sm:text-xs">Maintenance</span>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="sm:hidden text-[10px] text-[#047857] dark:text-emerald-400 font-mono flex items-center gap-1 pt-1">
          <span>← Swipe horizontally to inspect 14-day schedule →</span>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto pt-2 touch-pan-x">
          <table className="w-full text-center text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-emerald-950 text-[10px] text-slate-500 dark:text-slate-400 uppercase">
                <th className="py-2 px-3 text-left w-28 sm:w-36 sticky left-0 bg-white dark:bg-[#131D17] z-20 border-r border-slate-200 dark:border-emerald-950 shadow-xs">
                  Suite
                </th>
                {next14Days.map((d) => (
                  <th
                    key={d.dateStr}
                    className={`py-2 px-1 text-center min-w-[42px] ${
                      d.isToday ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 font-bold rounded-t-lg' : ''
                    }`}
                  >
                    <div>{d.dayName}</div>
                    <div className="font-bold text-slate-900 dark:text-white text-[11px]">{d.dayNum}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/60">
              {rooms.map((room) => {
                const opStatus = room.operationalStatus || 'available'

                return (
                  <tr key={room.roomNumber} className="hover:bg-slate-50/70 dark:hover:bg-[#0B110E]/60 transition-colors">
                    <td className="py-3 px-3 text-left font-serif font-bold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-[#131D17] z-10 border-r border-slate-200 dark:border-emerald-950 shadow-xs">
                      <div className="text-xs sm:text-sm">Room {room.roomNumber}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[90px] sm:max-w-[120px]">
                        {room.name.split(' ')[0]}
                      </div>
                    </td>

                    {next14Days.map((day) => {
                      if (opStatus === 'maintenance') {
                        return (
                          <td key={day.dateStr} className="p-1">
                            <div
                              className="h-9 rounded-xl bg-slate-100 dark:bg-[#0B110E] border border-slate-300 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-[9px]"
                              title={`Room ${room.roomNumber} under maintenance on ${day.dateStr}`}
                            >
                              MNT
                            </div>
                          </td>
                        )
                      }

                      // Check if any confirmed/checked-in booking covers this day
                      const activeBooking = bookings.find(
                        (b) =>
                          (b.roomNumber === room.roomNumber || b.roomId === `room-${room.roomNumber}`) &&
                          (b.status === 'confirmed' || b.status === 'checked_in') &&
                          b.checkInDate <= day.dateStr &&
                          b.checkOutDate > day.dateStr
                      )

                      if (activeBooking) {
                        const guestFirstName = getDisplayName(activeBooking.guestDetails?.fullName)
                        return (
                          <td key={day.dateStr} className="p-1">
                            <button
                              type="button"
                              onClick={() => onSelectBooking?.(activeBooking)}
                              className="w-full h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/90 dark:border-emerald-800/80 hover:border-emerald-500 dark:hover:border-emerald-600 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/60 flex flex-col items-center justify-center text-[#047857] dark:text-emerald-300 text-[9px] shadow-xs cursor-pointer transition-all active:scale-95 group focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                              title={`View Booking: ${activeBooking.guestDetails?.fullName} (${activeBooking.bookingReference}) · Room ${room.roomNumber} · Click to inspect customer folio`}
                              aria-label={`View reservation for ${activeBooking.guestDetails?.fullName}`}
                            >
                              <span className="font-bold truncate max-w-[42px] group-hover:underline">
                                {guestFirstName}
                              </span>
                            </button>
                          </td>
                        )
                      }

                      return (
                        <td key={day.dateStr} className="p-1">
                          <div
                            className="h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-[10px] transition-colors"
                            title={`Room ${room.roomNumber} Vacant & Available on ${day.dateStr}`}
                          >
                            ✓
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminRoomsTab

