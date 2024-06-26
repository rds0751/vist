import { rawEncode, rawDecode } from 'ethereumjs-abi';
import Engine from '../core/Engine';
import { strings } from '../../locales/i18n';
import { safeToChecksumAddress } from './address';
import { ChainType, util, addHexPrefix, toChecksumAddress, BN } from 'vistawallet-core';
import { getChainIdByType, getTickerByType, hexToBN } from './number';
import { callSqlite } from './ControllerUtils';

export const TOKEN_METHOD_TRANSFER = 'transfer';
export const TOKEN_METHOD_APPROVE = 'approve';
export const TOKEN_METHOD_TRANSFER_FROM = 'transferfrom';
export const CONTRACT_METHOD_DEPLOY = 'deploy';
export const CONNEXT_METHOD_DEPOSIT = 'connextdeposit';

export const SEND_ETHER_ACTION_KEY = 'sentEther';
export const DEPLOY_CONTRACT_ACTION_KEY = 'deploy';
export const APPROVE_ACTION_KEY = 'approve';
export const SEND_TOKEN_ACTION_KEY = 'transfer';
export const TRANSFER_FROM_ACTION_KEY = 'transferfrom';
export const UNKNOWN_FUNCTION_KEY = 'unknownFunction';
export const SMART_CONTRACT_INTERACTION_ACTION_KEY = 'smartContractInteraction';
export const SWAPS_TRANSACTION_ACTION_KEY = 'swapsTransaction';

export const TRANSFER_FUNCTION_SIGNATURE = '0xa9059cbb';
export const TRANSFER_FROM_FUNCTION_SIGNATURE = '0x23b872dd';
export const SAFE_TRANSFER_FROM_FUNCTION_SIGNATURE = '0xf242432a';
export const APPROVE_FUNCTION_SIGNATURE = '0x095ea7b3';
export const CONTRACT_CREATION_SIGNATURE = '0x60a060405260046060527f48302e31';
export const POLYGON_ERC20_WITHDRAW_FUNCTION_SIGNATURE = '0x2e1a7d4d';

export const METHOD_ENS_SETTEXT = '0x10f13a8c';

export const TRANSACTION_TYPES = {
	SENT: 'transaction_sent',
	SENT_TOKEN: 'transaction_sent_token',
	SENT_COLLECTIBLE: 'transaction_sent_collectible',
	RECEIVED: 'transaction_received',
	RECEIVED_TOKEN: 'transaction_received_token',
	RECEIVED_COLLECTIBLE: 'transaction_received_collectible',
	SITE_INTERACTION: 'transaction_site_interaction',
	APPROVE: 'transaction_approve'
};

/**
 * Object containing all known action keys, to be used in transaction review
 */
const reviewActionKeys = {
	[SEND_TOKEN_ACTION_KEY]: strings('transactions.tx_review_transfer'),
	[SEND_ETHER_ACTION_KEY]: strings('transactions.tx_review_confirm'),
	[DEPLOY_CONTRACT_ACTION_KEY]: strings('transactions.tx_review_contract_deployment'),
	[TRANSFER_FROM_ACTION_KEY]: strings('transactions.tx_review_transfer_from'),
	[SMART_CONTRACT_INTERACTION_ACTION_KEY]: strings('transactions.tx_review_unknown'),
	[APPROVE_ACTION_KEY]: strings('transactions.tx_review_approve')
};

/**
 * Object containing all known action keys, to be used in transactions list
 */
const actionKeys = {
	[SEND_TOKEN_ACTION_KEY]: strings('transactions.sent_tokens'),
	[TRANSFER_FROM_ACTION_KEY]: strings('transactions.sent_collectible'),
	[DEPLOY_CONTRACT_ACTION_KEY]: strings('transactions.contract_deploy'),
	[SMART_CONTRACT_INTERACTION_ACTION_KEY]: strings('transactions.smart_contract_interaction'),
	[SWAPS_TRANSACTION_ACTION_KEY]: strings('transactions.swaps_transaction'),
	[APPROVE_ACTION_KEY]: strings('transactions.approve')
};

