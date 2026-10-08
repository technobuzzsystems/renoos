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
}

export const AdminRoomsTab: React.FC<AdminRoomsTabProps> = ({
  rooms,
  bookings,
  onUpdateRoom,
}) => {
  const [editingRoomNumber, setEditingRoomNumber] = useState<string | null>(null)
  const [tariffInput, setTariffInput] = useState<number>(5000)
  const [notesInput, setNotesInput] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

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
          <h2 className="font-serif text-xl sm:text-2xl text-cream font-semibold">
            Room Inventory & Tariff Management
          </h2>
          <p className="text-xs text-cream/70 font-mono">
            Control live operational readiness, housekeeping notes, base tariffs, and visual occupancy calendar
          </p>
        </div>

        {saveSuccess && (
          <div className="p-2.5 px-4 bg-emerald-500/20 border border-emerald-400/40 rounded-full text-xs font-mono text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
              className="p-6 bg-[#16251C]/80 backdrop-blur-xl border border-cream/15 rounded-3xl shadow-xl flex flex-col justify-between space-y-5 hover:border-amber-300/30 transition-all"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-200 block">
                      Suite {room.roomNumber}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-cream mt-0.5">
                      {room.name}
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold border ${
                      opStatus === 'available'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                        : opStatus === 'cleaning'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                        : 'bg-red-500/20 text-red-300 border-red-400/40'
                    }`}
                  >
                    {opStatus}
                  </span>
                </div>

                {/* Quick Status Buttons */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-cream/60 mb-1.5">
                    Operational Status Switcher
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 rounded-2xl border border-cream/15 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => handleQuickStatusChange(room.roomNumber, 'available')}
                      className={`py-1.5 rounded-xl font-bold transition-all min-h-[36px] flex items-center justify-center cursor-pointer ${
                        opStatus === 'available'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-cream/60 hover:text-white'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickStatusChange(room.roomNumber, 'cleaning')}
                      className={`py-1.5 rounded-xl font-bold transition-all min-h-[36px] flex items-center justify-center cursor-pointer ${
                        opStatus === 'cleaning'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-cream/60 hover:text-white'
                      }`}
                    >
                      Cleaning
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickStatusChange(room.roomNumber, 'maintenance')}
                      className={`py-1.5 rounded-xl font-bold transition-all min-h-[36px] flex items-center justify-center cursor-pointer ${
                        opStatus === 'maintenance'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-cream/60 hover:text-white'
                      }`}
                    >
                      Maintenance
                    </button>
                  </div>
                  {opStatus === 'maintenance' && (
                    <p className="text-[10px] font-mono text-red-300 mt-1">
                      ⚠️ Locked: Guests cannot book this room until set back to Available.
                    </p>
                  )}
                </div>

                {/* Base Tariff & Housekeeping Notes */}
                {isEditing ? (
                  <div className="p-4 bg-black/40 rounded-2xl border border-amber-300/30 space-y-3 animate-in fade-in">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-amber-200 mb-1">
                        Base Tariff (₹ per night)
                      </label>
                      <input
                        type="number"
                        min="1000"
                        step="100"
                        value={tariffInput}
                        onChange={(e) => setTariffInput(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#0d1611] border border-cream/20 rounded-xl text-xs font-mono text-cream focus:outline-none focus:border-amber-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-amber-200 mb-1">
                        Housekeeping & Inspection Notes
                      </label>
                      <textarea
                        rows={2}
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder="e.g. Deep clean completed. Fresh linen, herbal diffuser active."
                        className="w-full px-3 py-2 bg-[#0d1611] border border-cream/20 rounded-xl text-xs font-mono text-cream focus:outline-none focus:border-amber-300 resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSave(room.roomNumber)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-3 py-2 rounded-xl bg-cream/10 hover:bg-cream/20 text-cream font-mono text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 bg-black/30 rounded-2xl border border-cream/10 text-xs font-mono">
                      <span className="text-cream/70">Current Rate:</span>
                      <strong className="font-bold text-amber-200 text-sm">
                        {formatCurrency(room.baseTariff || 5200)} / night
                      </strong>
                    </div>

                    {room.housekeepingNotes && (
                      <div className="p-3 bg-black/20 rounded-2xl border border-cream/10 text-[11px] font-mono text-cream/70">
                        <span className="text-[10px] uppercase text-cream/40 block mb-0.5">
                          Housekeeping Log:
                        </span>
                        &ldquo;{room.housekeepingNotes}&rdquo;
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="pt-3 border-t border-cream/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-cream/50 uppercase">Settings</span>
                  <button
                    type="button"
                    onClick={() => startEdit(room)}
                    className="text-amber-200 hover:text-white underline cursor-pointer"
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
      <div className="p-4 sm:p-6 bg-[#16251C]/80 backdrop-blur-xl border border-cream/15 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-cream flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-200" />
              <span>14-Day Visual Occupancy Matrix</span>
            </h3>
            <p className="text-xs text-cream/70 font-mono">
              Live schedule overview across all suites
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono text-cream/70">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80" />
              <span className="text-[11px] sm:text-xs">Vacant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500" />
              <span className="text-[11px] sm:text-xs">Reserved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
              <span className="text-[11px] sm:text-xs">Maintenance</span>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="sm:hidden text-[10px] text-amber-200/80 font-mono flex items-center gap-1 pt-1">
          <span>← Swipe horizontally to inspect 14-day schedule →</span>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto pt-2 touch-pan-x">
          <table className="w-full text-center text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-cream/15 text-[10px] text-cream/60 uppercase">
                <th className="py-2 px-3 text-left w-28 sm:w-36 sticky left-0 bg-[#16251C] z-20 border-r border-cream/10 shadow-sm">
                  Suite
                </th>
                {next14Days.map((d) => (
                  <th
                    key={d.dateStr}
                    className={`py-2 px-1 text-center min-w-[42px] ${
                      d.isToday ? 'bg-amber-400/15 text-amber-200 rounded-t-lg' : ''
                    }`}
                  >
                    <div>{d.dayName}</div>
                    <div className="font-bold text-cream text-[11px]">{d.dayNum}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream/10">
              {rooms.map((room) => {
                const opStatus = room.operationalStatus || 'available'

                return (
                  <tr key={room.roomNumber} className="hover:bg-cream/5 transition-colors">
                    <td className="py-3 px-3 text-left font-serif font-bold text-cream sticky left-0 bg-[#16251C] z-10 border-r border-cream/10 shadow-sm">
                      <div className="text-xs sm:text-sm">Room {room.roomNumber}</div>
                      <div className="text-[10px] text-cream/50 font-mono truncate max-w-[90px] sm:max-w-[120px]">
                        {room.name.split(' ')[0]}
                      </div>
                    </td>

                    {next14Days.map((day) => {
                      if (opStatus === 'maintenance') {
                        return (
                          <td key={day.dateStr} className="p-1">
                            <div
                              className="h-9 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-300 font-bold text-[9px]"
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
                        return (
                          <td key={day.dateStr} className="p-1">
                            <div
                              className="h-9 rounded-xl bg-amber-500/25 border border-amber-300/40 flex flex-col items-center justify-center text-amber-100 text-[9px] shadow-sm cursor-help hover:bg-amber-500/40 transition-colors"
                              title={`Reserved: ${activeBooking.guestDetails?.fullName} (${activeBooking.bookingReference})`}
                            >
                              <span className="font-bold truncate max-w-[36px]">
                                {activeBooking.guestDetails?.fullName?.split(' ')[0] || 'Guest'}
                              </span>
                            </div>
                          </td>
                        )
                      }

                      return (
                        <td key={day.dateStr} className="p-1">
                          <div
                            className="h-9 rounded-xl bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-400/50 flex items-center justify-center text-emerald-400 text-[10px] transition-colors"
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

