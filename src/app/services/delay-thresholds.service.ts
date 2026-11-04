import { Injectable } from '@angular/core';
import { AppSettingsService } from './app-settings.service';

export interface DelayThresholds {
  warning: number;  // Soglia gialla (minuti)
  danger: number;   // Soglia rossa (minuti)
}

@Injectable({
  providedIn: 'root'
})
export class DelayThresholdsService {
  private readonly DEFAULT_THRESHOLDS: DelayThresholds = {
    warning: 10,
    danger: 20
  };

  private _thresholds: DelayThresholds;

  constructor(private _appSettings: AppSettingsService) {
    this._thresholds = this._load();
  }

  getThresholds(): DelayThresholds {
    return { ...this._thresholds };
  }

  setThresholds(thresholds: DelayThresholds): void {
    this._thresholds = { ...thresholds };
    this._save();
  }

  getSeverity(delayMinutes: number): 'success' | 'warning' | 'danger' {
    if (delayMinutes < this._thresholds.warning) {
      return 'success';
    } else if (delayMinutes < this._thresholds.danger) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  private _load(): DelayThresholds {
    const saved = this._appSettings.settings.delayThresholds;
    return saved ? { ...saved } : { ...this.DEFAULT_THRESHOLDS };
  }

  private _save(): void {
    this._appSettings.update({ delayThresholds: { ...this._thresholds } });
  }

  resetToDefaults(): void {
    this._thresholds = { ...this.DEFAULT_THRESHOLDS };
    this._save();
  }
}
