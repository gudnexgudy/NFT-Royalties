import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const reach = loadStdlib({
  REACH_CONNECTOR_MODE: 'ALGO',
  REACH_DEBUG: 'yes',
});

const {standardUnit} = reach;
const defaults = {defaultFundAmt: '10', defaultWager: '3', standardUnit};
