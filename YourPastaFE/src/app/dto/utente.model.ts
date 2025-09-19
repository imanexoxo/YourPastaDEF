export interface Utente {
  id?: number;
  nome: string;
  cognome: string;
  username: string;
  password: string;
  email: string;
  dataNascita: string;
  ruolo: 'admin' | 'cliente' | 'studente' | 'cuoco' | 'cameriere';
  punti?: number;
  bloccato?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}
