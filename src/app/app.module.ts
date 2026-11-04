import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ApiConnector} from "./services/api-connector";
import {environment} from "../environments/environment";
import {FileSystemConnectorService} from "./services/file-system-connector.service";
import {HttpRestConnectorService} from "./services/http-rest-connector.service";
import {SharedModule} from "./modules/shared/shared.module";
import {I18nService} from "./services/i18n.service";
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {WebSocketService} from './services/web-socket-service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

@NgModule({ declarations: [
        AppComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        SharedModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
            // Register the ServiceWorker as soon as the application is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: 'registerWhenStable:30000'
        })], providers: [
        I18nService,
        {
            provide: 'ApiConnector',
            useClass: environment.connector === "fs" ? FileSystemConnectorService : HttpRestConnectorService
        },
        WebSocketService,
        provideHttpClient(withInterceptorsFromDi()),
        providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    // segue il tema scelto nell'app (ThemeService) e non quello del sistema operativo
                    darkModeSelector: 'body.dark-theme'
                }
            },
            ripple: true
        })
    ] })
export class AppModule {
}
