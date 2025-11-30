# Inventory Forecasting System

## Overview
The Inventory Forecasting System uses AI-powered algorithms to predict future inventory demand, detect trends, identify seasonal patterns, and generate intelligent reorder suggestions. The system analyzes 90 days of historical sales data to provide accurate forecasting metrics.

## Features

### 1. Demand Prediction
- **7-Day Forecast**: Short-term demand prediction for immediate planning
- **30-Day Forecast**: Long-term demand for strategic inventory management
- **Average Daily Sales**: Calculate based on 90-day rolling window
- **Trend Detection**: Identify increasing, decreasing, or stable demand patterns

### 2. Stock Management
- **Current Stock Tracking**: Real-time inventory levels from stock batches
- **Days Until Stockout**: Calculate when inventory will run out
- **Reorder Point Calculation**: Automatic reorder threshold based on lead time + safety stock
- **Suggested Order Quantities**: Intelligent order recommendations

### 3. Analytics Dashboard
- **5-Tab Interface**:
  1. Overview - Summary metrics and all forecasts
  2. Low Stock Alerts - Products approaching stockout
  3. Reorder Suggestions - Products needing replenishment
  4. Trends - Increasing vs decreasing demand analysis
  5. Seasonal - Products with seasonal patterns

### 4. Intelligence Features
- **Seasonality Detection**: Identify products with irregular sales patterns
- **Confidence Scoring**: Measure forecast reliability (0-100%)
- **Urgency Classification**: Critical, High, Medium, Low alerts
- **Trend Analysis**: Aggregate statistics on demand patterns

## Database Schema

### StockForecast Entity (`stock_forecasts` table)
```typescript
{
  id: string (UUID)
  business_id: string (multi-tenant support)
  product_id: string (foreign key to products)
  current_stock: decimal (total quantity from stock_batches)
  avg_daily_sales: decimal (calculated from 90-day history)
  predicted_demand_7d: decimal (7-day forecast)
  predicted_demand_30d: decimal (30-day forecast)
  reorder_point: decimal (threshold for reordering)
  suggested_order_qty: decimal (recommended order quantity)
  days_until_stockout: integer (estimated days remaining)
  trend: enum ('increasing', 'decreasing', 'stable')
  is_seasonal: boolean (seasonal pattern detected)
  forecast_confidence: decimal (0-100%)
  calculated_at: datetime (last calculation timestamp)
  created_at: datetime
  updated_at: datetime
}
```

**Indexes**: `business_id`, `product_id`, `days_until_stockout` for performance

## Forecasting Algorithm

### Step-by-Step Process

#### 1. Data Collection (90-Day Window)
```typescript
const ninetyDaysAgo = new Date();
ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

// Fetch all sales for product in last 90 days
const salesData = await this.saleItemRepository
  .createQueryBuilder('item')
  .leftJoin('item.invoice', 'invoice')
  .where('item.product_id = :productId', { productId })
  .andWhere('invoice.business_id = :businessId', { businessId })
  .andWhere('invoice.created_at >= :startDate', { startDate: ninetyDaysAgo })
  .getMany();
```

#### 2. Average Daily Sales Calculation
```typescript
const totalQuantitySold = salesData.reduce((sum, sale) => sum + sale.quantity, 0);
const daysWithSales = new Set(salesData.map(s => s.invoice.created_at.toDateString())).size;
const avgDailySales = totalQuantitySold / 90;
```

#### 3. Trend Detection (Compare Recent 30 vs Previous 30 Days)
```typescript
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const sixtyDaysAgo = new Date();
sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

// Recent 30 days
const recentSales = salesData
  .filter(s => new Date(s.invoice.created_at) >= thirtyDaysAgo)
  .reduce((sum, s) => sum + s.quantity, 0);

// Previous 30 days (30-60 days ago)
const previousSales = salesData
  .filter(s => {
    const date = new Date(s.invoice.created_at);
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  })
  .reduce((sum, s) => sum + s.quantity, 0);

// Determine trend
let trend = 'stable';
if (recentSales > previousSales * 1.2) {
  trend = 'increasing';
} else if (recentSales < previousSales * 0.8) {
  trend = 'decreasing';
}
```

**Thresholds**:
- **Increasing**: Recent sales > 120% of previous sales
- **Decreasing**: Recent sales < 80% of previous sales
- **Stable**: Within 80-120% range

