use cosmwasm_std::{Addr, Uint128};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    InitiateSwap {
        hashlock: String,
        timelock: u64,
        receiver: String,
        denom: String,
        amount: Uint128,
    },
    Withdraw {
        swap_id: String,
        preimage: String,
    },
    Refund {
        swap_id: String,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    GetSwap { swap_id: String },
    GetUserSwaps { user: String },
    IsWithdrawable { swap_id: String },
    IsRefundable { swap_id: String },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct SwapResponse {
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

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct UserSwapsResponse {
    pub swaps: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct WithdrawableResponse {
    pub withdrawable: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct RefundableResponse {
    pub refundable: bool,
}