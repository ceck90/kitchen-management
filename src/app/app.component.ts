import {Component, OnDestroy, OnInit} from '@angular/core';
import {PrimeNGConfig} from "primeng/api";
import {WebSocketService} from './services/web-socket-service';
import {ThemeService} from './services/theme.service';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <div id="app-container-id" [class]="showNavbar ? 'app-container' : 'app-container-full'">
      <router-outlet></router-outlet>
    </div>
    <navbar id="navbar-id" *ngIf="showNavbar"></navbar>
  `,
  styles: [`
    .app-container {
      min-height: calc(100vh - 70px);
      padding-bottom: 70px;
      overflow-y: auto;
      background: var(--theme-background);
      transition: background-color 0.3s ease;
    }

    .app-container-full {
      min-height: 100vh;
      padding-bottom: 0;
      overflow-y: auto;
      background: var(--theme-background);
      transition: background-color 0.3s ease;
    }

    @media (max-width: 992px) {
      .app-container {
        min-height: calc(100vh - 65px);
        padding-bottom: 65px;
      }
    }

    @media (max-width: 768px) {
      .app-container {
        min-height: calc(100vh - 60px);
        padding-bottom: 60px;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {

  public showNavbar: boolean = true;

  private _subs: Subscription = new Subscription();

  constructor(private _primengConfig: PrimeNGConfig,
              private _webSocketService: WebSocketService,
              private _themeService: ThemeService,
              private _router: Router) {
    this._primengConfig.ripple = true;
    // ThemeService automatically applies saved theme on construction
  }

  public ngOnInit(): void {
    this._webSocketService.connect();

    this._subs.add(
      this._router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          let route = this._router.routerState.snapshot.root;
          while (route.firstChild) {
            route = route.firstChild;
          }
          this.showNavbar = !route.data?.['hideNavbar'];
        })
    );
  }

  public ngOnDestroy(): void {
    this._webSocketService.disconnect();
    this._subs.unsubscribe();
  }
}