#### 4. Seasonality Detection
```typescript
const isSeasonalIndicator = daysWithSales > 0 && (daysWithSales / 90) < 0.3;
```

Product is considered seasonal if:
- Sales occurred on less than 30% of days in 90-day window
- Indicates irregular, sporadic purchasing patterns

#### 5. Demand Prediction
```typescript
const trendMultiplier = trend === 'increasing' ? 1.2 : trend === 'decreasing' ? 0.8 : 1;
const predicted7d = avgDailySales * 7 * trendMultiplier;
const predicted30d = avgDailySales * 30 * trendMultiplier;
```

**Trend Multipliers**:
- **Increasing**: 1.2 (20% higher demand)
- **Decreasing**: 0.8 (20% lower demand)
- **Stable**: 1.0 (no adjustment)

#### 6. Reorder Point Calculation
```typescript
const leadTimeDays = 7; // Supplier delivery time
const safetyStock = avgDailySales * 3; // 3 days buffer
const reorderPoint = (avgDailySales * leadTimeDays) + safetyStock;
```

**Formula**: `Reorder Point = (Avg Daily Sales × Lead Time) + Safety Stock`

**Components**:
- **Lead Time**: 7 days (assumed delivery time from supplier)
- **Safety Stock**: 3 days worth of average sales (buffer for uncertainty)

**Example**: If avg daily sales = 10 units
- Reorder Point = (10 × 7) + (10 × 3) = 70 + 30 = 100 units

#### 7. Suggested Order Quantity
```typescript
const stockBatches = await this.stockBatchRepository.find({
  where: { product_id: productId }
});
const currentStock = stockBatches.reduce((sum, batch) => sum + batch.quantity, 0);

const suggestedOrderQty = Math.max(0, reorderPoint + predicted30d - currentStock);
```

**Formula**: `Suggested Order = Reorder Point + 30-Day Forecast - Current Stock`

**Logic**:
- Order enough to cover reorder point AND next 30 days
- Subtract current stock (what you already have)
- Never suggest negative orders (use Math.max(0, ...))

#### 8. Days Until Stockout
```typescript
const daysUntilStockout = avgDailySales > 0 ? Math.floor(currentStock / avgDailySales) : 999;
```

**Formula**: `Days = Current Stock ÷ Average Daily Sales`

- If no sales history: 999 (effectively infinite)
- Rounded down to nearest integer

#### 9. Confidence Score
```typescript
const confidence = Math.min(100, (daysWithSales / 90) * 100);
```

**Calculation**: `Confidence = (Days with Sales ÷ 90) × 100`

**Interpretation**:
- 90+ days with sales = 100% confidence
- 45 days with sales = 50% confidence
- More data = higher confidence

## API Endpoints

### Base URL: `/forecasting`

1. **GET /products** - Get all product forecasts
   - Query: `?businessId=xxx`
   - Returns: `StockForecast[]`

2. **GET /products/:id** - Get single product forecast
   - Query: `?businessId=xxx`
   - Returns: `StockForecast`

3. **GET /low-stock** - Get low stock alerts
   - Query: `?businessId=xxx&days=7`
   - Returns: `StockForecast[]` where `days_until_stockout <= threshold`

4. **GET /reorder-suggestions** - Get reorder recommendations
   - Query: `?businessId=xxx`
   - Returns: Products where `current_stock <= reorder_point`
   ```json
   [
     {
       "product_id": "uuid",
       "current_stock": 25,
       "reorder_point": 100,
       "suggested_order_qty": 205,
       "days_until_stockout": 3,
       "urgency": "critical"
     }
   ]
   ```

5. **GET /trends** - Get trend analysis
   - Query: `?businessId=xxx`
   - Returns:
   ```json
   {
     "trends": {
       "increasing": 15,
       "decreasing": 8,
       "stable": 42,
       "seasonal": 5
     },
     "total_products": 65,
     "avg_confidence": 78.5
   }
   ```

6. **GET /seasonal** - Get seasonal products
   - Query: `?businessId=xxx`
   - Returns: `StockForecast[]` where `is_seasonal = true`

7. **POST /calculate** - Calculate all forecasts
   - Body: `{ "businessId": "uuid" }`
   - Returns:
   ```json
   {
     "message": "Forecast calculation completed",
     "total_products": 65,
     "successful": 63,
     "failed": 2,
     "results": [...]
   }
   ```

