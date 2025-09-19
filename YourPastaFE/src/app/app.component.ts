import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { SessionService } from './service/session.service';
import { CarrelloService } from './service/carrello.service';
import { Utente } from './dto/utente.model';
import { NotificationCenterComponent } from './component/shared/notification-center.component';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule,
    NotificationCenterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'YourPasta';
  sessionService = inject(SessionService);
  carrelloService = inject(CarrelloService);
  router = inject(Router);

  utenteLoggato: Utente | null = null;
  menuAperto = false;
  currentRoute = '';
  private routerSubscription?: Subscription;

  constructor() {
    this.sessionService.utenteLoggato$.subscribe(utente => {
      this.utenteLoggato = utente;
    });
  }

  ngOnInit() {
    // Chiudi il menu quando si naviga e traccia la route corrente
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.closeMenu();
        this.currentRoute = event.urlAfterRedirects;
      });

    // Imposta la route iniziale
    this.currentRoute = this.router.url;
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  logout() {
    this.sessionService.clearLoggedUser();
    this.closeMenu();
    this.router.navigate(['/home']);
  }

  toggleMenu() {
    this.menuAperto = !this.menuAperto;
  }

  closeMenu() {
    this.menuAperto = false;
  }

  getRuolo(): string {
    return this.utenteLoggato?.ruolo || '';
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString();
  }

  // Verifica se siamo nella home page
  isHomePage(): boolean {
    return this.currentRoute === '/home' || this.currentRoute === '/';
  }

  // Ottiene il numero totale di articoli nel carrello
  getTotalItemsCarrello(): number {
    return this.carrelloService.getNumeroTotaleItem();
  }
}