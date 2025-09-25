import { Tile } from './Tile.js';

export class Property extends Tile {
  constructor({ id, name, color, price, rent, mortgage }){
    super({ id, name, type:'property', color });
    this.price = price ?? 0;
    this.rent = {
      base: rent?.base ?? 0,
      withHouse: rent?.withHouse ?? [],
      withHotel: rent?.withHotel ?? 0
    };
    this.mortgageValue = mortgage ?? 0;
    this.ownerId = null;
    this.houses = 0;
    this.hotel = false;
    this.mortgaged = false;
  }
  static fromJSON(j){
    return new Property({
      id: j.id, name: j.name, color: j.color, price: j.price, rent: j.rent, mortgage: j.mortgage
    });
  }
  getRent(){
    if (this.mortgaged) return 0;
    if (this.hotel) return this.rent.withHotel;
    if (this.houses >= 1) return this.rent.withHouse[this.houses-1] ?? 0;
    return this.rent.base;
  }
}
