import {HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {ApiResourceEnum} from './api-resource.enum';
import {runtimeConfig} from '../../../services/runtime-config';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  private readonly _resource: ApiResourceEnum;

  constructor(resource: ApiResourceEnum) {
    this._resource = resource;
  }

  static get baseUrl(): string {
    const api = runtimeConfig.api || environment.api;
    const hostname: string = api.protocol + '://' + api.hostname;
    const port: string = api.port ? `:${api.port}` : '';
    const context: string = api.context ? `/${api.context}` : '';

    return hostname + port + context;
  }

  static get baseHttpOptions(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
    };
  }

  protected _getUrl(id?: string): string {
    if (id)
      return `${RequestService.baseUrl}/${this._resource}/${id}`;
    else
      return `${RequestService.baseUrl}/${this._resource}`;
  }
}
