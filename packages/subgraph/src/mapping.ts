import { BigInt, Address } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/ViperSwap VINCI/WONE LP/IERC20";
import { Holder } from "../generated/schema";

const zeroAddress = "0x0000000000000000000000000000000000000000";

const end = new BigInt(Date.now()).div(new BigInt(1000));

// We use a scoring system to simplify the problem.
// Points are attributed for the full period between the time of the deposit/withdrawal.
// Deposits give users Tokens * (End Date - Timestamp), withdrawals the opposite.

// HRC20 transfers are easy to handle, we only keep track of the sender and receiver's
// balance, we don't account for address(0)'s balance.

export function handleTransfer(event: Transfer): void {
  let from = event.params.from.toHexString();
  let to = event.params.to.toHexString();
  let value = event.params.value;
  let timestamp = event.block.timestamp;
  let timespan = end.minus(timestamp);

  if (from != zeroAddress) {
    let fromHolder = Holder.load(from);
    if (from == null) fromHolder = new Holder(from);
    let fromPoints = fromHolder.points;
    fromHolder.points = fromPoints.minus(timespan.times(value));
    fromHolder.save();
  }

  if (to != zeroAddress) {
    let toHolder = Holder.load(to);
    if (to == null) toHolder = new Holder(from);
    let toPoints = toHolder.points;
    toHolder.points = toPoints.minus(timespan.times(value));
    toHolder.save();
  }
}
