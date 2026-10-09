import { jsPDF } from 'jspdf'
import type { ConfirmedReservation } from '@/types'

/**
 * Format currency in Indian Rupees notation
 */
function formatCurrency(amount: number): string {
  return 'Rs. ' + amount.toLocaleString('en-IN')
}

/**
 * Convert number to words (Indian numbering system)
 */
function numberToWords(num: number): string {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
  ]
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  if (num === 0) return 'Zero'

  function inWords(n: number): string {
    if (n < 20) return a[n]
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '')
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '')
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '')
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '')
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '')
  }

  return inWords(Math.round(num)) + ' Only'
}

/**
 * Generates and triggers download of a luxury hotel tax invoice & reservation bill PDF
 */
export function generateReservationPDF(reservation: ConfirmedReservation): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = 210
  const pageHeight = 297
  const margin = 14
  const contentWidth = pageWidth - margin * 2

  // Palette (Forest Green, Gold/Terracotta, Neutral Greys)
  const cForest = [38, 61, 47] // #263D2F
  const cForestDark = [26, 42, 32] // #1A2A20
  const cTerracotta = [184, 104, 74] // #B8684A
  const cIvory = [249, 246, 240] // #F9F6F0
  const cBorder = [220, 214, 203] // #DCD6CB
  const cCharcoal = [28, 35, 30] // #1C231E
  const cMuted = [100, 110, 104] // #646E68

  // 1. Top Decorative Brand Bar
  doc.setFillColor(cForest[0], cForest[1], cForest[2])
  doc.rect(0, 0, pageWidth, 28, 'F')

  // Gold accent line
  doc.setFillColor(cTerracotta[0], cTerracotta[1], cTerracotta[2])
  doc.rect(0, 28, pageWidth, 1.5, 'F')

  // Header Title
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('RENOOS HOTEL', margin, 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(215, 205, 190)
  doc.text('AN ARCHITECTURAL RETREAT OF RESTORATIVE HOSPITALITY', margin, 19)
  doc.text('Foothills of the Himalayas · Uttarakhand, India · GSTIN: 05AAACS1234F1Z8', margin, 24)

  // Header Right: Document Type
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(245, 240, 230)
  doc.text('TAX INVOICE & VOUCHER', pageWidth - margin, 13, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(215, 205, 190)
  doc.text(`Ref: ${reservation.bookingReference}`, pageWidth - margin, 19, { align: 'right' })
  const issuedDate = reservation.createdAt
    ? new Date(reservation.createdAt).toLocaleDateString('en-IN')
    : new Date().toLocaleDateString('en-IN')
  doc.text(`Issued: ${issuedDate}`, pageWidth - margin, 24, { align: 'right' })

  let y = 37

  // 2. Summary Info Grid (Two Boxes: Guest Details & Booking Particulars)
  const boxWidth = (contentWidth - 6) / 2
  const boxHeight = 44

  // Guest Box
  doc.setFillColor(cIvory[0], cIvory[1], cIvory[2])
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2])
  doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(cTerracotta[0], cTerracotta[1], cTerracotta[2])
  doc.text('BILLED TO (PRIMARY GUEST)', margin + 4, y + 6)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2])
  const guestName = `${reservation.guestDetails.title} ${reservation.guestDetails.firstName} ${reservation.guestDetails.lastName}`
  doc.text(guestName, margin + 4, y + 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2])
  doc.text(`Phone: ${reservation.guestDetails.phone}`, margin + 4, y + 19)
  doc.text(`Email: ${reservation.guestDetails.email}`, margin + 4, y + 24)
  if (reservation.guestDetails.arrivalTime) {
    doc.text(`Estimated Arrival: ${reservation.guestDetails.arrivalTime}`, margin + 4, y + 29)
  }
  const specialReqStr = Array.isArray(reservation.guestDetails.specialRequests) && reservation.guestDetails.specialRequests.length > 0
    ? reservation.guestDetails.specialRequests.join(', ').slice(0, 36)
    : (reservation.guestDetails.customNotes ? reservation.guestDetails.customNotes.slice(0, 36) : 'Standard Renoos Welcome')
  doc.text(
    `Special Requests: ${specialReqStr}`,
    margin + 4,
    y + 35
  )

  // Reservation Details Box
  const rightX = margin + boxWidth + 6
  doc.setFillColor(cIvory[0], cIvory[1], cIvory[2])
  doc.roundedRect(rightX, y, boxWidth, boxHeight, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(cTerracotta[0], cTerracotta[1], cTerracotta[2])
  doc.text('RESERVATION PARTICULARS', rightX + 4, y + 6)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(cForest[0], cForest[1], cForest[2])
  doc.text(`Room ${reservation.room.roomNumber} — ${reservation.room.name}`, rightX + 4, y + 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2])
  doc.text(`Category: ${reservation.room.category} (${reservation.room.area} m²)`, rightX + 4, y + 19)
  doc.text(`Check-In:  ${reservation.checkInDate} (From 14:00)`, rightX + 4, y + 24)
  doc.text(`Check-Out: ${reservation.checkOutDate} (Until 12:00)`, rightX + 4, y + 29)
  doc.text(
    `Guests: ${reservation.adults} Adults${reservation.children > 0 ? `, ${reservation.children} Child` : ''} · ${reservation.nights} Night(s)`,
    rightX + 4,
    y + 35
  )

  y += boxHeight + 8

  // 3. Itemized Billing Table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(cForest[0], cForest[1], cForest[2])
  doc.text('ITEMIZED TARIFF BREAKDOWN', margin, y)

  y += 3

  // Table Header
  const colX = {
    desc: margin + 3,
    sac: margin + 95,
    rate: margin + 120,
    qty: margin + 145,
    amount: pageWidth - margin - 3,
  }

  doc.setFillColor(cForest[0], cForest[1], cForest[2])
  doc.rect(margin, y, contentWidth, 7, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(255, 255, 255)
  doc.text('SERVICE / ITEM DESCRIPTION', colX.desc, y + 4.8)
  doc.text('SAC CODE', colX.sac, y + 4.8)
  doc.text('RATE / NIGHT', colX.rate, y + 4.8)
  doc.text('QTY / NIGHTS', colX.qty, y + 4.8)
  doc.text('AMOUNT (INR)', colX.amount, y + 4.8, { align: 'right' })

  y += 7

  // Helper row renderer
  const drawRow = (desc: string, sub: string, sac: string, rate: string, qty: string, amt: string, isAlt = false) => {
    const rowH = 10
    if (isAlt) {
      doc.setFillColor(252, 250, 246)
      doc.rect(margin, y, contentWidth, rowH, 'F')
    }
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2])
    doc.line(margin, y + rowH, margin + contentWidth, y + rowH)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2])
    doc.text(desc, colX.desc, y + 4.5)

    if (sub) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.8)
      doc.setTextColor(cMuted[0], cMuted[1], cMuted[2])
      doc.text(sub, colX.desc, y + 8)
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2])
    doc.text(sac, colX.sac, y + 5.5)
    doc.text(rate, colX.rate, y + 5.5)
    doc.text(qty, colX.qty, y + 5.5)
    doc.setFont('helvetica', 'bold')
    doc.text(amt, colX.amount, y + 5.5, { align: 'right' })

    y += rowH
  }

  const roomSubtotal = reservation.tariffPerNight * reservation.nights
  drawRow(
    `Suite Accommodation — Room ${reservation.room.roomNumber}`,
    `${reservation.room.name} · Bedding: ${reservation.room.bedType.split('(')[0]}`,
    '996311',
    formatCurrency(reservation.tariffPerNight),
    `${reservation.nights} Night(s)`,
    formatCurrency(roomSubtotal),
    false
  )

  drawRow(
    'Renoos Environmental & Conservation Levy',
    'Preservation of alpine courtyard flora, botanical grounds & solar microgrid',
    '999799',
    formatCurrency(Math.round(reservation.conservationFee / reservation.nights)),
    `${reservation.nights} Night(s)`,
    formatCurrency(reservation.conservationFee),
    true
  )

  if (reservation.discount > 0) {
    drawRow(
      `Special Privilege Discount (${reservation.promoCodeApplied || 'PROMO'})`,
      'Promotional concession applied to room tariff subtotal',
      '-',
      '-',
      '1',
      '-' + formatCurrency(reservation.discount),
      false
    )
  }

  drawRow(
    'Curated Inclusions & Privileges',
    'Artisan buffet breakfast, ultra-high-speed Wi-Fi 6, 24-hr butler, 360° virtual tour access',
    'INCLUDED',
    'Rs. 0',
    'All Guests',
    'COMPLIMENTARY',
    reservation.discount > 0
  )

  // 4. Totals & Tax Calculation Strip
  y += 2
  const calcBoxWidth = 85
  const calcX = pageWidth - margin - calcBoxWidth

  const addTotalLine = (label: string, value: string, isBold = false, isAccent = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    doc.setFontSize(isBold ? 9 : 8)
    if (isAccent) {
      doc.setTextColor(cForest[0], cForest[1], cForest[2])
    } else {
      doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2])
    }
    doc.text(label, calcX, y + 4)
    doc.text(value, pageWidth - margin - 3, y + 4, { align: 'right' })
    y += 5.5
  }

  const taxableVal = roomSubtotal - (reservation.discount || 0) + reservation.conservationFee
  const cgst = Math.round(reservation.taxesAndGst / 2)
  const sgst = reservation.taxesAndGst - cgst

  addTotalLine('Taxable Value (Subtotal):', formatCurrency(taxableVal))
  addTotalLine('CGST (Central Tax @ 9%):', formatCurrency(cgst))
  addTotalLine('SGST (State Tax @ 9%):', formatCurrency(sgst))

  // Grand Total Banner
  y += 1
  doc.setFillColor(cForest[0], cForest[1], cForest[2])
  doc.roundedRect(calcX - 4, y, calcBoxWidth + 4, 9, 1.5, 1.5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.text('TOTAL PAYABLE:', calcX, y + 6)
  doc.text(formatCurrency(reservation.totalAmount), pageWidth - margin - 3, y + 6, { align: 'right' })

  // Left side under table: Payment & Words info
  const infoY = y - 18
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2])
  doc.text('AMOUNT IN WORDS:', margin, infoY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2])
  doc.text(`Indian Rupees ${numberToWords(reservation.totalAmount)}`, margin, infoY + 4.5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2])
  doc.text('PAYMENT SETTLEMENT STATUS:', margin, infoY + 11)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  if (reservation.paymentStatus === 'paid') {
    doc.setTextColor(22, 101, 52) // Emerald
    doc.text('PAID IN FULL · RESERVATION CONFIRMED', margin, infoY + 16)
  } else {
    doc.setTextColor(cTerracotta[0], cTerracotta[1], cTerracotta[2])
    doc.text('PENDING AT RESORT CHECK-IN', margin, infoY + 16)
  }
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2])
  doc.text(`Method: ${reservation.paymentMethod.toUpperCase()} · Transaction Ref: TXN-${reservation.bookingReference}`, margin, infoY + 20.5)

  y += 18

  // 5. Check-In Security & Policies Card
  doc.setFillColor(cIvory[0], cIvory[1], cIvory[2])
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2])
  doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(cForest[0], cForest[1], cForest[2])
  doc.text('HOTEL ARRIVAL & RECEPTION POLICIES', margin + 4, y + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2])
  doc.text('• Government Photo ID (Aadhaar / Passport / Driving Licence) is mandatory for each registering adult guest upon check-in.', margin + 4, y + 10)
  doc.text('• Check-in begins at 14:00 hrs. Early arrival is subject to villa availability. Check-out is scheduled by 12:00 hrs.', margin + 4, y + 14.5)
  doc.text('• Free cancellation is honored up to 48 hours prior to check-in date. Full refund credited within 3-5 business days.', margin + 4, y + 19)
  doc.text('• Touchless Digital Access: Present booking reference or display this PDF on your device for immediate keycard encoding.', margin + 4, y + 23.5)
  doc.text('• Renoos Hotel maintains total silent acoustic isolation between 22:00 and 07:00 hrs for restful tranquility.', margin + 4, y + 28)

  y += 36

  // 6. Signatures & Digital Authentication
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2])
  doc.line(margin, y, margin + contentWidth, y)
  y += 4

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(cForest[0], cForest[1], cForest[2])
  doc.text('RENOOS HOTEL RESIDENCES', margin, y + 3)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2])
  doc.text('Digitally Authenticated Hospitality Voucher · No Physical Stamp Required', margin, y + 7)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(cTerracotta[0], cTerracotta[1], cTerracotta[2])
  doc.text('HOTEL CONCIERGE DESK', pageWidth - margin, y + 3, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2])
  doc.text('+91 (800) 555-RENOOS · concierge@renooshotel.demo', pageWidth - margin, y + 7, { align: 'right' })

  // Save the document with clean, professional filename
  const filename = `Renoos_Hotel_Bill_${reservation.bookingReference}.pdf`
  doc.save(filename)
}

