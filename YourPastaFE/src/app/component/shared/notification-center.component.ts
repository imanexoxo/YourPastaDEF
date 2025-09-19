import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService, Notifica } from '../../service/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatBadgeModule,
    MatMenuModule,
    MatTooltipModule
  ],
  template: `
    <div class="notification-center">
      <button 
        mat-icon-button
        [matMenuTriggerFor]="notificheMenu"
        [matBadge]="notifiche.length"
        [matBadgeHidden]="notifiche.length === 0"
        matBadgeColor="warn">
        <mat-icon>notifications</mat-icon>
      </button>

      <mat-menu #notificheMenu="matMenu" class="notification-menu">
        <div class="notification-header" mat-menu-item disabled>
          <h3>Notifiche</h3>
          <button 
            mat-icon-button
            (click)="pulisciTutte()"
            *ngIf="notifiche.length > 0"
            matTooltip="Pulisci tutte">
            <mat-icon>clear_all</mat-icon>
          </button>
        </div>

        <div *ngIf="notifiche.length === 0" class="no-notifications" mat-menu-item disabled>
          <mat-icon>notifications_none</mat-icon>
          <span>Nessuna notifica</span>
        </div>

        <div *ngFor="let notifica of notifiche" class="notification-item" mat-menu-item>
          <div class="notification-content" [class]="'notifica-' + notifica.tipo">
            <div class="notification-icon">
              <mat-icon>{{ getIcona(notifica.tipo) }}</mat-icon>
            </div>
            
            <div class="notification-text">
              <div class="notification-title">{{ notifica.titolo }}</div>
              <div class="notification-message">{{ notifica.messaggio }}</div>
              <div class="notification-time">{{ formatTime(notifica.timestamp) }}</div>
            </div>
            
            <div class="notification-actions">
              <button 
                *ngIf="notifica.azione"
                mat-icon-button
                (click)="eseguiAzione(notifica)"
                [matTooltip]="notifica.azione.testo">
                <mat-icon>play_arrow</mat-icon>
              </button>
              
              <button 
                mat-icon-button
                (click)="rimuoviNotifica(notifica.id)"
                matTooltip="Rimuovi">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </mat-menu>
    </div>
  `,
  styleUrls: ['./notification-center.component.css']
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  
  notifiche: Notifica[] = [];
  private subscription?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.getNotifiche().subscribe(
      notifiche => this.notifiche = notifiche
    );
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  getIcona(tipo: string): string {
    switch (tipo) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'notifications';
    }
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minuti = Math.floor(diff / 60000);
    
    if (minuti < 1) return 'Ora';
    if (minuti < 60) return `${minuti}m fa`;
    
    const ore = Math.floor(minuti / 60);
    if (ore < 24) return `${ore}h fa`;
    
    return timestamp.toLocaleDateString();
  }

  rimuoviNotifica(id: string) {
    this.notificationService.rimuoviNotifica(id);
  }

  pulisciTutte() {
    this.notificationService.pulisciTutte();
  }

  eseguiAzione(notifica: Notifica) {
    notifica.azione?.callback();
    this.rimuoviNotifica(notifica.id);
  }
}
