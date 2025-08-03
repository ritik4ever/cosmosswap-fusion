use cosmwasm_std::{Addr, Uint128};
use cw_storage_plus::{Item, Map};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Swap {
    pub hashlock: String,
    pub timelock: u64,
    pub sender: Addr,
    pub receiver: Addr,
    pub denom: String,
    pub amount: Uint128,
    pub withdrawn: bool,
    pub refunded: bool,
    pub preimage: Option<String>,
}

pub const SWAPS: Map<&str, Swap> = Map::new("swaps");
pub const USER_SWAPS: Map<&str, Vec<String>> = Map::new("user_swaps");