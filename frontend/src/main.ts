import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

console.log('Matrix POS Loading - Build Version: ' + new Date().toISOString());

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error('Bootstrap Error:', err));
