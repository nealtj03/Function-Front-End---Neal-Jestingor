# FEU TECH ETHEREUM WALLET- Smart Contract and Frontend

This project consists of an Ethereum smart contract that functions as an ATM, allowing an owner to deposit and withdraw funds, and a React-based frontend that interacts with this contract.

## Overview

The smart contract includes 6 core functionalities, which are:

1. **Owner setup and initialization (constructor)**
2. **Balance retrieval (getBalance)**
3. **Depositing funds (deposit)**
4. **Withdrawing funds (withdraw)**
5. **Retrieving deposit records (getDeposits)**
6. **Retrieving withdrawal records (getWithdrawals)**

The frontend interacts with the smart contract, enabling users to connect their Ethereum wallet, deposit, withdraw, and view transaction history.

---

## Smart Contract Details

The smart contract is written in Solidity and implements the following core features:

### 1. Owner Setup and Initialization (constructor)

The contract is initialized with an owner's address and a balance, which is specified when the contract is deployed. The owner is the only one who can perform deposit and withdrawal actions.

```
constructor(uint initBalance) payable {
    owner = payable(msg.sender);
    balance = initBalance;
}
```

### 2. Balance Retrieval (getBalance)
The getBalance function allows the current balance of the contract to be retrieved. This balance represents the funds available for withdrawal.
```
function getBalance() public view returns(uint256) {
    return balance;
}
```

### 3. Depositing Funds (deposit)
The deposit function allows the owner to deposit funds into the contract. It updates the contract balance and records the transaction (amount and timestamp).
```
function deposit(uint256 _amount) public payable {
    require(msg.sender == owner, "You are not the owner of this account");
    balance += _amount;
    deposits.push(Transaction(_amount, block.timestamp));
    emit Deposit(_amount);
}
```

### 4. Withdrawing Funds (withdraw)
The withdraw function allows the owner to withdraw funds from the contract, provided the balance is sufficient. It also records the withdrawal transaction.
```
function withdraw(uint256 _withdrawAmount) public {
    require(msg.sender == owner, "You are not the owner of this account");
    if (balance < _withdrawAmount) {
        revert InsufficientBalance({
            balance: balance,
            withdrawAmount: _withdrawAmount
        });
    }
    balance -= _withdrawAmount;
    withdrawals.push(Transaction(_withdrawAmount, block.timestamp));
    emit Withdraw(_withdrawAmount);
}
```

### 5.Retrieving Deposit Records (getDeposits)
The getDeposits function returns an array of all deposits made, along with their timestamps and amounts.
```
function getDeposits() public view returns (Transaction[] memory) {
    return deposits;
}
```

### 6. Retrieving Withdrawal Records (getWithdrawals)
The getWithdrawals function returns an array of all withdrawals made, including their timestamps and amounts.
```
function getWithdrawals() public view returns (Transaction[] memory) {
    return withdrawals;
}
```

### EXECUTING THE PROGRAM
Do the following to get the code running on your computer.

1. Inside the project directory, in the terminal type: npm i
2. Open two additional terminals in your VS code
3. In the second terminal type: npx hardhat node
4. In the third terminal, type: npx hardhat run --network localhost scripts/deploy.js
5. Back in the first terminal, type npm run dev to launch the front-end.

After this, the project will be running on your localhost. 
Typically at http://localhost:3000/


### Author:
Neal Tracy D. Jestingor | 202111095@fit.edu.ph

### License
This project is licensed under the MIT License.

