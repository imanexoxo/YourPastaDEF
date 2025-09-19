import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Inventario } from '../../dto/inventario.model';

@Component({
  selector: 'app-modifica-prodotto-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>edit</mat-icon>
      Modifica Prodotto: {{ data.prodotto.nome }}
    </h2>

    <form [formGroup]="prodottoForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="dialog-content">
        
        <!-- ID (read-only) -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>ID Prodotto</mat-label>
          <input matInput 
                 [value]="data.prodotto.id" 
                 readonly
                 disabled>
        </mat-form-field>

        <!-- Nome prodotto -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome Prodotto</mat-label>
          <input matInput 
                 formControlName="nome" 
                 placeholder="Es. Pomodoro fresco"
                 required>
          <mat-error *ngIf="prodottoForm.get('nome')?.invalid && prodottoForm.get('nome')?.touched">
            Il nome è obbligatorio
          </mat-error>
        </mat-form-field>

        <!-- Categoria -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Categoria</mat-label>
          <mat-select formControlName="categoria" required>
            <mat-option value="pasta">Pasta</mat-option>
            <mat-option value="condimento_pronto">Condimento Pronto</mat-option>
            <mat-option value="condimento_base">Condimento Base</mat-option>
            <mat-option value="proteine">Proteine</mat-option>
            <mat-option value="ingrediente_base">Verdure e Formaggi</mat-option>
            <mat-option value="topping">Topping</mat-option>
            <mat-option value="bevande">Bevande</mat-option>
          </mat-select>
          <mat-error *ngIf="prodottoForm.get('categoria')?.invalid && prodottoForm.get('categoria')?.touched">
            La categoria è obbligatoria
          </mat-error>
        </mat-form-field>

        <div class="form-row">
          <!-- Quantità -->
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Quantità</mat-label>
            <input matInput 
                   type="number" 
                   formControlName="quantita"
                   min="0"
                   placeholder="0"
                   required>
            <mat-error *ngIf="prodottoForm.get('quantita')?.invalid && prodottoForm.get('quantita')?.touched">
              La quantità deve essere un numero positivo
            </mat-error>
          </mat-form-field>

          <!-- Prezzo unitario -->
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Prezzo Unitario (€)</mat-label>
            <input matInput 
                   type="number" 
                   formControlName="prezzoUnitario"
                   step="0.01"
                   min="0"
                   placeholder="0.00"
                   required>
            <mat-error *ngIf="prodottoForm.get('prezzoUnitario')?.invalid && prodottoForm.get('prezzoUnitario')?.touched">
              Il prezzo deve essere un numero positivo
            </mat-error>
          </mat-form-field>
        </div>

        <!-- Informazioni sulla modifica -->
        <div class="info-section">
          <mat-icon>info</mat-icon>
          <span>Le modifiche saranno salvate immediatamente nel database.</span>
        </div>

      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button type="button" (click)="onCancel()">
          <mat-icon>cancel</mat-icon>
          Annulla
        </button>
        <button mat-raised-button 
                color="primary" 
                type="submit"
                [disabled]="prodottoForm.invalid || !isFormChanged()"
                class="save-button">
          <mat-icon>save</mat-icon>
          Salva Modifiche
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .dialog-content {
      min-width: 400px;
      padding: 20px 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .half-width {
      flex: 1;
    }

    .dialog-actions {
      padding: 16px 0;
      gap: 8px;
    }

    .save-button {
      margin-left: 8px;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      color: #1976d2;
      font-size: 1.3rem;
    }

    .info-section {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: #e3f2fd;
      border-radius: 4px;
      margin-top: 16px;
      font-size: 14px;
      color: #1565c0;
    }

    .info-section mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    mat-error {
      font-size: 12px;
    }
  `]
})
export class ModificaProdottoDialogComponent implements OnInit {
  prodottoForm: FormGroup;
  valoriOriginali: Inventario;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ModificaProdottoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { prodotto: Inventario }
  ) {
    this.valoriOriginali = { ...data.prodotto };
    
    this.prodottoForm = this.fb.group({
      nome: [data.prodotto.nome, [Validators.required, Validators.minLength(2)]],
      categoria: [data.prodotto.categoria, Validators.required],
      quantita: [data.prodotto.quantita, [Validators.required, Validators.min(0)]],
      prezzoUnitario: [data.prodotto.prezzoUnitario, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    // Il form è già precompilato nel costruttore
  }

  isFormChanged(): boolean {
    const valoriAttuali = this.prodottoForm.value;
    return (
      valoriAttuali.nome !== this.valoriOriginali.nome ||
      valoriAttuali.categoria !== this.valoriOriginali.categoria ||
      valoriAttuali.quantita !== this.valoriOriginali.quantita ||
      valoriAttuali.prezzoUnitario !== this.valoriOriginali.prezzoUnitario
    );
  }

  onSubmit(): void {
    if (this.prodottoForm.valid && this.isFormChanged()) {
      const prodottoModificato: Inventario = {
        ...this.data.prodotto,
        nome: this.prodottoForm.value.nome,
        categoria: this.prodottoForm.value.categoria,
        quantita: this.prodottoForm.value.quantita,
        prezzoUnitario: this.prodottoForm.value.prezzoUnitario
      };
      
      this.dialogRef.close(prodottoModificato);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}