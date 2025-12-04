# Global Location Selector - Implementation Guide

## Overview
The global location selector allows owners to filter data across all modules by selecting a specific location or viewing all locations combined. This feature is visible only to users with the "owner" role.

## Features

### 1. **Header Location Dropdown**
- Appears in the top header bar (only for owners)
- Displays all active locations
- Includes "All Locations" option to view aggregated data
- Selection persists across page navigation and browser sessions

### 2. **Reactive Location Service**
- Centralized location management using RxJS BehaviorSubject
- Components automatically react to location changes
- No manual refresh needed - data updates automatically

### 3. **Multi-Module Support**
All modules can subscribe to location changes:
- ✅ Owner Dashboard
- ✅ Reports
- ✅ Sales
- ✅ Products
- ✅ Customers
- ✅ Forecasting

## Implementation

### For Component Developers

#### 1. Import the Location Service

```typescript
import { LocationService } from '../../services/location.service';
import { Subscription } from 'rxjs';
```

#### 2. Add Properties

```typescript
export class YourComponent implements OnInit, OnDestroy {
  selectedLocationId: string | null = null;
  private locationSubscription?: Subscription;
  
  constructor(
    private locationService: LocationService
    // ... other services
  ) {}
}
```

#### 3. Subscribe to Location Changes

```typescript
ngOnInit() {
  // Subscribe to location changes
  this.locationSubscription = this.locationService.selectedLocation$.subscribe(location => {
    this.selectedLocationId = location?.id || null;
    
    // Reload your data when location changes
    this.loadData();
  });
  
  // Initial load
  this.loadData();
}

ngOnDestroy() {
  if (this.locationSubscription) {
    this.locationSubscription.unsubscribe();
  }
}
```

#### 4. Use Location ID in API Calls

```typescript
loadData() {
  let url = `${this.apiUrl}/your-endpoint?start_date=${this.startDate}&end_date=${this.endDate}`;
  
  // Add location filter if a specific location is selected
  if (this.selectedLocationId) {
    url += `&location_id=${this.selectedLocationId}`;
  }
  
  this.http.get(url).subscribe({
    next: (data) => {
      this.yourData = data;
    },
    error: (err) => console.error(err)
  });
}
```

## Location Service API

### Properties

```typescript
// Observable of currently selected location (or null for "All Locations")
selectedLocation$: Observable<Location | null>

// Observable of all available locations
locations$: Observable<Location[]>
```

### Methods

```typescript
// Load all locations from API
loadLocations(): Observable<Location[]>

// Select a location (pass null for "All Locations")
selectLocation(location: Location | null): void

// Get currently selected location
getSelectedLocation(): Location | null

// Get currently selected location ID
getSelectedLocationId(): string | null

// Clear location selection
clearSelection(): void

// Get only active locations
getActiveLocations(): Observable<Location[]>

// CRUD operations
createLocation(data: Partial<Location>): Observable<Location>
updateLocation(id: string, data: Partial<Location>): Observable<Location>
updateLocationStatus(id: string, status: string): Observable<Location>
deleteLocation(id: string): Observable<void>
```

## Backend Requirements

### API Endpoints Should Support location_id Query Parameter

All endpoints that return location-specific data should accept an optional `location_id` query parameter:

```typescript
// Example: Reports endpoint
@Get('sales-summary')
async getSalesSummary(
  @Query('start_date') startDate: string,
  @Query('end_date') endDate: string,
  @Query('location_id') locationId?: string, // Optional
  @Request() req
) {
  const businessId = req.businessId;
  
  // If locationId provided, filter by specific location
  // If not provided, aggregate across all locations
  return this.reportsService.getSalesSummary(
    businessId, 
    startDate, 
    endDate, 
    locationId
  );
}
```

### Service Layer Pattern

