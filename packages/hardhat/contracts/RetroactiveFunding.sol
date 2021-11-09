pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MoonshotBot.sol";

contract RetroactiveFunding {
    /// @dev mapping which tracks the floor for each nft
    mapping(address => uint256) public floor;

    /**
     * @notice Whale increasesfloor price for a particular nft by locking in a specific amount of eth and floor is calulated based on eth locked and nft's total supply
     * @param _nft nft address
     */
    function increaseFloor(MoonshotBot _nft) external payable {
        uint256 totalSupply = _nft.totalSupply();
        floor[address(_nft)] = floor[address(_nft)] + (msg.value / totalSupply);
        // (bool success, ) = msg.sender.call{value: msg.value}("");
        // require(success);
    }

    /**
     * @notice Executes a sale and updates the floor price
     * @param _nft nft address
     * @param _id nft id
     */
    function executeSale(MoonshotBot _nft, uint256 _id) external {
        uint256 currentFloor = floor[address(_nft)];
        // updating the total supply to calculate the new floor
        uint256 updatedTotalSupply = _nft.totalSupply() - 1;
        // updating floor price by subtracting the current floor by the ratio of the sale amount and the new total supply
        require(
            floor[address(_nft)] > currentFloor / updatedTotalSupply,
            "RetroactiveFunding: sale cannot be made right now!"
        );
        floor[address(_nft)] =
            floor[address(_nft)] -
            currentFloor /
            updatedTotalSupply;
        (bool success, ) = msg.sender.call{value: currentFloor}("");
        require(success, "RetroactiveFunding: sending floor price failed");
        // burn the nft's approval required
        // _burn is an internal function which cannot be accessed so we transfer to address(1) instead since the transfer from has a check on transferring to address(0)
        _nft.burn(_id);
    }
}
