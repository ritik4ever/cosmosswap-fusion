use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("Swap does not exist")]
    SwapNotFound {},

    #[error("Swap already exists")]
    SwapAlreadyExists {},

    #[error("Invalid timelock")]
    InvalidTimelock {},

    #[error("Timelock expired")]
    TimelockExpired {},

    #[error("Timelock not expired")]
    TimelockNotExpired {},

    #[error("Already withdrawn")]
    AlreadyWithdrawn {},

    #[error("Already refunded")]
    AlreadyRefunded {},

    #[error("Invalid preimage")]
    InvalidPreimage {},

    #[error("Insufficient funds")]
    InsufficientFunds {},

    #[error("Invalid amount")]
    InvalidAmount {},
}