8. **POST /calculate/:id** - Calculate single product forecast
   - Body: `{ "businessId": "uuid" }`
   - Returns: `StockForecast`

## Frontend Component

### Inventory Forecasting Page (`/forecasting`)

#### Tab 1: Overview
**Summary Cards** (4 metrics):
1. Total Products - Count of all forecasted products
2. Low Stock Alerts - Products with ≤7 days until stockout (orange)
3. Increasing Demand - Products with upward trend (green)
4. Seasonal Products - Products with seasonal patterns (purple)

**Trend Distribution Bars**:
- Horizontal bars showing percentage of products in each trend
- Green bar = Increasing
- Gray bar = Stable
- Red bar = Decreasing

**All Forecasts Table**:
- Columns: Product, Current Stock, Avg Daily Sales, 7-Day Demand, 30-Day Demand, Days Until Stockout, Trend Icon, Confidence Bar
- Trend filter: All / Increasing / Decreasing / Stable

#### Tab 2: Low Stock Alerts
**Filters**: Days threshold (3/7/14/30)

**Alert Cards** (grid layout):
- Product name
- Current stock vs Reorder point
- Suggested order quantity
- Days until stockout (color-coded)
- Urgency badge (CRITICAL/WARNING/CAUTION/OK)
- Trend indicator
- Seasonal badge (if applicable)

**Urgency Colors**:
- CRITICAL: Days ≤ 3 (red border)
- WARNING: Days ≤ 7 (orange border)
- CAUTION: Days ≤ 14 (yellow border)
- OK: Days > 14 (green border)

#### Tab 3: Reorder Suggestions
**Table Layout**:
- Product Name
- Current Stock
- Reorder Point
- Suggested Order Qty (bold, large)
- Days Until Stockout (color-coded)
- Urgency Badge
- Action Button

**Urgency Levels**:
- **CRITICAL**: Days ≤ 3 (red badge)
- **HIGH**: Days ≤ 7 (orange badge)
- **MEDIUM**: Days > 7 (blue badge)
- **LOW**: Well-stocked (green badge)

#### Tab 4: Trends
**Two-Column Layout**:

**Left: Increasing Demand** (green section)
- List of products with upward trend
- Shows avg daily sales
- Percentage change indicator

**Right: Decreasing Demand** (red section)
- List of products with downward trend
- Shows avg daily sales
- Percentage drop indicator

#### Tab 5: Seasonal
**Grid of Seasonal Product Cards**:
- Purple accent border
- Product name
- Avg daily sales
- 30-day forecast
- Current stock
- Seasonal icon (🌺)

### Component Features

**TypeScript** (240 lines):
```typescript
export class InventoryForecastingComponent {
  forecasts: any[] = [];
  reorderSuggestions: any[] = [];
  lowStockAlerts: any[] = [];
  seasonalProducts: any[] = [];
  trendAnalysis: any = null;
  
  filterDays: number = 7; // For low stock alerts
  filterTrend: string = 'all'; // For overview table
  
  ngOnInit() {
    this.loadForecasts();
    this.loadReorderSuggestions();
    this.loadLowStockAlerts();
    this.loadSeasonalProducts();
    this.loadTrendAnalysis();
  }
  
  getTrendIcon(trend: string): string {
    return trend === 'increasing' ? '📈' : trend === 'decreasing' ? '📉' : '➡️';
  }
  
  getUrgencyClass(days: number): string {
    if (days <= 3) return 'critical';
    if (days <= 7) return 'high';
    return 'medium';
  }
}
```

**SCSS** (900 lines):
- Tab navigation system
- Summary cards with hover effects
- Trend bars with gradient fills
- Alert cards with urgency-based styling
- Confidence progress bars
- Responsive grid layouts
- Mobile breakpoints (<768px)

## Use Cases

### 1. Preventing Stockouts
**Scenario**: Product approaching zero inventory

**System Action**:
1. Calculates days until stockout: 4 days
2. Generates CRITICAL alert
3. Suggests order quantity: 300 units
4. Displays in Low Stock Alerts tab
5. Manager orders before stockout occurs

### 2. Seasonal Planning
**Scenario**: Christmas decorations sold only Nov-Dec

**System Action**:
1. Detects seasonality: Sales on <30% of days
2. Flags as seasonal product
3. Increases confidence during peak season
4. Adjusts forecasts based on historical patterns
5. Suggests pre-season stocking

