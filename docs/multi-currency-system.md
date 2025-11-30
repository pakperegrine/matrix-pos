# Multi-Currency System

## Overview
The Multi-Currency System enables businesses to operate with multiple currencies, manage exchange rates, and perform real-time currency conversions. The system supports a base currency concept where all conversions are calculated relative to a designated base currency.

## Features

### 1. Currency Management
- **CRUD Operations**: Create, read, update, and delete currencies
- **Base Currency**: Designate one currency as the base (exchange_rate = 1.0)
- **Active/Inactive Status**: Enable or disable currencies without deletion
- **Exchange Rate Tracking**: Store and update exchange rates with timestamps

### 2. Currency Converter
- **Real-time Conversion**: Convert amounts between any two currencies
- **Cross-Currency Support**: Converts via base currency intermediary
- **Visual Calculator**: User-friendly interface with amount and currency selectors

### 3. Exchange Rate Management
- **Manual Updates**: Edit exchange rates for any currency
- **Bulk Refresh**: Refresh all exchange rates at once
- **Rate History**: Track when rates were last updated (`rate_updated_at`)
- **Mock API Integration**: Production-ready structure for external API integration

## Database Schema

### Currency Entity (`currencies` table)
```typescript
{
  id: string (UUID)
  business_id: string (multi-tenant support)
  code: string (3-letter ISO code: USD, EUR, GBP, etc.)
  name: string (display name)
  symbol: string (currency symbol: $, €, £, etc.)
  exchange_rate: decimal (rate relative to base currency)
  is_base: boolean (true for base currency)
  is_active: boolean (enable/disable without deletion)
  rate_updated_at: datetime (last rate refresh timestamp)
  created_at: datetime
  updated_at: datetime
}
```

**Indexes**: `business_id` for multi-tenant query performance

## API Endpoints

### Base URL: `/currency`

