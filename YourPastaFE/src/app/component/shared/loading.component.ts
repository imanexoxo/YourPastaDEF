import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="loading-overlay" [class.fullscreen]="fullscreen">
      <div class="loading-content">
        <mat-spinner 
          [diameter]="size" 
          [color]="color"
          *ngIf="tipo === 'spinner'">
        </mat-spinner>
        
        <div *ngIf="tipo === 'dots'" class="dots-loader">
          <div class="dot" [style.background-color]="getColor()"></div>
          <div class="dot" [style.background-color]="getColor()"></div>
          <div class="dot" [style.background-color]="getColor()"></div>
        </div>
        
        <div *ngIf="tipo === 'pulse'" class="pulse-loader">
          <div class="pulse" [style.background-color]="getColor()"></div>
        </div>
        
        <div *ngIf="messaggio" class="loading-message">
          {{ messaggio }}
        </div>
        
        <div *ngIf="suggerimento" class="loading-tip">
          {{ suggerimento }}
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent {
  @Input() tipo: 'spinner' | 'dots' | 'pulse' = 'spinner';
  @Input() size = 40;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() messaggio = '';
  @Input() suggerimento = '';
  @Input() fullscreen = false;

  getColor(): string {
    switch (this.color) {
      case 'primary': return '#1976d2';
      case 'accent': return '#ff4081';
      case 'warn': return '#f44336';
      default: return '#1976d2';
    }
  }
}