### 3. Trend-Based Ordering
**Scenario**: New product gaining popularity

**System Action**:
1. Compares recent 30 days vs previous 30 days
2. Detects 150% sales increase
3. Classifies as "increasing" trend
4. Applies 1.2x multiplier to forecast
5. Suggests larger order quantity
6. Prevents missed sales opportunities

### 4. Overstocking Prevention
**Scenario**: Product demand declining

**System Action**:
1. Detects decreasing trend (60% of previous sales)
2. Applies 0.8x multiplier to forecast
3. Reduces suggested order quantity
4. Prevents excess inventory
5. Improves cash flow

## Integration Points

### 1. Product Module
```typescript
// Link forecasts to products
const forecast = await forecastingService.getProductForecast(businessId, productId);
productDetails.forecast = {
  daysUntilStockout: forecast.days_until_stockout,
  suggestedOrder: forecast.suggested_order_qty,
  trend: forecast.trend
};
```

### 2. Sales Module
```typescript
// Update forecasts after each sale
@OnEvent('sale.completed')
async handleSaleCompleted(sale: SaleInvoice) {
  for (const item of sale.items) {
    await forecastingService.calculateProductForecast(sale.business_id, item.product_id);
  }
}
```

### 3. Purchase Orders Module (Future)
```typescript
// Auto-generate purchase orders from suggestions
const suggestions = await forecastingService.getReorderSuggestions(businessId);
for (const suggestion of suggestions.filter(s => s.urgency === 'critical')) {
  await purchaseOrderService.create({
    productId: suggestion.product_id,
    quantity: suggestion.suggested_order_qty,
    reason: 'Auto-generated from forecast'
  });
}
```

### 4. Reports Module
```typescript
// Include forecast data in inventory reports
const report = {
  currentStock: product.stock,
  forecast_7d: forecast.predicted_demand_7d,
  forecast_30d: forecast.predicted_demand_30d,
  stockoutRisk: forecast.days_until_stockout <= 7 ? 'High' : 'Low'
};
```

## Advanced Features

### 1. Confidence Score Interpretation

| Confidence | Data Quality | Recommendation |
|------------|--------------|----------------|
| 90-100%    | Excellent    | High trust, use for automated orders |
| 70-89%     | Good         | Reliable, manual review suggested |
| 50-69%     | Moderate     | Use with caution, supplement with expertise |
| 30-49%     | Low          | Poor data, collect more sales history |
| 0-29%      | Very Low     | Insufficient data, manual forecasting needed |

### 2. Lead Time Customization
Currently assumes 7 days for all products. Future enhancement:

```typescript
// Per-product lead times
const product = await productRepository.findOne({ where: { id: productId } });
const leadTimeDays = product.supplier_lead_time || 7; // Default to 7
const reorderPoint = (avgDailySales * leadTimeDays) + safetyStock;
```

### 3. Safety Stock Strategies

**Current**: Fixed 3 days

**Advanced Options**:
```typescript
// Variable safety stock based on demand volatility
const salesVariance = calculateVariance(salesData);
const safetyFactor = salesVariance > 0.5 ? 5 : 3; // More buffer for volatile products
const safetyStock = avgDailySales * safetyFactor;

// Or service level approach
const serviceLevel = 0.95; // 95% service level
const zScore = 1.65; // Z-score for 95%
const safetyStock = zScore * Math.sqrt(leadTimeDays) * salesStdDev;
```

### 4. Multi-Location Forecasting
```typescript
// Calculate forecasts per location
const locationForecasts = await Promise.all(
  locations.map(loc => 
    forecastingService.calculateProductForecast(businessId, productId, loc.id)
  )
);

// Aggregate for central warehouse
const totalForecast = locationForecasts.reduce((sum, f) => ({
  predicted_30d: sum.predicted_30d + f.predicted_30d,
  suggested_order_qty: sum.suggested_order_qty + f.suggested_order_qty
}), { predicted_30d: 0, suggested_order_qty: 0 });
```

## Performance Optimization

### 1. Batch Calculations
```typescript
// Instead of calculating one by one
async calculateAllForecasts(businessId: string) {
  const products = await productRepository.find({ where: { business_id: businessId } });
  
  // Process in chunks to avoid memory issues
  const chunkSize = 50;
  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    await Promise.all(chunk.map(p => this.calculateProductForecast(businessId, p.id)));
  }
}
```

