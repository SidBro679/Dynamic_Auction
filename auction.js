let provider, signer, auctionContract;

const contractAddress = "0x9b3b3Ea5A44344152830d14Cbfc84A709a506605";
const contractABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "AuctionEnded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "itemName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			}
		],
		"name": "AuctionStarted",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "bid",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "endAuction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "bidder",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "HighestBidIncreased",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_itemName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_biddingTime",
				"type": "uint256"
			}
		],
		"name": "startAuction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdraw",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "auctionEndTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "auctionItemName",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ended",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAuctionDetails",
		"outputs": [
			{
				"internalType": "string",
				"name": "itemName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "topBidder",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "topBid",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isEnded",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "highestBid",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "highestBidder",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "pendingReturns",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });

            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            const account = await signer.getAddress();
            document.getElementById("wallet-connect").style.display = "none";
            document.getElementById("auction-setup").style.display = "block";

            auctionContract = new ethers.Contract(contractAddress, contractABI, signer);
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Wallet connection failed: " + error.message);
        }
    } else {
        alert("MetaMask not detected! Please install MetaMask.");
    }
}

async function startAuction() {
    const itemName = document.getElementById("auctionItemName").value;
    const duration = parseInt(document.getElementById("auctionDuration").value);

    try {
        const tx = await auctionContract.startAuction(itemName, duration);
        await tx.wait();
        alert("Auction started successfully!");
        document.getElementById("auction-setup").style.display = "none";
        document.getElementById("auction-details").style.display = "block";
        fetchAuctionDetails();
    } catch (error) {
        console.error("Error starting auction:", error);
        alert("Error starting auction: " + error.message);
    }
}

async function fetchAuctionDetails() {
    try {
        const itemName = await auctionContract.auctionItemName();
        const highestBid = await auctionContract.highestBid();
        const highestBidder = await auctionContract.highestBidder();
        const auctionEndTime = await auctionContract.auctionEndTime();
        const ended = await auctionContract.ended();

        document.getElementById("auctionItem").innerText = itemName;
        document.getElementById("highestBid").innerText = ethers.utils.formatEther(highestBid);
        document.getElementById("highestBidder").innerText =
            highestBidder === "0x0000000000000000000000000000000000000000" ? "None" : highestBidder;
        document.getElementById("auctionEndTime").innerText = new Date(auctionEndTime * 1000).toLocaleString();
        document.getElementById("auction-status").innerText = ended ? "Auction ended" : "Auction ongoing";

        const userAddress = await signer.getAddress();
        document.getElementById("endAuctionButton").style.display =
            userAddress.toLowerCase() === (await auctionContract.owner()).toLowerCase() && !ended ? "block" : "none";
    } catch (error) {
        console.error("Error fetching auction details:", error);
    }
}

async function placeBid() {
    const bidAmount = document.getElementById("bidAmount").value;
    const bidValue = ethers.utils.parseEther(bidAmount);

    try {
        const tx = await auctionContract.bid({ value: bidValue });
        await tx.wait();
        alert("Bid placed successfully!");
        fetchAuctionDetails();
    } catch (error) {
        console.error("Error placing bid:", error);
        alert("Error placing bid: " + error.message);
    }
}

async function endAuction() {
    try {
        const tx = await auctionContract.endAuction();
        await tx.wait();
        alert("Auction ended successfully!");
        document.getElementById("auction-setup").style.display = "block";
        document.getElementById("auction-details").style.display = "none";
    } catch (error) {
        console.error("Error ending auction:", error);
        alert("Error ending auction: " + error.message);
    }
}

async function withdraw() {
    try {
        const tx = await auctionContract.withdraw();
        await tx.wait();
        alert("Withdrawal successful!");
    } catch (error) {
        console.error("Error withdrawing:", error);
        alert("Error withdrawing: " + error.message);
    }
}
