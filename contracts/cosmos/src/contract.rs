use cosmwasm_std::{
    to_binary, BankMsg, Binary, Coin, Deps, DepsMut, Env, MessageInfo, Response, StdResult, Uint128,
};
use sha2::{Digest, Sha256};

use crate::error::ContractError;
use crate::msg::{
    ExecuteMsg, InstantiateMsg, QueryMsg, RefundableResponse, SwapResponse, UserSwapsResponse,
    WithdrawableResponse,
};
use crate::state::{Swap, SWAPS, USER_SWAPS};

const MINIMUM_TIMELOCK: u64 = 3600; // 1 hour
const MAXIMUM_TIMELOCK: u64 = 86400; // 24 hours

pub fn instantiate(
    _deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    _msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    Ok(Response::new().add_attribute("method", "instantiate"))
}

pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::InitiateSwap {
            hashlock,
            timelock,
            receiver,
            denom,
            amount,
        } => execute_initiate_swap(deps, env, info, hashlock, timelock, receiver, denom, amount),
        ExecuteMsg::Withdraw { swap_id, preimage } => {
            execute_withdraw(deps, env, info, swap_id, preimage)
        }
        ExecuteMsg::Refund { swap_id } => execute_refund(deps, env, info, swap_id),
    }
}

pub fn execute_initiate_swap(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    hashlock: String,
    timelock: u64,
    receiver: String,
    denom: String,
    amount: Uint128,
) -> Result<Response, ContractError> {
    // Validate timelock
    let current_time = env.block.time.seconds();
    if timelock < current_time + MINIMUM_TIMELOCK {
        return Err(ContractError::InvalidTimelock {});
    }
    if timelock > current_time + MAXIMUM_TIMELOCK {
        return Err(ContractError::InvalidTimelock {});
    }

    // Validate amount
    if amount.is_zero() {
        return Err(ContractError::InvalidAmount {});
    }

    // Validate receiver address
    let receiver_addr = deps.api.addr_validate(&receiver)?;

    // Check if sufficient funds were sent
    let sent_amount = info
        .funds
        .iter()
        .find(|coin| coin.denom == denom)
        .map(|coin| coin.amount)
        .unwrap_or_else(Uint128::zero);

    if sent_amount < amount {
        return Err(ContractError::InsufficientFunds {});
    }

    // Generate swap ID
    let swap_id = format!(
        "{}:{}:{}:{}:{}:{}:{}",
        info.sender,
        receiver,
        denom,
        amount,
        hashlock,
        timelock,
        current_time
    );
    let swap_id_hash = format!("{:x}", Sha256::digest(swap_id.as_bytes()));

    // Check if swap already exists
    if SWAPS.has(deps.storage, &swap_id_hash) {
        return Err(ContractError::SwapAlreadyExists {});
    }

    // Create swap
    let swap = Swap {
        hashlock: hashlock.clone(),
        timelock,
        sender: info.sender.clone(),
        receiver: receiver_addr.clone(),
        denom: denom.clone(),
        amount,
        withdrawn: false,
        refunded: false,
        preimage: None,
    };

    // Store swap
    SWAPS.save(deps.storage, &swap_id_hash, &swap)?;

    // Update user swaps
    let mut sender_swaps = USER_SWAPS
        .may_load(deps.storage, info.sender.as_str())?
        .unwrap_or_default();
    sender_swaps.push(swap_id_hash.clone());
    USER_SWAPS.save(deps.storage, info.sender.as_str(), &sender_swaps)?;

    let mut receiver_swaps = USER_SWAPS
        .may_load(deps.storage, receiver_addr.as_str())?
        .unwrap_or_default();
    receiver_swaps.push(swap_id_hash.clone());
    USER_SWAPS.save(deps.storage, receiver_addr.as_str(), &receiver_swaps)?;

    Ok(Response::new()
        .add_attribute("method", "initiate_swap")
        .add_attribute("swap_id", swap_id_hash)
        .add_attribute("sender", info.sender)
        .add_attribute("receiver", receiver_addr)
        .add_attribute("amount", amount)
        .add_attribute("denom", denom))
}

