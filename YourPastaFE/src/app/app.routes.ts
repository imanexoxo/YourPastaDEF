import { Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { LoginComponent } from './component/session/login.component';
import { SigninComponent } from './component/session/signin.component';
import { InventarioComponent } from './component/inventario/inventario.component';
import { GestioneClientiComponent } from './component/amministratore/gestione-clienti.component';
import { GestionePersonaleComponent } from './component/amministratore/gestione-personale.component';
import { StoricoOrdiniComponent } from './component/cliente/storico-ordini.component';
import { CreaOrdineComponent } from './component/cliente/crea-ordine.component';
import { OrdiniCucinaComponent } from './component/cucina/ordini-cucina.component';
import { GestioneTavoliComponent } from './component/cucina/gestione-tavoli.component';
import { CarrelloComponent } from './component/cliente/carrello.component';
import { CheckoutComponent } from './component/cliente/checkout.component';
import { PiattoComponent } from './component/cliente/piatto.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'inventario', component: InventarioComponent },
  { path: 'inventario/:categoria', component: InventarioComponent },
  { path: 'gestione-clienti', component: GestioneClientiComponent },
  { path: 'gestione-personale', component: GestionePersonaleComponent },
  { path: 'storico-ordini', component: StoricoOrdiniComponent },
  { path: 'crea-ordine', component: CreaOrdineComponent },
  { path: 'ordini-cucina', component: OrdiniCucinaComponent },
  { path: 'gestione-tavoli', component: GestioneTavoliComponent },
  { path: 'carrello', component: CarrelloComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'miei-piatti', component: PiattoComponent },
  { path: 'tutti-piatti', component: PiattoComponent },
  { path: 'piatti-altri-utenti', component: PiattoComponent }
];

