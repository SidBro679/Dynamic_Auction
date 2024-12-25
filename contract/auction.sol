// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Auction {
    address public owner;
    address public highestBidder;
    uint public highestBid;
    uint public auctionEndTime;
    bool public ended;
    string public auctionItemName;

    mapping(address => uint) public pendingReturns;

    event AuctionStarted(string itemName, uint endTime);
    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    constructor() {
        owner = msg.sender;
    }

    modifier auctionNotEnded() {
        require(!ended, "Auction has already ended.");
        _;
    }

    // Start a new auction (can be called by anyone)
    function startAuction(string memory _itemName, uint _biddingTime) external {
        require(ended, "Previous auction must be ended first.");
        require(_biddingTime > 0, "Bidding time must be greater than zero.");

        auctionItemName = _itemName;
        auctionEndTime = block.timestamp + _biddingTime;
        highestBidder = address(0);
        highestBid = 0;
        ended = false;

        emit AuctionStarted(_itemName, auctionEndTime);
    }

    // Place a bid
    function bid() external payable auctionNotEnded {
        require(block.timestamp < auctionEndTime, "Auction has already ended.");
        require(msg.value > highestBid, "There already is a higher bid.");

        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

    // Withdraw overbid amounts
    function withdraw() external returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;

            if (!payable(msg.sender).send(amount)) {
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    // End the auction (can only be called after auctionEndTime)
    function endAuction() external auctionNotEnded {
        require(block.timestamp >= auctionEndTime, "Auction is still ongoing.");
        require(!ended, "Auction has already ended.");

        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        if (highestBid != 0) {
            payable(owner).transfer(highestBid);
        }
    }

    // Get auction details
    function getAuctionDetails() external view returns (
        string memory itemName,
        uint endTime,
        address topBidder,
        uint topBid,
        bool isEnded
    ) {
        return (auctionItemName, auctionEndTime, highestBidder, highestBid, ended);
    }
}
