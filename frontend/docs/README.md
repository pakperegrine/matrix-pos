# 📘 POS Cash Management Module — Functional Specification
### *Guidance for GitHub Copilot to Implement in Existing POS System*

## 🧭 Overview
This document defines the complete business scenario for implementing a professional Cash Management Module inside the existing POS system. Copilot must use this scenario to generate all required functionality, backend logic, frontend UI, and database extensions.

## 🎯 Goal
Enable the POS to track and manage all cash-related activities performed by a cashier during their shift, from opening float to closing shift reconciliation, including all cash movements and audit logs.

## 👥 Actors
- Cashier / Biller
- Supervisor / Manager
- POS Terminal
- Admin / Accounting Department

# 🟦 1. Start of Shift — Opening Cash Float
Cashier logs in, enters opening float, supervisor approves, and a shift session is created.

# 🟩 2. Sales Operations (During Shift)
System tracks:
- Cash payments  
- Card payments  
- Discounts  
- Voids (supervisor-approved)  
- Refunds (supervisor-approved)

Expected Drawer Cash = Opening Float + Cash Sales + Cash In – Cash Out – Cash Drops

# 🟧 3. Cash In / Cash Out Movements
Cash In: Add money to drawer.  
Cash Out: Supervisor collects money or petty expense.  
Supervisor approval required.

# 🟥 4. Cash Drop (Safe Drop)
Cashier removes excess cash and deposits to safe. Supervisor approval required.

# 🟨 5. Drawer Open Event Logs
System records every drawer open event for auditing.

# 🟪 6. End of Shift — Cash Count & Reconciliation
Cashier enters actual counted cash → system compares expected vs actual → supervisor approves closing → shift locks.

# 🟫 7. Reporting: X Report & Z Report
X Report = Mid-shift status  
Z Report = Final closure report with all financial details.

# ⚙️ System Requirements for Copilot
Backend:
- Database tables for shifts, cash movements, drawer logs  
- APIs for shift lifecycle  
- Reporting endpoints  

Frontend:
- Screens for opening shift, dashboard, cash movements, closing shift, reports  
- Supervisor PIN approval popups  

Security:
- Cashier permissions  
- Supervisor approval for sensitive actions  

Audit Trail:
- Log every cash movement and drawer opening  

# 📝 Summary
This module adds:
- Full cashier cash accountability  
- Supervisor-controlled operations  
- Real-time drawer audit  
- Accurate accounting reports  

Copilot must generate all backend logic, frontend UI, and database changes based on this scenario.
