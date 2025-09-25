export class Player {
  constructor({ id, nick, country, tokenColor, money = 1500 }){
    this.id = id; this.nick = nick; this.country = country;
    this.tokenColor = tokenColor; this.money = money;
    this.position = 0; this.properties = new Set();
    this.inJail = false; this.jailTurns = 0;
  }
  pay(amount){ this.money -= amount; }
  receive(amount){ this.money += amount; }
}