/**
 * Generates transfer data for specified method
 *
 * @param {String} type - Method to use to generate data
 * @param {Object} opts - Optional asset parameters
 * @returns {String} - String containing the generated transfer data
 */
export function generateTransferData(type, opts) {
	if (!type) {
		throw new Error('[transactions] type must be defined');
	}
	switch (type) {
		case 'transfer':
			if (!opts.toAddress || !opts.amount) {
				throw new Error(`[transactions] 'toAddress' and 'amount' must be defined for 'type' transfer`);
			}
			return (
				TRANSFER_FUNCTION_SIGNATURE +
				Array.prototype.map
					.call(rawEncode(['address', 'uint256'], [opts.toAddress, addHexPrefix(opts.amount)]), x =>
						('00' + x.toString(16)).slice(-2)
					)
					.join('')
			);
		case 'transferFrom':
			return (
				TRANSFER_FROM_FUNCTION_SIGNATURE +
				Array.prototype.map
					.call(
						rawEncode(
							['address', 'address', 'uint256'],
							[opts.fromAddress, opts.toAddress, addHexPrefix(opts.tokenId)]
						),
						x => ('00' + x.toString(16)).slice(-2)
					)
					.join('')
			);
		case 'safeTransferFrom':
			return (
				SAFE_TRANSFER_FROM_FUNCTION_SIGNATURE +
				Array.prototype.map
					.call(
						rawEncode(
							['address', 'address', 'uint256', 'uint256', 'bytes'],
							[
								opts.fromAddress,
								opts.toAddress,
								addHexPrefix(opts.tokenId),
								addHexPrefix(opts.value),
								opts.data
							]
						),
						x => ('00' + x.toString(16)).slice(-2)
					)
					.join('')
			);
	}
}

export function generateEnsSetAvatarData(node, value) {
	if (!node || !value) {
		throw new Error(`[setText] 'node' and 'value' must be defined`);
	}
	return (
		METHOD_ENS_SETTEXT +
		Array.prototype.map
			.call(rawEncode(['bytes32', 'string', 'string'], [node, 'avatar', value]), x =>
				('00' + x.toString(16)).slice(-2)
			)
			.join('')
	);
}

/**
 * Generates ERC20 approve data
 *
 * @param {object} opts - Object containing spender address and value
 * @returns {String} - String containing the generated approce data
 */
export function generateApproveData(opts) {
	if (!opts.spender || !opts.value) {
		throw new Error(`[transactions] 'spender' and 'value' must be defined for 'type' approve`);
	}
	return (
		APPROVE_FUNCTION_SIGNATURE +
		Array.prototype.map
			.call(rawEncode(['address', 'uint256'], [opts.spender, addHexPrefix(opts.value)]), x =>
				('00' + x.toString(16)).slice(-2)
			)
			.join('')
	);
}

export function decodeApproveData(data) {
	return {
		spenderAddress: addHexPrefix(data.substr(34, 40)),
		encodedAmount: data.substr(74, 138)
	};
}

/**
 * Decode transfer data for specified method data
 *
 * @param {String} type - Method to use to generate data
 * @param {String} data - Data to decode
 * @returns {Object} - Object containing the decoded transfer data
 */
export function decodeTransferData(type, data) {
	switch (type) {
		case 'transfer': {
			const encodedAddress = data.substr(10, 64);
			const encodedAmount = data.substr(74, 138);
			const bufferEncodedAddress = rawEncode(['address'], [addHexPrefix(encodedAddress)]);
			return [
				addHexPrefix(rawDecode(['address'], bufferEncodedAddress)[0]),
				parseInt(encodedAmount, 16).toString(),
				encodedAmount
			];
		}
		case 'transferFrom': {
			const encodedFromAddress = data.substr(10, 64);
			const encodedToAddress = data.substr(74, 64);
			const encodedTokenId = data.substr(138, 64);
			const bufferEncodedFromAddress = rawEncode(['address'], [addHexPrefix(encodedFromAddress)]);
			const bufferEncodedToAddress = rawEncode(['address'], [addHexPrefix(encodedToAddress)]);
			return [
				addHexPrefix(rawDecode(['address'], bufferEncodedFromAddress)[0]),
				addHexPrefix(rawDecode(['address'], bufferEncodedToAddress)[0]),
				parseInt(encodedTokenId, 16).toString()
			];
		}
	}
}