```typescript
async getSalesSummary(
  businessId: string,
  startDate: string,
  endDate: string,
  locationId?: string
) {
  const query = this.saleRepository
    .createQueryBuilder('invoice')
    .where('invoice.business_id = :businessId', { businessId })
    .andWhere('invoice.created_at BETWEEN :start AND :end', {
      start: startDate,
      end: endDate
    });
  
  // Add location filter if provided
  if (locationId) {
    query.andWhere('invoice.location_id = :locationId', { locationId });
  }
  
  return query.getRawOne();
}
```

## Examples

### Example 1: Sales Component

```typescript
export class SalesComponent implements OnInit, OnDestroy {
  sales: Sale[] = [];
  selectedLocationId: string | null = null;
  private locationSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.locationSubscription = this.locationService.selectedLocation$
      .subscribe(location => {
        this.selectedLocationId = location?.id || null;
        this.loadSales();
      });
  }

  loadSales() {
    let url = `${this.apiUrl}/sales`;
    if (this.selectedLocationId) {
      url += `?location_id=${this.selectedLocationId}`;
    }
    
    this.http.get<Sale[]>(url).subscribe(sales => {
      this.sales = sales;
    });
  }

  ngOnDestroy() {
    this.locationSubscription?.unsubscribe();
  }
}
```

### Example 2: Products Component with Multiple Filters

```typescript
export class ProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  selectedLocationId: string | null = null;
  searchTerm: string = '';
  category: string = '';
  private locationSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.locationSubscription = this.locationService.selectedLocation$
      .subscribe(location => {
        this.selectedLocationId = location?.id || null;
        this.loadProducts();
      });
  }

  loadProducts() {
    const params: any = {};
    
    if (this.selectedLocationId) {
      params.location_id = this.selectedLocationId;
    }
    if (this.searchTerm) {
      params.search = this.searchTerm;
    }
    if (this.category) {
      params.category = this.category;
    }
    
    this.http.get<Product[]>(`${this.apiUrl}/products`, { params })
      .subscribe(products => {
        this.products = products;
      });
  }

  ngOnDestroy() {
    this.locationSubscription?.unsubscribe();
  }
}
```

## UI Guidelines

### Visual Indicators

When a specific location is selected, consider showing:
- Location name in the page header or breadcrumb
- Badge or tag indicating filtered view
- Clear indication that data is location-specific

```html
<!-- Example indicator -->
<div class="filter-badge" *ngIf="selectedLocationId">
  <span class="icon">📍</span>
  <span>Viewing: {{ getLocationName() }}</span>
  <button (click)="clearLocationFilter()">×</button>
</div>
```

### Loading States

Show appropriate loading indicators when location changes trigger data reloads:

```html
<div class="content" *ngIf="!loading; else loadingTemplate">
  <!-- Your content -->
</div>

<ng-template #loadingTemplate>
  <div class="loading-spinner">
    <p>Loading data for selected location...</p>
  </div>
</ng-template>
```

## Testing Checklist

- [ ] Owner can see location selector in header
- [ ] Non-owner users don't see location selector
- [ ] Selecting "All Locations" shows aggregated data
- [ ] Selecting specific location filters data correctly
- [ ] Selection persists across page navigation
- [ ] Selection persists after browser refresh
- [ ] All modules respond to location changes
- [ ] Loading states display correctly during transitions
- [ ] Location selection clears on logout

## Troubleshooting

### Issue: Location selector not visible
**Solution:** Ensure user role is 'owner' and locations are loaded

### Issue: Data not updating when location changes
**Solution:** Check that component subscribes to `selectedLocation$` and calls data loading method

### Issue: Selection not persisting
**Solution:** Verify localStorage is not blocked and `selectedLocationId` is being saved

### Issue: API returning empty results
**Solution:** Check backend supports `location_id` query parameter and business_id matches

## Future Enhancements

- [ ] Location-specific inventory management
- [ ] Transfer products between locations
- [ ] Compare performance across locations
- [ ] Location-specific user permissions
- [ ] Multi-location reporting dashboards
- [ ] Real-time location switching without page reload
