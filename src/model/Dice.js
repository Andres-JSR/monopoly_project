export class Dice {
  roll(){ return 1 + Math.floor(Math.random() * 6); }
  rollTwo(){ const d1 = this.roll(), d2 = this.roll(); return { d1, d2, total: d1 + d2 }; }
}
