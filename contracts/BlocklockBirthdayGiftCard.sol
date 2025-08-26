// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {TypesLib} from "blocklock-solidity/src/libraries/TypesLib.sol";
import {AbstractBlocklockReceiver} from "blocklock-solidity/src/AbstractBlocklockReceiver.sol";

contract BlocklockBirthdayGiftCard is AbstractBlocklockReceiver {
    
    uint256 public currentRequestId;

    struct GiftCard {
        address giftedBy;
        address recipient;
        uint32 encryptedAt;
        uint32 decryptedAt;
        TypesLib.Ciphertext encryptedValue;
        string message;
        bool claimed;
    }

    mapping(uint256 => GiftCard) public giftCards;
    mapping(address => uint256[]) public recipientGiftCards;

    constructor(address blocklockSender) AbstractBlocklockReceiver(blocklockSender) {}

    function createBirthdayGift(
        address recipient,
        uint32 callbackGasLimit,
        uint32 _encryptedAt,
        uint32 _decryptedAt,
        bytes calldata condition,
        TypesLib.Ciphertext calldata encryptedData
    ) external payable returns (uint256, uint256) {
        (uint256 _requestId, uint256 requestPrice) =
            _requestBlocklockPayInNative(callbackGasLimit, condition, encryptedData);
        
        currentRequestId = _requestId;
        giftCards[_requestId] = GiftCard({
            giftedBy: msg.sender,
            recipient: recipient,
            encryptedAt: _encryptedAt,
            decryptedAt: _decryptedAt,
            encryptedValue: encryptedData,
            message: "",
            claimed: false
        });
        recipientGiftCards[recipient].push(_requestId);
        return (currentRequestId, requestPrice);
    }

    function claimGift(uint256 _requestId) external {
        GiftCard storage gift = giftCards[_requestId];
        require(msg.sender == gift.recipient, "Only recipient can claim");
        require(!gift.claimed, "Gift already claimed");
        require(bytes(gift.message).length > 0, "Gift not yet unlocked");
        
        gift.claimed = true;
    }

    function getRecipientGiftCards(address recipient) external view returns (uint256[] memory) {
        return recipientGiftCards[recipient];
    }

    function _onBlocklockReceived(uint256 _requestId, bytes calldata decryptionKey) internal override {
        GiftCard storage gift = giftCards[_requestId];
        gift.message = abi.decode(_decrypt(gift.encryptedValue, decryptionKey), (string));
    }
}