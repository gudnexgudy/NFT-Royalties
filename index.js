import React from 'react';
import AppViews from './views/AppViews';
import CreatorViews from './views/CreatorViews';
import BuyerViews from './views/BuyerViews';
import BrokerViews from './views/BrokerViews';
import {renderDOM, renderView} from './views/render';
import './index.css';
import * as backend from './build/index.main.mjs';
import {loadStdlib} from '@reach-sh/stdlib';
// const reach = loadStdlib(process.env);
import { ALGO_MyAlgoConnect as MyAlgoConnect } from '@reach-sh/stdlib';

/*const reach = loadStdlib({
  REACH_CONNECTOR_MODE: 'ALGO',
  REACH_DEBUG: 'yes',
});*/

const reach = loadStdlib('ALGO');
reach.setWalletFallback(reach.walletFallback({providerEnv: 'TestNet', MyAlgoConnect }));

const {standardUnit} = reach;
const defaults = {defaultFundAmt: '10', defaultWager: '3', standardUnit};

//reach.setProviderByName('TestNet');
// reach.setProviderByName('MainNet');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {view: 'ConnectAccount', ...defaults};
  }
  
  async componentDidMount() {
    const now = await reach.getNetworkTime();
    reach.setQueryLowerBound(reach.sub(now, 3000));

    const acc = await reach.getDefaultAccount();
    const balAtomic = await reach.balanceOf(acc);
    const bal = reach.formatCurrency(balAtomic, 4);
    this.setState({acc, bal});
    if (await reach.canFundFromFaucet()) {
      this.setState({view: 'FundAccount'});
    } else {
      this.setState({view: 'DeployerOrAttacher'});
    }
  }

  async fundAccount(fundAmount) {
    await reach.fundFromFaucet(this.state.acc, reach.parseCurrency(fundAmount));
    this.setState({view: 'DeployerOrAttacher'});
  }

  async skipFundAccount() { this.setState({view: 'DeployerOrAttacher'}); }
  selectCreator() { this.setState({view: 'Wrapper', ContentView: Creator}); }
  selectBuyer() { this.setState({view: 'Wrapper', ContentView: Buyer}); }
  selectBroker() { this.setState({view: 'Wrapper', ContentView: Broker}); }
  render() { return renderView(this, AppViews); }
}

class Creator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {view: 'SetInfo'};
  }
  setInfo(id, price, tax) { this.setState({view: 'Deploy', id, price, tax}); }
  getId() {return this.state.id;}
  getPrice() {return this.state.price;}
  getTax() {return this.state.tax;}

  async deploy() {
    const ctc = this.props.acc.deploy(backend);
    this.setState({view: 'Deploying', ctc});
    this.id = reach.parseCurrency(this.state.id); // UInt
    this.price = reach.parseCurrency(this.state.price); // UInt
    this.tax = reach.parseCurrency(this.state.tax); // UInt
    backend.A(ctc, this);
    const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
    this.setState({view: 'WaitingForAttacher', ctcInfoStr});
  }
  render() { return renderView(this, CreatorViews); }
}

class Buyer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {view: 'Attach'};
  }

  attach(ctcInfoStr) {
    const ctc = this.props.acc.attach(backend, JSON.parse(ctcInfoStr));
    this.setState({view: 'Attaching'});
    backend.B(ctc, this);
  }

  async buy(idAtomic, priceAtomic) {
    console.log(idAtomic, priceAtomic);
    const id = idAtomic.toNumber();
    const price = priceAtomic.toNumber();
    console.log(id, price);
    return await new Promise(bought => {
      this.setState({view: 'BuyNFT', id, price, standardUnit, bought});
    });
  }

  buyIt() {
    console.log("buy it");
    this.state.bought();
  }

  async pawn() {
    return await new Promise(pawned => {
      this.setState({view: 'Pawn', standardUnit, pawned});
    });
  }

  pawnIt(pawnPrice, redeemPrice, endDate) {
    this.setState({view: 'WaitingForPawn', pawnPrice, redeemPrice, endDate});
    this.state.pawned();
  }

  async redeem(id, redeemPriceAtomic, endDateAtomic) {
    console.log("redeem in");
    const redeemPrice = redeemPriceAtomic.toNumber();
    const endDate = endDateAtomic.toNumber();
    return await new Promise(redeemed => {
      this.setState({view: 'Redeem', id, standardUnit,  redeemPrice, endDate, redeemed});
    });
  }

  redeemIt(id) {
    this.state.redeemed();
    this.setState({view: 'RedeemSuccess', id});
  }

  getPawnPrice()   { return this.state.pawnPrice };
  getRedeemPrice() { return this.state.redeemPrice };
  getEndDate()     { return this.state.endDate };
  getCurrentDate() { return 0 };

  render() { return renderView(this, BuyerViews); }
}

class Broker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {view: 'Attach'};
  }
  
  attach(ctcInfoStr) {
    const ctc = this.props.acc.attach(backend, JSON.parse(ctcInfoStr));
    this.setState({view: 'Attaching'});
    backend.C(ctc, this);
  }

  async accept(idAtomic, pawnPriceAtomic, redeemPriceAtomic, endDateAtomic) { // Fun([UInt], Null)
    console.log("start accept");
    const id = idAtomic.toNumber();
    const pawnPrice = pawnPriceAtomic.toNumber();
    const redeemPrice = redeemPriceAtomic.toNumber();
    const endDate = endDateAtomic.toNumber();
    return await new Promise(accepted => {
      this.setState({view: 'acceptPawn', id, pawnPrice, redeemPrice, endDate, accepted});
    });
  }
  
  acceptIt() {
    this.state.accepted();
    this.setState({view: 'WaitingForRedeem'});
  }

  render() { return renderView(this, BrokerViews); }
}

renderDOM(<App />);
