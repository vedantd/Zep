// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZepPay is Ownable {
    // USDC token contract address (for Base mainnet)
    IERC20 public usdcToken =
        IERC20(0x036CbD53842c5426634e7929541eC2318f3dCF7e);

    enum Category {
        Groceries,
        Healthcare,
        Education,
        Emergency
    }

    struct Beneficiary {
        string name;
        string mobileNumber;
        bool exists;
    }

    struct Sponsorship {
        address sponsor;
        string beneficiaryMobile;
        uint256 amount;
        Category category;
        bool used;
    }

    struct Merchant {
        string businessName;
        Category category;
        bool registered;
    }

    // Mapping of sponsors to their beneficiaries
    mapping(address => mapping(string => Beneficiary)) public beneficiaries;
    mapping(address => string[]) public sponsorBeneficiaries;

    // Mapping of sponsorships by ID
    mapping(uint256 => Sponsorship) public sponsorships;
    uint256 public nextSponsorshipId = 1;

    // Mapping from mobile number to all sponsorship IDs
    mapping(string => uint256[]) public beneficiarySponsorships;

    // Mapping of merchants
    mapping(address => Merchant) public merchants;

    // Mapping for OTPs (simple implementation for hackathon)
    mapping(string => uint256) public otps;
    // Mapping for OTP expiration timestamps
    mapping(string => uint256) public otpExpiry;

    // Events
    event BeneficiaryAdded(address sponsor, string mobileNumber, string name);
    event SponsorshipCreated(
        uint256 sponsorshipId,
        address sponsor,
        string mobileNumber,
        uint256 amount,
        Category category
    );
    event MerchantRegistered(
        address merchant,
        string businessName,
        Category category
    );
    event PaymentProcessed(
        address merchant,
        string beneficiaryMobile,
        uint256 amount,
        uint256 sponsorshipId
    );
    // Updated: Now includes the OTP in the event
    event OtpGenerated(string beneficiaryMobile, uint256 otp, uint256 amount);

    // Constructor
    constructor() Ownable(msg.sender) {}

    // Add a new beneficiary
    function addBeneficiary(
        string memory _name,
        string memory _mobileNumber
    ) external {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(
            bytes(_mobileNumber).length > 0,
            "Mobile number cannot be empty"
        );
        require(
            !beneficiaries[msg.sender][_mobileNumber].exists,
            "Beneficiary already exists"
        );

        beneficiaries[msg.sender][_mobileNumber] = Beneficiary(
            _name,
            _mobileNumber,
            true
        );
        sponsorBeneficiaries[msg.sender].push(_mobileNumber);

        emit BeneficiaryAdded(msg.sender, _mobileNumber, _name);
    }

    // Create a sponsorship
    function createSponsorship(
        string memory _beneficiaryMobile,
        uint256 _amount,
        Category _category
    ) external {
        require(
            beneficiaries[msg.sender][_beneficiaryMobile].exists,
            "Beneficiary not registered"
        );
        require(_amount > 0, "Amount must be greater than 0");

        require(
            usdcToken.transferFrom(msg.sender, address(this), _amount),
            "USDC transfer failed"
        );

        uint256 sponsorshipId = nextSponsorshipId++;
        sponsorships[sponsorshipId] = Sponsorship(
            msg.sender,
            _beneficiaryMobile,
            _amount,
            _category,
            false
        );
        beneficiarySponsorships[_beneficiaryMobile].push(sponsorshipId);

        emit SponsorshipCreated(
            sponsorshipId,
            msg.sender,
            _beneficiaryMobile,
            _amount,
            _category
        );
    }

    // Register a merchant
    function registerMerchant(
        string memory _businessName,
        Category _category
    ) external {
        require(
            bytes(_businessName).length > 0,
            "Business name cannot be empty"
        );

        merchants[msg.sender] = Merchant(_businessName, _category, true);

        emit MerchantRegistered(msg.sender, _businessName, _category);
    }

    // Generate OTP (simplified for hackathon)
    function requestPayment(
        string memory _beneficiaryMobile,
        uint256 _amount
    ) external returns (uint256) {
        require(merchants[msg.sender].registered, "Merchant not registered");
        require(_amount > 0, "Amount must be greater than 0");

        uint256[] memory sponsorshipIds = beneficiarySponsorships[
            _beneficiaryMobile
        ];
        require(
            sponsorshipIds.length > 0,
            "No sponsorships found for beneficiary"
        );

        // Generate a 4-digit OTP
        uint256 otp = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    _beneficiaryMobile,
                    _amount,
                    msg.sender
                )
            )
        ) % 10000;

        // Set the OTP and expiration (15 seconds)
        otps[_beneficiaryMobile] = otp;
        otpExpiry[_beneficiaryMobile] = block.timestamp + 15;

        // Emit event with OTP included
        emit OtpGenerated(_beneficiaryMobile, otp, _amount);

        return otp;
    }

    // Process payment with OTP
    function processPayment(
        string memory _beneficiaryMobile,
        uint256 _amount,
        uint256 _otp
    ) external {
        require(merchants[msg.sender].registered, "Merchant not registered");
        require(_amount > 0, "Amount must be greater than 0");
        require(otps[_beneficiaryMobile] == _otp, "Invalid OTP");
        require(
            block.timestamp <= otpExpiry[_beneficiaryMobile],
            "OTP has expired"
        );

        uint256[] memory sponsorshipIds = beneficiarySponsorships[
            _beneficiaryMobile
        ];

        uint256 sponsorshipId = 0;
        for (uint256 i = 0; i < sponsorshipIds.length; i++) {
            Sponsorship storage sponsorship = sponsorships[sponsorshipIds[i]];

            if (
                !sponsorship.used &&
                sponsorship.amount >= _amount &&
                sponsorship.category == merchants[msg.sender].category
            ) {
                sponsorshipId = sponsorshipIds[i];
                break;
            }
        }

        require(sponsorshipId > 0, "No valid sponsorship found");

        Sponsorship storage sponsorship = sponsorships[sponsorshipId];

        if (sponsorship.amount == _amount) {
            sponsorship.used = true;
        } else {
            sponsorship.amount -= _amount;
        }

        require(
            usdcToken.transfer(msg.sender, _amount),
            "USDC transfer failed"
        );

        // Clear OTP data after use
        delete otps[_beneficiaryMobile];
        delete otpExpiry[_beneficiaryMobile];

        emit PaymentProcessed(
            msg.sender,
            _beneficiaryMobile,
            _amount,
            sponsorshipId
        );
    }

    function getBeneficiaries(
        address _sponsor
    ) external view returns (string[] memory) {
        return sponsorBeneficiaries[_sponsor];
    }

    function getBeneficiaryDetails(
        address _sponsor,
        string memory _mobileNumber
    ) external view returns (string memory) {
        require(
            beneficiaries[_sponsor][_mobileNumber].exists,
            "Beneficiary not found"
        );
        return beneficiaries[_sponsor][_mobileNumber].name;
    }

    function getSponsorships(
        string memory _beneficiaryMobile
    ) external view returns (uint256[] memory) {
        return beneficiarySponsorships[_beneficiaryMobile];
    }

    function getOtp(
        string memory _beneficiaryMobile
    ) external view returns (uint256, uint256) {
        return (otps[_beneficiaryMobile], otpExpiry[_beneficiaryMobile]);
    }
}
