// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IERC20.sol";
import "./ReentrancyGuard.sol";

/**
 * @title CosmosSwapEthereum
 * @dev Ethereum side of cross-chain atomic swaps with Cosmos
 * Implements Hash Time Lock Contracts (HTLC) for secure cross-chain swaps
 */
contract CosmosSwapEthereum is ReentrancyGuard {
    struct Swap {
        bytes32 hashlock;
        uint256 timelock;
        address sender;
        address receiver;
        address token;
        uint256 amount;
        bool withdrawn;
        bool refunded;
        bytes32 preimage;
    }

    mapping(bytes32 => Swap) public swaps;
    mapping(address => bytes32[]) public userSwaps;
    
    uint256 public constant MINIMUM_TIMELOCK = 1 hours;
    uint256 public constant MAXIMUM_TIMELOCK = 24 hours;
    
    event SwapInitiated(
        bytes32 indexed swapId,
        bytes32 indexed hashlock,
        address indexed sender,
        address receiver,
        address token,
        uint256 amount,
        uint256 timelock
    );
    
    event SwapWithdrawn(
        bytes32 indexed swapId,
        bytes32 preimage,
        address indexed receiver
    );
    
    event SwapRefunded(
        bytes32 indexed swapId,
        address indexed sender
    );

    modifier onlyValidTimelock(uint256 _timelock) {
        require(_timelock >= block.timestamp + MINIMUM_TIMELOCK, "Timelock too short");
        require(_timelock <= block.timestamp + MAXIMUM_TIMELOCK, "Timelock too long");
        _;
    }

    modifier swapExists(bytes32 _swapId) {
        require(swaps[_swapId].sender != address(0), "Swap does not exist");
        _;
    }

    modifier withdrawable(bytes32 _swapId) {
        require(block.timestamp < swaps[_swapId].timelock, "Timelock expired");
        require(!swaps[_swapId].withdrawn, "Already withdrawn");
        require(!swaps[_swapId].refunded, "Already refunded");
        _;
    }

    modifier refundable(bytes32 _swapId) {
        require(block.timestamp >= swaps[_swapId].timelock, "Timelock not expired");
        require(!swaps[_swapId].withdrawn, "Already withdrawn");
        require(!swaps[_swapId].refunded, "Already refunded");
        _;
    }

    /**
     * @dev Initiate a new atomic swap
     * @param _hashlock Hash of the secret
     * @param _timelock Timestamp when the swap expires
     * @param _receiver Address that can withdraw the funds
     * @param _token Token contract address (address(0) for ETH)
     * @param _amount Amount to swap
     */
    function initiateSwap(
        bytes32 _hashlock,
        uint256 _timelock,
        address _receiver,
        address _token,
        uint256 _amount
    ) 
        external 
        payable 
        onlyValidTimelock(_timelock)
        nonReentrant
        returns (bytes32 swapId)
    {
        require(_receiver != address(0), "Invalid receiver");
        require(_amount > 0, "Amount must be positive");
        require(_hashlock != bytes32(0), "Invalid hashlock");

        swapId = keccak256(
            abi.encodePacked(
                msg.sender,
                _receiver,
                _token,
                _amount,
                _hashlock,
                _timelock,
                block.timestamp
            )
        );

        require(swaps[swapId].sender == address(0), "Swap already exists");

        if (_token == address(0)) {
            require(msg.value == _amount, "Incorrect ETH amount");
        } else {
            require(msg.value == 0, "ETH not accepted for token swaps");
            require(
                IERC20(_token).transferFrom(msg.sender, address(this), _amount),
                "Token transfer failed"
            );
        }

        swaps[swapId] = Swap({
            hashlock: _hashlock,
            timelock: _timelock,
            sender: msg.sender,
            receiver: _receiver,
            token: _token,
            amount: _amount,
            withdrawn: false,
            refunded: false,
            preimage: bytes32(0)
        });

        userSwaps[msg.sender].push(swapId);
        userSwaps[_receiver].push(swapId);

        emit SwapInitiated(
            swapId,
            _hashlock,
            msg.sender,
            _receiver,
            _token,
            _amount,
            _timelock
        );
    }

    /**
     * @dev Withdraw funds by revealing the preimage
     * @param _swapId Swap identifier
     * @param _preimage Secret that hashes to the hashlock
     */
    function withdraw(
        bytes32 _swapId,
        bytes32 _preimage
    )
        external
        swapExists(_swapId)
        withdrawable(_swapId)
        nonReentrant
    {
        Swap storage swap = swaps[_swapId];
        
        require(
            sha256(abi.encodePacked(_preimage)) == swap.hashlock,
            "Invalid preimage"
        );
        require(msg.sender == swap.receiver, "Only receiver can withdraw");

        swap.withdrawn = true;
        swap.preimage = _preimage;

        if (swap.token == address(0)) {
            payable(swap.receiver).transfer(swap.amount);
        } else {
            require(
                IERC20(swap.token).transfer(swap.receiver, swap.amount),
                "Token transfer failed"
            );
        }

        emit SwapWithdrawn(_swapId, _preimage, swap.receiver);
    }

    /**
     * @dev Refund the swap after timelock expiry
     * @param _swapId Swap identifier
     */
    function refund(
        bytes32 _swapId
    )
        external
        swapExists(_swapId)
        refundable(_swapId)
        nonReentrant
    {
        Swap storage swap = swaps[_swapId];
        require(msg.sender == swap.sender, "Only sender can refund");

        swap.refunded = true;

        if (swap.token == address(0)) {
            payable(swap.sender).transfer(swap.amount);
        } else {
            require(
                IERC20(swap.token).transfer(swap.sender, swap.amount),
                "Token transfer failed"
            );
        }

        emit SwapRefunded(_swapId, swap.sender);
    }

    /**
     * @dev Get swap details
     * @param _swapId Swap identifier
     */
    function getSwap(bytes32 _swapId) 
        external 
        view 
        returns (
            bytes32 hashlock,
            uint256 timelock,
            address sender,
            address receiver,
            address token,
            uint256 amount,
            bool withdrawn,
            bool refunded,
            bytes32 preimage
        )
    {
        Swap storage swap = swaps[_swapId];
        return (
            swap.hashlock,
            swap.timelock,
            swap.sender,
            swap.receiver,
            swap.token,
            swap.amount,
            swap.withdrawn,
            swap.refunded,
            swap.preimage
        );
    }

    /**
     * @dev Get user's swaps
     * @param _user User address
     */
    function getUserSwaps(address _user) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return userSwaps[_user];
    }

    /**
     * @dev Check if swap is withdrawable
     * @param _swapId Swap identifier
     */
    function isWithdrawable(bytes32 _swapId) 
        external 
        view 
        returns (bool) 
    {
        Swap storage swap = swaps[_swapId];
        return (
            swap.sender != address(0) &&
            block.timestamp < swap.timelock &&
            !swap.withdrawn &&
            !swap.refunded
        );
    }

    /**
     * @dev Check if swap is refundable
     * @param _swapId Swap identifier
     */
    function isRefundable(bytes32 _swapId) 
        external 
        view 
        returns (bool) 
    {
        Swap storage swap = swaps[_swapId];
        return (
            swap.sender != address(0) &&
            block.timestamp >= swap.timelock &&
            !swap.withdrawn &&
            !swap.refunded
        );
    }
}