/**
 * Returns method data object for a transaction dat
 *
 * @param {string} data - Transaction data
 * @returns {object} - Method data object containing the name if is valid
 */
export async function getMethodData(data) {
	if (!data) {
		return false;
	}
	if (data.length < 10) return {};
	const fourByteSignature = data.substr(0, 10);
	if (fourByteSignature === TRANSFER_FUNCTION_SIGNATURE) {
		return { name: TOKEN_METHOD_TRANSFER };
	} else if (fourByteSignature === TRANSFER_FROM_FUNCTION_SIGNATURE) {
		return { name: TOKEN_METHOD_TRANSFER_FROM };
	} else if (fourByteSignature === APPROVE_FUNCTION_SIGNATURE) {
		return { name: TOKEN_METHOD_APPROVE };
	} else if (data.substr(0, 32) === CONTRACT_CREATION_SIGNATURE) {
		return { name: CONTRACT_METHOD_DEPLOY };
	}
	const { TransactionController } = Engine.context;
	// If it's a new method, use on-chain method registry
	try {
		const registryObject = await TransactionController.handleMethodData(fourByteSignature);
		if (registryObject) {
			return registryObject.parsedRegistryMethod;
		}
	} catch (e) {
		// Ignore and return empty object
	}
	return {};
}

export function isTokenMethodTransfer(data) {
	if (!data) {
		return false;
	}
	if (data.length < 10) return false;
	const fourByteSignature = data.substr(0, 10);
	return fourByteSignature === TRANSFER_FUNCTION_SIGNATURE;
}

export function isTokenMethodTransferFrom(data) {
	if (!data) {
		return false;
	}
	if (data.length < 10) return false;
	const fourByteSignature = data.substr(0, 10);
	return fourByteSignature === TRANSFER_FROM_FUNCTION_SIGNATURE;
}

export function isTokenMethodSafeTransferFrom(data) {
	if (!data) {
		return false;
	}
	if (data.length < 10) return false;
	const fourByteSignature = data.substr(0, 10);
	return fourByteSignature === SAFE_TRANSFER_FROM_FUNCTION_SIGNATURE;
}

export function isTokenMethodApprove(data) {
	if (!data) {
		return false;
	}
	if (data.length < 10) return false;
	const fourByteSignature = data.substr(0, 10);
	return fourByteSignature === APPROVE_FUNCTION_SIGNATURE;
}

export function equalMethodId(data, methodId) {
	if (!data) {
		return false;
	}
	if (data.length < 10) return false;
	const fourByteSignature = data.substr(0, 10);
	return fourByteSignature === '0x' + methodId;
}

export async function getSymbol(address, chainType) {
	if (!address) return null;
	address = toChecksumAddress(address);
	const token = await callSqlite('getStaticToken', chainType, address);
	if (token?.symbol) {
		return token.symbol;
	}
	const { AssetsController } = Engine.context;
	const allTokens = AssetsController.state.allTokens || {};
	const chainId = getChainIdByType(chainType);
	for (const key in allTokens) {
		const tokens = allTokens[key]?.[chainId] || [];
		const token = tokens.find(token => util.toLowerCaseEquals(address, token.address));
		if (token) {
			return token.symbol;
		}
	}
	return null;
}

/**
 * Returns wether the given address is a contract
 *
 * @param {string} address - Ethereum address
 * @returns {boolean} - Whether the given address is a contract
 */
