'reach 0.1';
'use strict';

// Create NFT, set ID, price, and tax
const Creator = {
  getId: Fun([], UInt), 
  getPrice: Fun([], UInt), 
  getTax: Fun([], UInt)
};

// Buy NFT, total cost
const Buyer = {
  buy: Fun([UInt, UInt], Null),
  pawn: Fun([], Null),
  redeem: Fun([UInt, UInt, UInt], Null),
  getPawnPrice: Fun([], UInt),
  getRedeemPrice: Fun([], UInt),
  getDuration: Fun([], UInt),
  getRedeemCost: Fun([], UInt),
  getCurrentDate: Fun([], UInt),
  getEndDate: Fun([], UInt)
};

// Accept pawn, the day of accept, the total fee to pay
const Broker = {
  accept: Fun([UInt, UInt, UInt, UInt], Null)
};

// const NFT = {owner: Address, id: UInt, price: UInt, tax: UInt};

export const main = Reach.App(() => {
  const A = Participant('A', {
    ...Creator,
    id: UInt, // id of NFT
    price: UInt, // price
    tax: UInt, // tax
  });
  const B   = Participant('B', {
    ...Buyer
  });
  const C   = Participant('C', {
    ...Broker
  });
  init();
  
  // create new nft, own by A
  A.only(() => {
    const id = declassify(interact.getId());
    const price = declassify(interact.getPrice());
    const tax = declassify(interact.getTax());
  });
  A.publish(id, price, tax);
  commit();

  // B buy the nft
  B.only(() => {
    interact.buy(id, price);
  });
  B.pay(price);
  transfer(price).to(A);
  commit();

  // B pawn the nft
  B.only(() => {
    interact.pawn();
    const pawnPrice = declassify(interact.getPawnPrice());
    const redeemPrice = declassify(interact.getRedeemPrice());
    const endDate = declassify(interact.getEndDate());
  });
  B.publish(pawnPrice, redeemPrice, endDate);
  commit();

  // C accept pawn, pay to A and B
  C.only(()=> {
    interact.accept(id, pawnPrice, redeemPrice, endDate);
  });

  C.pay(pawnPrice);
  const res2 = pawnPrice - tax;
  transfer(tax).to(A);
  transfer(res2).to(B);
  commit();

  // B try to redeem NFT
  B.only(() => {
    const currentDate = declassify(interact.getCurrentDate());
    interact.redeem(id, redeemPrice, endDate);
  });
  B.publish(currentDate);
  if (endDate >= currentDate) {
    const res3 = redeemPrice - tax;
    commit();

    B.pay(redeemPrice);
    transfer(tax).to(A);
    transfer(res3).to(C);
  }
  commit();
});
