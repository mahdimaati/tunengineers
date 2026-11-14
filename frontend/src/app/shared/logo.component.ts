import { Component, input } from '@angular/core';

/** Logo TunEngineers (téléphone + loupe). `badge` : pastille blanche pour les fonds sombres. */
@Component({
  selector: 'app-logo',
  template: `<span class="logo-mark" [class.badge]="badge()" [style.width.px]="size()" [style.height.px]="size()">
    <img src="media/logo.png" alt="" [attr.width]="size()" [attr.height]="size()" />
  </span>`,
  styles: [`
    :host { display: inline-flex; line-height: 0; flex: none; }
    .logo-mark { display: inline-grid; place-items: center; }
    .logo-mark img { width: 100%; height: 100%; object-fit: contain; display: block; }
    .logo-mark.badge { background: #fff; border-radius: 12px; padding: 4px; box-shadow: 0 2px 8px rgba(2, 6, 23, .25); box-sizing: content-box; }
  `],
})
export class LogoComponent {
  size = input(38);
  badge = input(false);
}
