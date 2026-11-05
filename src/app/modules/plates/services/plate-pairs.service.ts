import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppSettingsService } from '../../../services/app-settings.service';

export interface PlatePair {
  id: string;
  name: string;
  plateId1: string;
  plateId2: string;
  plateName1?: string;
  plateName2?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlatePairsService {
  private _pairs$ = new BehaviorSubject<PlatePair[]>([]);

  constructor(private _appSettings: AppSettingsService) {
    this._pairs$.next(this._appSettings.settings.platePairs || []);
  }

  public get pairs$(): Observable<PlatePair[]> {
    return this._pairs$.asObservable();
  }

  public getPairs(): PlatePair[] {
    return this._pairs$.value;
  }

  public addPair(pair: Omit<PlatePair, 'id'>): void {
    const newPair: PlatePair = {
      ...pair,
      id: this._generateId()
    };
    
    const pairs = [...this._pairs$.value, newPair];
    this._savePairs(pairs);
  }

  public updatePair(id: string, updates: Partial<PlatePair>): void {
    const pairs = this._pairs$.value.map(pair =>
      pair.id === id ? { ...pair, ...updates } : pair
    );
    this._savePairs(pairs);
  }

  public deletePair(id: string): void {
    const pairs = this._pairs$.value.filter(pair => pair.id !== id);
    this._savePairs(pairs);
  }

  public getPairById(id: string): PlatePair | undefined {
    return this._pairs$.value.find(pair => pair.id === id);
  }

  private _savePairs(pairs: PlatePair[]): void {
    this._appSettings.update({ platePairs: pairs });
    this._pairs$.next(pairs);
  }

  private _generateId(): string {
    return `pair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
