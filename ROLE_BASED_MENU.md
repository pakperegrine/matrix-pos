# Role-Based Menu System

## Overview
The Matrix POS system now implements a dynamic role-based menu system that displays different navigation options based on the user's role.

## User Roles

### 1. Owner (👑)
**Access Level**: Full business management
**Menu Items**:
- ✅ Owner Dashboard - Comprehensive business overview, multi-location management, user management
- ✅ Products - Product catalog management
- ✅ Sales - Sales history and transactions
- ✅ Customers - Customer relationship management
- ✅ Discounts - Discount and promotion management
- ✅ Reports - Advanced analytics and reporting
- ✅ Forecasting - Inventory forecasting and planning
- ✅ Currency - Multi-currency settings
- ✅ Settings - System configuration

**Default Landing Page**: `/owner` (Owner Dashboard)

**Special Features**:
- Multi-location overview and management
- User creation and role assignment
- Business-wide statistics
- Location performance comparison
- User session tracking

---

### 2. Administrator (Admin)
**Access Level**: Full operational access
**Menu Items**:
- ✅ POS - Point of sale terminal
- ✅ Products - Product catalog management
- ✅ Sales - Sales history and transactions
- ✅ Customers - Customer relationship management
- ✅ Discounts - Discount and promotion management
- ✅ Reports - Advanced analytics and reporting
- ✅ Forecasting - Inventory forecasting and planning
- ✅ Sync - Data synchronization management
- ✅ Currency - Multi-currency settings
- ✅ Settings - System configuration

**Default Landing Page**: `/pos`

**Key Responsibilities**:
- Day-to-day operations management
- System configuration and maintenance
- Data synchronization oversight
- Complete product and customer management

---

### 3. Manager
**Access Level**: Store management
**Menu Items**:
- ✅ POS - Point of sale terminal
- ✅ Products - Product catalog management
- ✅ Sales - Sales history and transactions
- ✅ Customers - Customer relationship management
- ✅ Discounts - Discount and promotion management
- ✅ Reports - Store analytics and reporting

**Default Landing Page**: `/pos`

**Key Responsibilities**:
- Store operations oversight
- Product inventory management
- Customer service management
- Sales reporting and analysis
- Discount approval and management

---

### 4. Cashier
**Access Level**: Basic operations
**Menu Items**:
- ✅ POS - Point of sale terminal
- ✅ Sales - View sales history
- ✅ Customers - Basic customer lookup

**Default Landing Page**: `/pos`

**Key Responsibilities**:
- Process sales transactions
- Handle customer purchases
- Basic customer service
- View sales records

---

## Implementation Details

### Login Flow
1. User enters credentials at `/login`
2. System validates credentials via backend API
3. Backend returns JWT token with user information including `role` field
4. Frontend stores user data in localStorage
5. System redirects based on role:
   - **Owner** → `/owner` (Owner Dashboard)
   - **Admin/Manager/Cashier** → `/pos` (Point of Sale)

### Menu Rendering
The sidebar navigation (`app.component.html`) uses Angular's `*ngIf` directive to conditionally display menu items:

```html
<a *ngIf="hasMenuAccess('owner')" routerLink="/owner">
  <span class="nav-icon">👑</span>
  <span class="nav-label">Owner Dashboard</span>
</a>
```

### Permission Check Method
The `hasMenuAccess(menuItem: string)` method in `app.component.ts` determines visibility:

```typescript
hasMenuAccess(menuItem: string): boolean {
  const rolePermissions = {
    'owner': ['owner', 'reports', 'settings', ...],
    'admin': ['reports', 'settings', 'products', ...],
    'manager': ['pos', 'products', 'sales', ...],
    'cashier': ['pos', 'sales', 'customers']
  };
  return rolePermissions[this.userRoleType].includes(menuItem);
}
```

## User Display

The sidebar footer displays:
- **User Avatar**: First letter of username
- **User Name**: Full name from user profile
- **User Role**: 
  - `owner` → "Business Owner"
  - `admin` → "Administrator"
  - `manager` → "Manager"
  - `cashier` → "Cashier"

## Testing the System

### 1. Login as Owner
```
Email: owner@pos.com
Password: Owner123*
Expected: Redirect to /owner with Owner Dashboard menu item visible
```

### 2. Login as Admin
```
Create admin user through owner dashboard or seed script
Expected: Redirect to /pos with full admin menu (no Owner Dashboard)
```

### 3. Login as Manager
```
Create manager user through owner dashboard
Expected: Redirect to /pos with limited menu (no Sync, Currency, Settings)
```

### 4. Login as Cashier
```
Create cashier user through owner dashboard
Expected: Redirect to /pos with minimal menu (POS, Sales, Customers only)
```

## Security Notes

1. **Frontend Security**: Menu visibility is controlled client-side for UX
2. **Backend Security**: All API endpoints must verify user permissions server-side
3. **Role Verification**: JWT token contains user role for backend validation
4. **Data Isolation**: Multi-tenant architecture ensures data separation by business_id

## Future Enhancements

- [ ] Custom role creation with granular permissions
- [ ] Permission-based feature toggling within pages
- [ ] Role-based dashboard customization
- [ ] Activity logging and audit trails by role
- [ ] Advanced permission groups (view, create, edit, delete)

---

**Last Updated**: December 4, 2025
**Version**: 1.1.0