export async function isSmartContractAddress(address, chainType) {
	if (!address) return false;
	address = toChecksumAddress(address);
	// If in contract map we don't need to cache it
	const token = await callSqlite('getStaticToken', chainType, address);
	if (token) {
		return Promise.resolve(true);
	}
	const { AssetsController } = Engine.context;
	const chainId = getChainIdByType(chainType);
	if (AssetsController.state.allSmartContract) {
		const contract = AssetsController.state.allSmartContract[chainId] || [];
		const sc = contract.find(sc => sc.address === address);
		if (sc) {
			return Promise.resolve(sc.isSmartContract);
		}
	}
	const { TransactionController } = Engine.context;
	try {
		const code = await TransactionController.getCode(chainType, address);
		const isSmartContract = util.isSmartContractCode(code);
		await AssetsController.addSmartContract(chainId, address, isSmartContract);
		return isSmartContract;
	} catch (e) {}
	return false;
}

/**
 * Returns corresponding transaction action key
 *
 * @param {object} transaction - Transaction object
 * @returns {string} - Corresponding transaction action key
 */
export async function getTransactionActionKey(transaction) {
	const { transaction: { data, to } = {} } = transaction;
	if (!to) return CONTRACT_METHOD_DEPLOY;
	let ret;
	// if data in transaction try to get method data
	if (data && data !== '0x') {
		const methodData = await getMethodData(data);
		const { name } = methodData;
		if (name) return name;
	}
	const toSmartContract =
		transaction.toSmartContract !== undefined ? transaction.toSmartContract : await isSmartContractAddress(to);
	if (toSmartContract) {
		// There is no data or unknown method data, if is smart contract
		ret = SMART_CONTRACT_INTERACTION_ACTION_KEY;
	} else {
		// If there is no data and no smart contract interaction
		ret = SEND_ETHER_ACTION_KEY;
	}
	return ret;
}

/**
 * Returns corresponding transaction function type
 *
 * @param {object} tx - Transaction object
 * @returns {string} - Transaction function type
 */
export async function getTransactionReviewActionKey(transaction) {
	const actionKey = await getTransactionActionKey({ transaction });
	const transactionReviewActionKey = reviewActionKeys[actionKey];
	if (transactionReviewActionKey) {
		return transactionReviewActionKey;
	}
	return actionKey;
}

/**
 * Returns corresponding ticker, defined or ETH
 *
 * @returns {string} - Corresponding ticker or ETH
 * @param ticker
 * @param type
 */
export function getTicker(ticker, type = ChainType.Ethereum) {
	return ticker || getTickerByType(type);
}

/**
 * Select the correct tx recipient name from available data
 *
 * @param {object} config
 * @param {object} config.addressBook - Object of address book entries
 * @param {string} config.network - network id
 * @param {string} config.toAddress - hex address of tx recipient
 * @param {object} config.identities - object of identities
 * @param {string} config.ensRecipient - name of ens recipient
 * @returns {string} - recipient name
 */
export function getTransactionToName({ addressBook, network, toAddress, identities, ensRecipient }) {
	if (ensRecipient) {
		return ensRecipient;
	}

	const networkAddressBook = addressBook[network];
	const checksummedToAddress = toChecksumAddress(toAddress);

	const transactionToName =
		(networkAddressBook &&
			networkAddressBook[checksummedToAddress] &&
			networkAddressBook[checksummedToAddress].name) ||
		(identities[checksummedToAddress] && identities[checksummedToAddress].name);

	return transactionToName;
}

/**
 * Validate transaction value for speed up or cancel transaction actions
 *
 * @param {object} transaction - Transaction object to validate
 * @param {string} rate - Rate to validate
 * @param {string} accounts - Map of accounts to information objects including balances
 * @returns {string} - Whether the balance is validated or not
 */
export function validateTransactionActionBalance(transaction, rate, accounts) {
	try {
		const checksummedFrom = safeToChecksumAddress(transaction.transaction.from);
		const balance = accounts[checksummedFrom].balance;
		return hexToBN(balance).lt(
			hexToBN(transaction.transaction.gasPrice)
				.mul(new BN(rate * 10))
				.div(new BN(10))
				.mul(hexToBN(transaction.transaction.gas))
				.add(hexToBN(transaction.transaction.value))
		);
	} catch (e) {
		return false;
	}
}

export function getNormalizedTxState(state) {
	return { ...state.transaction, ...state.transaction.transaction };
}