/**
 * Opens a dedicated printable invoice in a new window with clean @media print styles
 */
export function printReservationInvoice(reservation: ConfirmedReservation): void {
  const printWindow = window.open('', '_blank', 'width=840,height=960')
  if (!printWindow) {
    // Fallback if popup blocked: fallback to browser print
    window.print()
    return
  }

  const roomSubtotal = reservation.tariffPerNight * reservation.nights
  const cgst = Math.round(reservation.taxesAndGst / 2)
  const sgst = reservation.taxesAndGst - cgst

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice & Voucher — ${reservation.bookingReference}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1C231E;
      background: #FFFFFF;
      padding: 16px;
      font-size: 12px;
      line-height: 1.4;
    }
    .header {
      background: #263D2F;
      color: #FFFFFF;
      padding: 20px 24px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 22px;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .header p {
      font-size: 10px;
      color: #D7CDBE;
    }
    .header-right {
      text-align: right;
    }
    .header-right .doc-title {
      font-size: 13px;
      font-weight: bold;
      color: #FFFFFF;
      letter-spacing: 0.5px;
    }
    .header-right .ref {
      font-family: monospace;
      font-size: 12px;
      background: rgba(255,255,255,0.15);
      padding: 3px 8px;
      border-radius: 4px;
      margin-top: 4px;
      display: inline-block;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .card {
      background: #F9F6F0;
      border: 1px solid #E9E4DB;
      border-radius: 8px;
      padding: 14px 16px;
    }
    .card-title {
      font-size: 9px;
      font-weight: bold;
      color: #B8684A;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
    }
    .card-name {
      font-size: 14px;
      font-weight: bold;
      color: #263D2F;
      margin-bottom: 4px;
    }
    .card-row {
      font-size: 11px;
      color: #646E68;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    th {
      background: #263D2F;
      color: #FFFFFF;
      padding: 8px 10px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: left;
    }
    th.right, td.right {
      text-align: right;
    }
    td {
      padding: 9px 10px;
      border-bottom: 1px solid #E9E4DB;
      font-size: 11px;
    }
    tr.alt {
      background: #FAFAF7;
    }
    .totals-area {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .payment-badge {
      display: inline-block;
      padding: 4px 10px;
      background: #E8F5E9;
      color: #2E7D32;
      font-weight: bold;
      border-radius: 999px;
      font-size: 11px;
      margin-top: 6px;
    }
    .totals-box {
      width: 260px;
      background: #F9F6F0;
      border: 1px solid #E9E4DB;
      border-radius: 8px;
      padding: 12px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      margin-bottom: 4px;
    }
    .totals-row.grand {
      font-size: 13px;
      font-weight: bold;
      color: #263D2F;
      border-top: 2px solid #263D2F;
      padding-top: 6px;
      margin-top: 6px;
    }
    .policies {
      background: #F9F6F0;
      border: 1px solid #E9E4DB;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 10px;
      color: #4A5550;
      line-height: 1.5;
      margin-bottom: 16px;
    }
    .footer {
      border-top: 1px solid #E9E4DB;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #8C9690;
    }
    .no-print-bar {
      margin-bottom: 12px;
      display: flex;
      gap: 8px;
    }
    .btn {
      padding: 8px 16px;
      background: #263D2F;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: bold;
    }
    @media print {
      .no-print-bar {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <button class="btn" onclick="window.print()">Print Tax Invoice</button>
    <button class="btn" style="background:#B8684A;" onclick="window.close()">Close Window</button>
  </div>

  <div class="header">
    <div>
      <h1>RENOOS HOTEL</h1>
      <p>AN ARCHITECTURAL RETREAT OF RESTORATIVE HOSPITALITY</p>
      <p>Foothills of the Himalayas · Uttarakhand, India · GSTIN: 05AAACS1234F1Z8</p>
    </div>
    <div class="header-right">
      <div class="doc-title">TAX INVOICE & VOUCHER</div>
      <div class="ref">${reservation.bookingReference}</div>
      <p style="margin-top:4px;">Date: ${reservation.createdAt ? new Date(reservation.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}</p>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Billed To (Primary Guest)</div>
      <div class="card-name">${reservation.guestDetails.title} ${reservation.guestDetails.firstName} ${reservation.guestDetails.lastName}</div>
      <div class="card-row">Phone: ${reservation.guestDetails.phone}</div>
      <div class="card-row">Email: ${reservation.guestDetails.email}</div>
      ${reservation.guestDetails.arrivalTime ? `<div class="card-row">Arrival Time: ${reservation.guestDetails.arrivalTime}</div>` : ''}
    </div>

    <div class="card">
      <div class="card-title">Reservation Particulars</div>
      <div class="card-name">Room ${reservation.room.roomNumber} — ${reservation.room.name}</div>
      <div class="card-row">Check-In: <strong>${reservation.checkInDate}</strong> (From 14:00)</div>
      <div class="card-row">Check-Out: <strong>${reservation.checkOutDate}</strong> (Until 12:00)</div>
      <div class="card-row">Duration: ${reservation.nights} Night(s) · ${reservation.adults} Adults${reservation.children > 0 ? `, ${reservation.children} Child` : ''}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Service Description</th>
        <th>SAC Code</th>
        <th class="right">Rate / Night</th>
        <th class="right">Nights</th>
        <th class="right">Amount (INR)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Suite Accommodation — Room ${reservation.room.roomNumber}</strong><br><span style="color:#646E68;font-size:10px;">${reservation.room.name} (${reservation.room.category})</span></td>
        <td>996311</td>
        <td class="right">₹${reservation.tariffPerNight.toLocaleString('en-IN')}</td>
        <td class="right">${reservation.nights}</td>
        <td class="right"><strong>₹${roomSubtotal.toLocaleString('en-IN')}</strong></td>
      </tr>
      <tr class="alt">
        <td><strong>Renoos Environmental & Conservation Levy</strong><br><span style="color:#646E68;font-size:10px;">Ecology fund & solar microgrid maintenance</span></td>
        <td>999799</td>
        <td class="right">₹${Math.round(reservation.conservationFee / reservation.nights).toLocaleString('en-IN')}</td>
        <td class="right">${reservation.nights}</td>
        <td class="right"><strong>₹${reservation.conservationFee.toLocaleString('en-IN')}</strong></td>
      </tr>
      ${
        reservation.discount > 0
          ? `<tr>
        <td><strong>Special Privilege Discount (${reservation.promoCodeApplied || 'PROMO'})</strong></td>
        <td>-</td>
        <td class="right">-</td>
        <td class="right">1</td>
        <td class="right" style="color:#B8684A;"><strong>-₹${reservation.discount.toLocaleString('en-IN')}</strong></td>
      </tr>`
          : ''
      }
      <tr class="alt">
        <td><strong>Curated Privileges: Artisan Breakfast, Wi-Fi 6, Butler Service</strong></td>
        <td>INCL</td>
        <td class="right">₹0</td>
        <td class="right">All</td>
        <td class="right" style="color:#2E7D32;"><strong>COMPLIMENTARY</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="totals-area">
    <div>
      <div style="font-size:10px; color:#646E68; text-transform:uppercase; font-weight:bold;">Settlement Status</div>
      <div class="payment-badge">${reservation.paymentStatus === 'paid' ? 'PAID IN FULL · CONFIRMED' : 'PAY AT HOTEL CHECK-IN'}</div>
      <div style="font-size:10px; color:#646E68; margin-top:4px;">Payment Method: ${reservation.paymentMethod.toUpperCase()} · TXN-${reservation.bookingReference}</div>
    </div>

    <div class="totals-box">
      <div class="totals-row">
        <span>Taxable Value:</span>
        <span>₹${(roomSubtotal - (reservation.discount || 0) + reservation.conservationFee).toLocaleString('en-IN')}</span>
      </div>
      <div class="totals-row">
        <span>CGST (9%):</span>
        <span>₹${cgst.toLocaleString('en-IN')}</span>
      </div>
      <div class="totals-row">
        <span>SGST (9%):</span>
        <span>₹${sgst.toLocaleString('en-IN')}</span>
      </div>
      <div class="totals-row grand">
        <span>Total Payable:</span>
        <span>₹${reservation.totalAmount.toLocaleString('en-IN')}</span>
      </div>
    </div>
  </div>

  <div class="policies">
    <strong>Hotel Policies & Check-In Requirements:</strong><br>
    • Valid government photo ID (Aadhaar / Passport) is required for each guest upon check-in.<br>
    • Check-in: 14:00 hrs | Check-out: 12:00 hrs. Complimentary cancellation up to 48 hours prior to arrival.<br>
    • Present this voucher or booking reference on arrival for instant reception room keycard encoding.
  </div>

  <div class="footer">
    <div>RENOOS HOTEL RESIDENCES · Authorized Electronic Tax Invoice</div>
    <div>Concierge: +91 (800) 555-RENOOS · concierge@renooshotel.demo</div>
  </div>

  <script>
    window.onload = function() {
      // Auto trigger print dialogue for user convenience
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
