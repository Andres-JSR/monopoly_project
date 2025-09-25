export class Bank {
  payMortgage(prop, player){
    if (prop.ownerId !== player.id || prop.mortgaged) return false;
    player.receive(prop.mortgageValue); prop.mortgaged = true; return true;
  }
  redeemMortgage(prop, player){
    if (prop.ownerId !== player.id || !prop.mortgaged) return false;
    const cost = Math.ceil(prop.mortgageValue * 1.10);
    if (player.money < cost) return false;
    player.pay(cost); prop.mortgaged = false; return true;
  }
}
