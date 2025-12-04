import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from '../services/settings.service';

@Pipe({
  name: 'customCurrency',
  standalone: false
})
export class CustomCurrencyPipe implements PipeTransform {
  constructor(private settingsService: SettingsService) {}

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return this.settingsService.formatCurrency(0);
    }
    return this.settingsService.formatCurrency(value);
  }
}
