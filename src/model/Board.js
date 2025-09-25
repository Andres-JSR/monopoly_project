import { Tile } from './Tile.js';
import { Property } from './Property.js';

function flattenBoard(data){
  const bands = ['bottom','left','top','right'];
  const all = bands.flatMap(k => Array.isArray(data[k]) ? data[k] : []);
  return all.sort((a,b)=> (a.id??0) - (b.id??0));
}
function normalizeType(t){
  if (t === 'community_chest') return 'community';
  if (t === 'chance') return 'chance';
  if (t === 'tax') return 'tax';
  if (t === 'railroad') return 'railroad';
  if (t === 'property') return 'property';
  if (t === 'special') return 'special';
  return t;
}
export class Board {
  constructor(api){ this.api = api; this.tiles = []; }
  async load(){
    const data = await this.api.getBoard();
    const flat = flattenBoard(data);
    if (!flat.length) throw new Error('El backend no devolvió casillas.');
    this.tiles = flat.map(raw => {
      const type = normalizeType(raw.type);
      if (type === 'special') {
        if (raw.id === 0)  return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'go', value: raw.action?.money ?? 200 });
        if (raw.id === 10) return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'jail' });
        if (raw.id === 20) return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'free' });
        if (raw.id === 30) return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'go_to_jail' });
        return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'special' });
      }
      if (type === 'property') return Property.fromJSON(raw);
      if (type === 'tax') return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'tax', value: raw.action?.money ?? -100 });
      if (type === 'railroad') return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'railroad' });
      if (type === 'community') return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'community' });
      if (type === 'chance') return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'chance' });
      return Tile.fromJSON({ id: raw.id, name: raw.name, type });
    });
  }
  size(){ return this.tiles.length; }
  getTile(i){ return this.tiles[i % this.size()]; }
  advance(from, steps){ return (from + steps) % this.size(); }
}
