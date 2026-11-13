import { Directive, ElementRef, OnChanges, OnDestroy, OnInit, inject, input } from '@angular/core';

const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Apparition douce au défilement. Sans IntersectionObserver ou avec « réduire les animations », le contenu reste affiché tel quel. */
@Directive({ selector: '[appReveal]' })
export class RevealDirective implements OnInit, OnDestroy {
  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  delay = input<number | string>(0, { alias: 'appReveal' });
  private io?: IntersectionObserver;

  ngOnInit() {
    if (reduced() || typeof IntersectionObserver === 'undefined') return;
    this.el.classList.add('fx');
    const d = Number(this.delay()) || 0;
    if (d) this.el.style.transitionDelay = `${d}ms`;
    this.io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { this.el.classList.add('fx-in'); this.io?.disconnect(); }
    }, { threshold: 0.12 });
    this.io.observe(this.el);
  }
  ngOnDestroy() { this.io?.disconnect(); }
}

/** Compteur animé : affiche la valeur finale immédiatement si les animations sont réduites. */
@Directive({ selector: '[appCountUp]' })
export class CountUpDirective implements OnChanges {
  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  value = input<number | null | undefined>(null, { alias: 'appCountUp' });
  private raf = 0;

  ngOnChanges() {
    const v = this.value();
    cancelAnimationFrame(this.raf);
    if (v == null) { this.el.textContent = '–'; return; }
    if (reduced()) { this.el.textContent = String(v); return; }
    const t0 = performance.now(), dur = 1100;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      this.el.textContent = String(Math.round(v * (1 - Math.pow(1 - p, 3))));
      if (p < 1) this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
}
