from eth_account import Account
from web3 import Web3

def private_key_to_address(private_key_hex):
    if len(private_key_hex) != 64:
        print("if")
        private_key_hex = private_key_hex.zfill(64)
        print(f'Adjusted Private Key: {private_key_hex}')
    print("pass")

    # Create an account object from the private key
    account = Account.from_key(private_key_hex)

    # Get the address from the account object
    address = account.address

    checksum_address = Web3.to_checksum_address(address)
    return checksum_address

# Define the start and end of the range
start_hex = 0x0000
end_hex = 0xFFFF

for i in range(start_hex, end_hex + 1):
    
    hex_string = f'{i:04X}'
    print(hex_string)

    # Example private key (hexadecimal string)
    private_key_hex = hex_string + 'a494fb3d7558dc85c332790c585be5dd68aef5488c7790dfa01af576c6cbcdd1'

    # Convert private key to address
    address = private_key_to_address(private_key_hex)
    print(address)
    if address == Web3.to_checksum_address('0x3B04710D175fB519F4977eD821d9aC27bdD07508'):
        break
