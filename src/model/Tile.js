export class Tile {
  constructor({ id, name, type, value, color }) {
    this.id = id; this.name = name; this.type = type; this.value = value ?? 0; this.color = color ?? null;
  }
  static fromJSON(j){ return new Tile({ id: j.id, name: j.name, type: j.type, value: j.value, color: j.color }); }
}
