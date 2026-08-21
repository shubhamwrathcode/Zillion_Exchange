export const isCoboChainActive = (chain) => {
    if (!chain) return false;
    if (typeof chain === 'string') return true;
    if (chain.isActive != null) return Boolean(chain.isActive);
    if (chain.is_active != null) return Boolean(chain.is_active);
    if (chain.active != null) return Boolean(chain.active);
    if (chain.status != null) {
        const s = String(chain.status).toUpperCase();
        return s === 'ACTIVE' || s === 'TRUE' || s === '1' || s === 'SUCCESS';
    }
    return true;
};

export const filterActiveCoboChains = (list) => {
    if (!Array.isArray(list)) return [];
    return list.filter(isCoboChainActive);
};

export function networkKeysFromChain(chain) {
    if (chain == null) return [];
    if (Array.isArray(chain)) {
        return chain
            .map((c) => {
                if (typeof c === 'string' && c.trim()) return c.trim();
                if (c != null && typeof c === 'object' && !Array.isArray(c)) {
                    const k = c.chainId || Object.keys(c)[0];
                    return k || '';
                }
                return '';
            })
            .filter(Boolean);
    }
    if (typeof chain === 'object') {
        return Object.keys(chain);
    }
    return [];
}

/** Web DepositPage: deposit_status[chain] === "ACTIVE" or cobo_chain_list */
export function getActiveDepositChainKeys(item) {
    if (!item) return [];
    if (Array.isArray(item.cobo_chain_list) && item.cobo_chain_list.length > 0) {
        return filterActiveCoboChains(item.cobo_chain_list).map((c) => c?.chainId || c);
    }
    const keys = networkKeysFromChain(item.chain);
    const ds = item.deposit_status;
    if (typeof ds === 'string') {
        if (ds === 'SUSPENDED') return [];
        return keys;
    }
    if (ds && typeof ds === 'object' && !Array.isArray(ds)) {
        return keys.filter((k) => ds[k] === 'ACTIVE');
    }
    return keys;
}

/** Web WithdrawPage: withdrawal_status[chain] === "ACTIVE" or cobo_chain_list */
export function getActiveWithdrawChainKeys(item) {
    if (!item) return [];
    if (Array.isArray(item.cobo_chain_list) && item.cobo_chain_list.length > 0) {
        return filterActiveCoboChains(item.cobo_chain_list).map((c) => c?.chainId || c);
    }
    const keys = networkKeysFromChain(item.chain);
    const ws = item.withdrawal_status;
    if (typeof ws === 'string') {
        if (ws === 'SUSPENDED') return [];
        return keys;
    }
    if (ws && typeof ws === 'object' && !Array.isArray(ws)) {
        return keys.filter((k) => ws[k] === 'ACTIVE');
    }
    return keys;
}

/** Per-chain field or scalar (matches web getChainValue). */
export function valueForChain(coin, field, chainKey) {
    if (!coin) return undefined;
    const raw = coin[field];
    if (raw == null) return undefined;
    if (typeof raw === 'object' && !Array.isArray(raw) && chainKey && chainKey in raw) {
        return raw[chainKey];
    }
    if (typeof raw === 'string' || typeof raw === 'number') {
        return raw;
    }
    return undefined;
}

export function isDepositCoinDisabled(item) {
    if (!item) return true;
    if (Array.isArray(item.cobo_chain_list) && item.cobo_chain_list.length > 0) {
        return filterActiveCoboChains(item.cobo_chain_list).length === 0;
    }
    if (typeof item.deposit_status === 'string' && item.deposit_status === 'SUSPENDED') {
        return true;
    }
    return getActiveDepositChainKeys(item).length === 0;
}

export function isWithdrawCoinDisabled(item) {
    if (!item) return true;
    if (Array.isArray(item.cobo_chain_list) && item.cobo_chain_list.length > 0) {
        return filterActiveCoboChains(item.cobo_chain_list).length === 0;
    }
    if (typeof item.withdrawal_status === 'string' && item.withdrawal_status === 'SUSPENDED') {
        return true;
    }
    return getActiveWithdrawChainKeys(item).length === 0;
}

export function parseNum(v, fallback = 0) {
    if (v == null || v === '') return fallback;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
}