pub fn execute_withdraw(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    swap_id: String,
    preimage: String,
) -> Result<Response, ContractError> {
    let mut swap = SWAPS
        .may_load(deps.storage, &swap_id)?
        .ok_or(ContractError::SwapNotFound {})?;

    // Check if caller is the receiver
    if info.sender != swap.receiver {
        return Err(ContractError::Unauthorized {});
    }

    // Check if timelock is not expired
    let current_time = env.block.time.seconds();
    if current_time >= swap.timelock {
        return Err(ContractError::TimelockExpired {});
    }

    // Check if already withdrawn or refunded
    if swap.withdrawn {
        return Err(ContractError::AlreadyWithdrawn {});
    }
    if swap.refunded {
        return Err(ContractError::AlreadyRefunded {});
    }

    // Verify preimage
    let computed_hash = format!("{:x}", Sha256::digest(preimage.as_bytes()));
    if computed_hash != swap.hashlock {
        return Err(ContractError::InvalidPreimage {});
    }

    // Update swap
    swap.withdrawn = true;
    swap.preimage = Some(preimage.clone());
    SWAPS.save(deps.storage, &swap_id, &swap)?;

    // Transfer funds to receiver
    let transfer_msg = BankMsg::Send {
        to_address: swap.receiver.to_string(),
        amount: vec![Coin {
            denom: swap.denom.clone(),
            amount: swap.amount,
        }],
    };

    Ok(Response::new()
        .add_message(transfer_msg)
        .add_attribute("method", "withdraw")
        .add_attribute("swap_id", swap_id)
        .add_attribute("preimage", preimage)
        .add_attribute("receiver", swap.receiver))
}

pub fn execute_refund(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    swap_id: String,
) -> Result<Response, ContractError> {
    let mut swap = SWAPS
        .may_load(deps.storage, &swap_id)?
        .ok_or(ContractError::SwapNotFound {})?;

    // Check if caller is the sender
    if info.sender != swap.sender {
        return Err(ContractError::Unauthorized {});
    }

    // Check if timelock is expired
    let current_time = env.block.time.seconds();
    if current_time < swap.timelock {
        return Err(ContractError::TimelockNotExpired {});
    }

    // Check if already withdrawn or refunded
    if swap.withdrawn {
        return Err(ContractError::AlreadyWithdrawn {});
    }
    if swap.refunded {
        return Err(ContractError::AlreadyRefunded {});
    }

    // Update swap
    swap.refunded = true;
    SWAPS.save(deps.storage, &swap_id, &swap)?;

    // Transfer funds back to sender
    let transfer_msg = BankMsg::Send {
        to_address: swap.sender.to_string(),
        amount: vec![Coin {
            denom: swap.denom.clone(),
            amount: swap.amount,
        }],
    };

    Ok(Response::new()
        .add_message(transfer_msg)
        .add_attribute("method", "refund")
        .add_attribute("swap_id", swap_id)
        .add_attribute("sender", swap.sender))
}

pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetSwap { swap_id } => to_binary(&query_swap(deps, swap_id)?),
        QueryMsg::GetUserSwaps { user } => to_binary(&query_user_swaps(deps, user)?),
        QueryMsg::IsWithdrawable { swap_id } => {
            to_binary(&query_is_withdrawable(deps, env, swap_id)?)
        }
        QueryMsg::IsRefundable { swap_id } => {
            to_binary(&query_is_refundable(deps, env, swap_id)?)
        }
    }
}

fn query_swap(deps: Deps, swap_id: String) -> StdResult<SwapResponse> {
    let swap = SWAPS.load(deps.storage, &swap_id)?;
    Ok(SwapResponse {
        hashlock: swap.hashlock,
        timelock: swap.timelock,
        sender: swap.sender,
        receiver: swap.receiver,
        denom: swap.denom,
        amount: swap.amount,
        withdrawn: swap.withdrawn,
        refunded: swap.refunded,
        preimage: swap.preimage,
    })
}

fn query_user_swaps(deps: Deps, user: String) -> StdResult<UserSwapsResponse> {
    let swaps = USER_SWAPS
        .may_load(deps.storage, &user)?
        .unwrap_or_default();
    Ok(UserSwapsResponse { swaps })
}

fn query_is_withdrawable(deps: Deps, env: Env, swap_id: String) -> StdResult<WithdrawableResponse> {
    let swap = SWAPS.load(deps.storage, &swap_id)?;
    let current_time = env.block.time.seconds();
    let withdrawable = current_time < swap.timelock && !swap.withdrawn && !swap.refunded;
    Ok(WithdrawableResponse { withdrawable })
}

fn query_is_refundable(deps: Deps, env: Env, swap_id: String) -> StdResult<RefundableResponse> {
    let swap = SWAPS.load(deps.storage, &swap_id)?;
    let current_time = env.block.time.seconds();
    let refundable = current_time >= swap.timelock && !swap.withdrawn && !swap.refunded;
    Ok(RefundableResponse { refundable })
}