1. **GET /** - Get all currencies
   - Query: `?businessId=xxx`
   - Returns: `Currency[]`

2. **GET /active** - Get only active currencies
   - Query: `?businessId=xxx`
   - Returns: `Currency[]`

3. **GET /base** - Get the base currency
   - Query: `?businessId=xxx`
   - Returns: `Currency`

4. **POST /** - Create new currency
   ```json
   {
     "businessId": "uuid",
     "code": "EUR",
     "name": "Euro",
     "symbol": "€",
     "exchange_rate": 0.92,
     "is_active": true
   }
   ```

5. **PUT /:id** - Update existing currency
   ```json
   {
     "name": "Euro",
     "symbol": "€",
     "exchange_rate": 0.93,
     "is_active": true
   }
   ```

6. **DELETE /:id** - Delete currency
   - Protection: Cannot delete base currency

7. **POST /set-base** - Set a currency as base
   ```json
   {
     "currencyId": "uuid",
     "businessId": "uuid"
   }
   ```
   - Effect: Unsets all other base currencies, sets exchange_rate to 1.0

8. **POST /refresh-rates** - Refresh all exchange rates
   ```json
   {
     "businessId": "uuid"
   }
   ```
   - Note: Currently uses mock rates; integrate with external API in production

9. **POST /convert** - Convert amount between currencies
   ```json
   {
     "amount": 100,
     "fromCurrencyId": "uuid",
     "toCurrencyId": "uuid",
     "businessId": "uuid"
   }
   ```
   - Returns:
   ```json
   {
     "amount": 100,
     "fromCurrency": "USD",
     "toCurrency": "EUR",
     "convertedAmount": 92,
     "exchangeRate": 0.92
   }
   ```

## Conversion Logic

All conversions use a **two-step process** via the base currency:

1. **Convert to base**: `amountInBase = amount / fromCurrency.exchange_rate`
2. **Convert to target**: `result = amountInBase * toCurrency.exchange_rate`

**Example**: Convert 100 EUR to GBP (base = USD)
- EUR exchange_rate = 0.92 (1 EUR = 0.92 USD)
- GBP exchange_rate = 0.79 (1 GBP = 0.79 USD)
- Step 1: 100 EUR = 100 / 0.92 = 108.70 USD
- Step 2: 108.70 USD × 0.79 = 85.87 GBP

## Default Currencies

The system initializes with 10 default currencies:

| Code | Name                  | Symbol | Exchange Rate (to USD) |
|------|-----------------------|--------|------------------------|
| USD  | US Dollar             | $      | 1.0000 (base)          |
| EUR  | Euro                  | €      | 0.9200                 |
| GBP  | British Pound         | £      | 0.7900                 |
| JPY  | Japanese Yen          | ¥      | 149.5000               |
| CAD  | Canadian Dollar       | C$     | 1.3600                 |
| AUD  | Australian Dollar     | A$     | 1.5300                 |
| CHF  | Swiss Franc           | CHF    | 0.8800                 |
| CNY  | Chinese Yuan          | ¥      | 7.2400                 |
| INR  | Indian Rupee          | ₹      | 83.1200                |
| MXN  | Mexican Peso          | MX$    | 17.0800                |

## Frontend Component

### Currency Settings Page (`/currency`)

**Layout**:
1. **Currency Converter Panel**
   - Amount input field
   - From currency selector
   - To currency selector
   - Convert button
   - Result display with exchange rate

2. **Base Currency Card**
   - Gold gradient background
   - Displays current base currency
   - Star icon (⭐) badge

3. **Currency Grid**
   - Card-based layout (responsive grid)
   - Each card shows:
     - Large symbol
     - Currency code
     - Full name
     - Exchange rate
     - Badges (BASE/ACTIVE/INACTIVE)
   - Actions: Edit (✏️), Set as Base (⭐), Delete (🗑️)

4. **Add/Edit Modal**
   - Form fields: code, name, symbol, exchange_rate, is_active
   - Code field: uppercase, disabled when editing
   - Validation and error handling

**Styling Features**:
- Purple gradient converter panel
- Gold gradient for base currency
- Card hover effects (lift animation)
- Color-coded badges (gold/green/red)
- Responsive design (mobile-friendly)
- Modal overlay with backdrop

## Usage Examples

### 1. Adding a New Currency
```typescript
// Backend
POST /currency
{
  "businessId": "biz123",
  "code": "SEK",
  "name": "Swedish Krona",
  "symbol": "kr",
  "exchange_rate": 10.75,
  "is_active": true
}
```

### 2. Converting Currency
```typescript
// Frontend
this.http.post('/currency/convert', {
  amount: 250,
  fromCurrencyId: eurId,
  toCurrencyId: gbpId,
  businessId: this.businessId
}).subscribe(result => {
  console.log(`${result.amount} ${result.fromCurrency} = ${result.convertedAmount} ${result.toCurrency}`);
  // Output: "250 EUR = 214.67 GBP"
});
```

### 3. Setting Base Currency
```typescript
// Change base from USD to EUR
POST /currency/set-base
{
  "currencyId": eurId,
  "businessId": "biz123"
}
// All exchange rates will be recalculated relative to EUR
```

## Integration Points

### 1. Sales Module Integration
- Display prices in multiple currencies
- Convert invoice totals to customer's preferred currency
- Store original and converted amounts

### 2. Product Module Integration
- Set product prices in multiple currencies
- Automatic price conversion based on exchange rates
- Currency-specific pricing strategies

### 3. Reports Module Integration
- Generate reports in any currency
- Multi-currency revenue summaries
- Currency conversion tracking

## Production Considerations

### 1. External Exchange Rate API
Replace mock rates with real-time data:

```typescript
// In currency.service.ts refreshExchangeRates()
async refreshExchangeRates(businessId: string): Promise<Currency[]> {
  const baseCurrency = await this.findBaseCurrency(businessId);
  
  // Call external API (e.g., exchangerate-api.com, fixer.io)
  const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency.code}`);
  const data = await response.json();
  
  // Update currencies with real rates
  for (const currency of allCurrencies) {
    if (currency.code !== baseCurrency.code) {
      currency.exchange_rate = data.rates[currency.code];
      currency.rate_updated_at = new Date();
      await this.currencyRepository.save(currency);
    }
  }
  
  return allCurrencies;
}
```

### 2. Scheduled Rate Updates
Implement automated rate refreshes:

```typescript
// In app.module.ts or separate cron service
import { ScheduleModule } from '@nestjs/schedule';

@Cron('0 0 * * *') // Daily at midnight
async refreshAllCurrencies() {
  const businesses = await this.businessRepository.find();
  for (const business of businesses) {
    await this.currencyService.refreshExchangeRates(business.id);
  }
}
```

### 3. Caching Strategy
Cache exchange rates to reduce API calls:

```typescript
// Use Redis or in-memory cache
@Injectable()
export class CurrencyService {
  private rateCache = new Map<string, { rate: number, timestamp: Date }>();
  
  async getCachedRate(fromCode: string, toCode: string): Promise<number> {
    const cacheKey = `${fromCode}_${toCode}`;
    const cached = this.rateCache.get(cacheKey);
    
    // Cache valid for 1 hour
    if (cached && (Date.now() - cached.timestamp.getTime()) < 3600000) {
      return cached.rate;
    }
    
    // Fetch and cache new rate
    const rate = await this.fetchRate(fromCode, toCode);
    this.rateCache.set(cacheKey, { rate, timestamp: new Date() });
    return rate;
  }
}
```

### 4. Currency Precision
Handle decimal precision for different currencies:

```typescript
const currencyPrecision = {
  'JPY': 0, // No decimal places
  'BHD': 3, // 3 decimal places
  'default': 2 // Most currencies
};

function formatCurrency(amount: number, currencyCode: string): string {
  const precision = currencyPrecision[currencyCode] || currencyPrecision.default;
  return amount.toFixed(precision);
}
```

## Security

1. **Business Isolation**: All queries filtered by `business_id`
2. **Base Currency Protection**: Cannot delete base currency
3. **Validation**: Currency codes must be 3 letters, rates must be positive
4. **Audit Trail**: Track `rate_updated_at` for compliance

## Performance

- **Indexed Queries**: `business_id` index for fast multi-tenant queries
- **Conversion Caching**: Consider caching frequently used conversion rates
- **Batch Operations**: Refresh rates in bulk, not individually

## Testing

### Unit Tests
```typescript
describe('CurrencyService', () => {
  it('should convert EUR to GBP via USD base', async () => {
    const result = await service.convert(100, eurId, gbpId, businessId);
    expect(result.convertedAmount).toBeCloseTo(85.87, 2);
  });
  
  it('should set new base currency', async () => {
    await service.setBaseCurrency(eurId, businessId);
    const base = await service.findBaseCurrency(businessId);
    expect(base.code).toBe('EUR');
    expect(base.exchange_rate).toBe(1);
  });
});
```

### Integration Tests
```typescript
it('should refresh exchange rates', async () => {
  const response = await request(app.getHttpServer())
    .post('/currency/refresh-rates')
    .send({ businessId })
    .expect(200);
    
  expect(response.body.message).toContain('refreshed');
});
```

## Future Enhancements

1. **Multi-Base Currency**: Support different base currencies per location
2. **Historical Rates**: Store rate history for trend analysis
3. **Currency Forecasting**: Predict rate movements using ML
4. **Crypto Support**: Add cryptocurrency conversions
5. **Offline Mode**: Cache rates for offline POS operation
6. **Rate Alerts**: Notify when rates exceed thresholds
7. **Custom Rates**: Override automatic rates for specific products/customers