### 2. Scheduled Background Jobs
```typescript
import { Cron } from '@nestjs/schedule';

@Cron('0 2 * * *') // Daily at 2 AM
async refreshForecasts() {
  const businesses = await businessRepository.find();
  for (const business of businesses) {
    await forecastingService.calculateAllForecasts(business.id);
  }
}
```

### 3. Caching Frequently Accessed Data
```typescript
@Injectable()
export class ForecastingService {
  private cache = new Map<string, { data: any, timestamp: Date }>();
  
  async getProductForecast(businessId: string, productId: string) {
    const cacheKey = `${businessId}_${productId}`;
    const cached = this.cache.get(cacheKey);
    
    // Cache valid for 1 hour
    if (cached && (Date.now() - cached.timestamp.getTime()) < 3600000) {
      return cached.data;
    }
    
    const forecast = await this.forecastRepository.findOne({
      where: { business_id: businessId, product_id: productId }
    });
    
    this.cache.set(cacheKey, { data: forecast, timestamp: new Date() });
    return forecast;
  }
}
```

## Testing

### Unit Tests
```typescript
describe('ForecastingService', () => {
  it('should detect increasing trend', async () => {
    // Mock sales: recent 30 days = 600 units, previous 30 = 400 units
    const forecast = await service.calculateProductForecast(businessId, productId);
    expect(forecast.trend).toBe('increasing');
  });
  
  it('should calculate reorder point correctly', async () => {
    // Mock: avg_daily_sales = 10, lead_time = 7, safety_stock = 3 days
    const forecast = await service.calculateProductForecast(businessId, productId);
    expect(forecast.reorder_point).toBe(100); // (10 * 7) + (10 * 3)
  });
  
  it('should detect seasonality', async () => {
    // Mock: sales on only 20 out of 90 days
    const forecast = await service.calculateProductForecast(businessId, productId);
    expect(forecast.is_seasonal).toBe(true);
  });
});
```

### Integration Tests
```typescript
it('should generate reorder suggestions', async () => {
  const response = await request(app.getHttpServer())
    .get('/forecasting/reorder-suggestions')
    .query({ businessId })
    .expect(200);
    
  expect(response.body).toBeInstanceOf(Array);
  expect(response.body[0]).toHaveProperty('urgency');
});
```

## Monitoring & Alerts

### 1. Forecast Accuracy Tracking
```typescript
// Compare predicted vs actual sales
async measureAccuracy(businessId: string, productId: string) {
  const forecast = await forecastRepository.findOne({
    where: { business_id: businessId, product_id: productId }
  });
  
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  
  // Wait 7 days, then compare
  const actualSales = await getActualSales(productId, forecast.calculated_at, sevenDaysLater);
  const accuracy = 1 - Math.abs(actualSales - forecast.predicted_demand_7d) / forecast.predicted_demand_7d;
  
  return { accuracy: accuracy * 100 }; // Percentage
}
```

### 2. Critical Alerts
```typescript
// Send notifications for critical stockouts
const criticalProducts = await forecastingService.getLowStockAlerts(businessId, 3);
for (const product of criticalProducts) {
  await notificationService.send({
    type: 'critical_stockout',
    message: `${product.name} will run out in ${product.days_until_stockout} days`,
    urgency: 'high'
  });
}
```

## Business Value

1. **Reduced Stockouts**: Prevent lost sales by proactive reordering
2. **Lower Holding Costs**: Avoid overstocking with accurate forecasts
3. **Improved Cash Flow**: Order optimal quantities, not excess
4. **Time Savings**: Automate inventory planning decisions
5. **Data-Driven Decisions**: Replace gut feelings with analytics
6. **Seasonal Preparedness**: Plan ahead for demand fluctuations
7. **Supplier Relationships**: Provide accurate order forecasts

## Future Enhancements

1. **Machine Learning Models**: ARIMA, LSTM for advanced forecasting
2. **External Factors**: Weather, holidays, promotions impact
3. **Supplier Integration**: Auto-send POs to suppliers
4. **Multi-SKU Bundling**: Forecast for product combinations
5. **Price Elasticity**: Adjust forecasts based on price changes
6. **Competitor Analysis**: Factor in market trends
7. **Historical Comparison**: Year-over-year demand patterns
8. **What-If Scenarios**: Simulate promotion or pricing changes
