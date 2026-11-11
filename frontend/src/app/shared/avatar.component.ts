import { Component, input } from '@angular/core';
import { NgStyle } from '@angular/common';
import { avatarStyle, initials } from '../core/avatar';

@Component({
  selector: 'app-avatar',
  imports: [NgStyle],
  template: `
    <span class="avatar" [class.lg]="size() === 'lg'" [class.sm]="size() === 'sm'" [ngStyle]="style()">
      @if (photo()) {
        <img [src]="photo()" [alt]="'Photo de ' + nom()" loading="lazy" />
      } @else {
        <span aria-hidden="true">{{ ini() }}</span>
        <span class="sr-only">Avatar de {{ nom() }}</span>
      }
    </span>`,
})
export class AvatarComponent {
  nom = input.required<string>();
  id = input.required<number>();
  photo = input<string | null>(null);
  size = input<'sm' | 'md' | 'lg'>('md');
  ini = () => initials(this.nom());
  style = () => (this.photo() ? {} : avatarStyle(this.id()));
}
