import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Engineer {
  id: number;
  nom: string;
  photo: string | null;
  domaine: string;
  ville: string;
  experience: string;
  competences: string[];
  linkedin: string | null;
}

export interface AdminEngineer extends Engineer {
  email: string;
  telephone: string | null;
  consentement: boolean;
  statut: 'en_attente' | 'approuve' | 'refuse';
  date_inscription: string;
  diplome: string | null;
}

export interface Company { id: number; nom: string; secteur: string; ville: string; site_web: string; logo: string | null; }
export interface Stats { ingenieurs: number; domaines: number; entreprises: number; }
export interface Meta { domaines: string[]; experiences: string[]; }
export interface Counts { en_attente: number; approuve: number; refuse: number; }

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  meta() { return this.http.get<Meta>('/api/meta'); }
  stats() { return this.http.get<Stats>('/api/stats'); }

  engineers(opts: { q?: string; domaine?: string; ville?: string; limit?: number } = {}): Observable<Engineer[]> {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(opts)) if (v) params = params.set(k, String(v));
    return this.http.get<Engineer[]>('/api/engineers', { params });
  }
  villes() { return this.http.get<string[]>('/api/engineers/villes'); }
  engineer(id: number) { return this.http.get<Engineer>(`/api/engineers/${id}`); }
  contact(id: number) { return this.http.post<{ email: string; telephone: string | null }>(`/api/engineers/${id}/contact`, {}); }

  companies(secteur?: string) {
    let params = new HttpParams();
    if (secteur) params = params.set('secteur', secteur);
    return this.http.get<Company[]>('/api/companies', { params });
  }
  secteurs() { return this.http.get<string[]>('/api/companies/secteurs'); }

  register(form: FormData) { return this.http.post<{ ok: boolean; message: string }>('/api/register', form); }

  // Admin
  adminMe() { return this.http.get<{ admin: boolean }>('/api/admin/me'); }
  adminLogin(identifiant: string, motDePasse: string) { return this.http.post<{ ok: boolean }>('/api/admin/login', { identifiant, motDePasse }); }
  adminLogout() { return this.http.post<{ ok: boolean }>('/api/admin/logout', {}); }
  adminList(statut: string) { return this.http.get<AdminEngineer[]>('/api/admin/engineers', { params: { statut } }); }
  adminCounts() { return this.http.get<Counts>('/api/admin/counts'); }
  adminApprove(id: number) { return this.http.post(`/api/admin/engineers/${id}/approve`, {}); }
  adminReject(id: number) { return this.http.post(`/api/admin/engineers/${id}/reject`, {}); }
  adminDelete(id: number) { return this.http.delete(`/api/admin/engineers/${id}`); }
}
