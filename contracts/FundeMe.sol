//SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;
//pragma

// import statments
import "./PriceConvertor.sol";

// interfaces, libraries, error
error FundMe_NotOwner(uint256 amountFunded, uint256 amountRequired);
error FundMe__MinimumUsdRequired(
    uint256 usdAmountFunded,
    uint256 usdAmountRequired
);

//contract
contract FundMe {
    // type declarations
    using PriceConvertor for uint256;
    // state variables
    AggregatorV3Interface private s_priceFeedAddress;
    uint256 public constant MINIMUM_USD = 50 * 1E18;
    address private immutable i_owner;
    address[] private s_funders;
    mapping(address => uint) private s_addressToAmountFunded;
    //events (we have none)
    // modifier
    modifier minAmount() {
    //     require(
    //         msg.value.getConversionRate(s_priceFeedAddress) >= MINIMUM_USD,
    //         "minimum funding of 50USD is allowed"
    //     );
        uint256 usdAmountFunded = msg.value.getConversionRate(s_priceFeedAddress);
        if(usdAmountFunded<MINIMUM_USD) revert FundMe__MinimumUsdRequired(usdAmountFunded,MINIMUM_USD);
        _;
    }
    modifier onlyOwner() {
        require(msg.sender == i_owner, "only owners can withdraw funds");
        _;
    }

    // functions order
    //constructor
    //recieve
    // fallback
    //external
    //public
    //internal
    //private
    //view/pure
    constructor(address priceFeed) {
        i_owner = msg.sender;
        s_priceFeedAddress = AggregatorV3Interface(priceFeed);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable minAmount {
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner returns (string memory) {
        for (
            uint256 fundersIndex;
            fundersIndex < s_funders.length;
            fundersIndex++
        ) s_addressToAmountFunded[s_funders[fundersIndex]] = 0;
        s_funders = new address[](0);
        (bool success, ) = payable(i_owner).call{value: address(this).balance}(
            ""
        );
        require(success, "failed to withdraw funds");
        return "amount withdrawn successufully";
    }

    function cheaperWithdraw() public onlyOwner returns (string memory) {
        address[] memory fundersArr = s_funders;
        for (
            uint256 fundersArrIndex;
            fundersArrIndex < fundersArr.length;
            fundersArrIndex++
        ) {
            address funderAddress = fundersArr[fundersArrIndex];
            s_addressToAmountFunded[funderAddress] = 0;
        }
        s_funders = new address[](0);
        (bool success,) = payable(i_owner).call{value:address(this).balance}("");
        require(success,"failed to withdraw funds");
        return "amount withdrawn successfully";
    }

    // view, pure
    function getOwner() public view returns (address){
        return i_owner;
    }
    function getFunder(uint256 index) public view returns (address){
        return s_funders[index];
    }
    function getAddressToAmountFunded(address funder) public view returns (uint256){
        return s_addressToAmountFunded[funder];
    }
    function getPriceFeed() public view returns (AggregatorV3Interface){
        return s_priceFeedAddress;
    }
}