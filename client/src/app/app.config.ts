import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

// Tắt autoConnect để tránh treo SSR
const config: SocketIoConfig = {
  url: 'http://localhost:3000',
  options: { autoConnect: false }
};

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(SocketIoModule.forRoot(config))
  ]
};