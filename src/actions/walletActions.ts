import {appOperation} from '../appOperation';
import {logger, showError, showSuccess} from '../helper/logger';
import {
  GenerateAddressProps,
  WithdrawCurrencyProps,
  WithdrawInrProps,
} from '../helper/types';
import { transformCurrencyDataWithDistribution } from '../helper/utility';
import NavigationService from '../navigation/NavigationService';
import { Dashboard_Inner, DEPOSIT_SCREEN, WITHDRAW_SCREEN } from '../navigation/routes';
import {setLoading} from '../slices/authSlice';
import { setOpenOrders, clearOpenOrders } from '../slices/homeSlice';
import {
  setAdminBankDetails,
  setTradeHistory,
  clearTradeHistory,
  setTransactionHistory,
  setUserWallet,
  setWalletAddress,
  setWalletBalance,
  setWalletHistory,
  clearWalletHistory,
  setDepositHistory,
  setWithdrawHistory,
  setCoinDetails,
  setWalletBalanceMain,
  setWalletBalanceSpot,
  setWalletBalanceSwap,
  setWalletBalanceEarning,
  setDepositActiveCoins,
  setDepositFiatCoins,
  setWithdrawActiveCoins,
  setUserMainWallet,
  setPackageList,
  setWalletTypes,
  setParticularCoinBalance,
  setUserPayoutList,
  setEarnWalletBal,
  setSubscribedPackageList,
  setSubscribedActivePackages,
  setSubscribedCompletePackages,
  setSubscribedCancelPackages,
  setBotPackageList,
  setBotActiveList,
  setBotTradeData,
  setTotalProfit,
  setWalletBalanceArbitrage,
  setUserSpotWallet,
  setUserEarningWallet,
  setUserArbitrageWallet,
  setUserSwapWallet,
  setEarningPortfolio,
  setEarningPortfolioSummary,
  setAdminTradeList,
  clearAdminTradeList,
  setSwapHistoryList,
  clearSwapHistoryList,
  setInteralWalletHistory,
  clearInteralWalletHistory,
  setSwapCurrencyList,
  setSwapConversionRate,
  setUserFuturesWallet,
  setUserOptionsWallet,
  setWalletBalanceFutures,
  setWalletBalanceOptions
} from '../slices/walletSlice';
import {AppDispatch} from '../store/store';

const useGlobalLoader = (opts?: { useGlobalLoader?: boolean }) => opts?.useGlobalLoader !== false;

export const getUserPortfolio = (id: any, options?: { useGlobalLoader?: boolean }) => async (dispatch: AppDispatch) => {
  if (useGlobalLoader(options)) dispatch(setLoading(true));
  try {
    const response: any = await appOperation.customer.user_portfolio(id);
    if (response.success) {
      dispatch(setWalletBalance(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    if (useGlobalLoader(options)) dispatch(setLoading(false));
  }
};

export const getUserPortfolioMain = (id: any, options?: { useGlobalLoader?: boolean }) => async (dispatch: AppDispatch) => {
  try {
    if (useGlobalLoader(options)) dispatch(setLoading(true));
    const response: any = await appOperation.customer.user_portfolio(id);
    if (response.success) {
      dispatch(setWalletBalanceMain(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    if (useGlobalLoader(options)) dispatch(setLoading(false));
  }
};

export const getUserPortfolioSpot = (id: any, options?: { useGlobalLoader?: boolean }) => async (dispatch: AppDispatch) => {
  try {
    if (useGlobalLoader(options)) dispatch(setLoading(true));
    const response: any = await appOperation.customer.user_portfolio(id);
    if (response.success) {
      dispatch(setWalletBalanceSpot(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    if (useGlobalLoader(options)) dispatch(setLoading(false));
  }
};

export const getUserPortfolioSwap = (id: any, options?: { useGlobalLoader?: boolean }) => async (dispatch: AppDispatch) => {
  try {
    if (useGlobalLoader(options)) dispatch(setLoading(true));
    const response: any = await appOperation.customer.user_portfolio(id);
    if (response.success) {
      dispatch(setWalletBalanceSwap(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    if (useGlobalLoader(options)) dispatch(setLoading(false));
  }
};

export const getUserPortfolioEarning = (id: any, options?: { useGlobalLoader?: boolean }) => async (dispatch: AppDispatch) => {
  try {
    if (useGlobalLoader(options)) dispatch(setLoading(true));
    const response: any = await appOperation.customer.user_portfolio(id);
    if (response.success) {
      dispatch(setWalletBalanceEarning(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    if (useGlobalLoader(options)) dispatch(setLoading(false));
  }
};

export const getUserPortfolioArbitrage = (id: any, options?: { useGlobalLoader?: boolean }) => async (dispatch: AppDispatch) => {
  try {
    if (useGlobalLoader(options)) dispatch(setLoading(true));
    const response: any = await appOperation.customer.user_portfolio(id);
    if (response.success) {
      dispatch(setWalletBalanceArbitrage(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    if (useGlobalLoader(options)) dispatch(setLoading(false));
  }
};

export const getUserPortfolioFutures = (id: any, options?: { useGlobalLoader?: boolean }) => async (dispatch: AppDispatch) => {
  try {
    if (useGlobalLoader(options)) dispatch(setLoading(true));
    const response: any = await appOperation.customer.user_portfolio(id);
    if (response.success) {
      dispatch(setWalletBalanceFutures(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    if (useGlobalLoader(options)) dispatch(setLoading(false));
  }
};

export const getUserPortfolioOptions = (id: any, options?: { useGlobalLoader?: boolean }) => async (dispatch: AppDispatch) => {
  try {
    if (useGlobalLoader(options)) dispatch(setLoading(true));
    const response: any = await appOperation.customer.user_portfolio(id);
    if (response.success) {
      dispatch(setWalletBalanceOptions(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    if (useGlobalLoader(options)) dispatch(setLoading(false));
  }
};

export const getDepositActiveCoins = (id: any) => async (dispatch: AppDispatch) => {
  try {
    const response: any = await appOperation.customer.deposit_active_coins();
    // console.log(response, "getUserPortfolioEarning");
    if (response.success) {
      dispatch(setDepositActiveCoins(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    
    dispatch(setLoading(false));
  }
};

export const getWithdrawActiveCoins = (id: any) => async (dispatch: AppDispatch) => {
  try {
    const response: any = await appOperation.customer.widthraw_active_coins();
    // console.log(response, "getUserPortfolioEarning");
    if (response.success) {
      dispatch(setWithdrawActiveCoins(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    
    dispatch(setLoading(false));
  }
};

export const getDepositFiatCoins = (id: any) => async (dispatch: AppDispatch) => {
  try {
    const response: any = await appOperation.customer.deposit_fiat_coins();
    // console.log(response, "getUserPortfolioEarning");
    if (response.success) {
      dispatch(setDepositFiatCoins(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    
    dispatch(setLoading(false));
  }
};

export const getAdminTrades = (skip: any, limit: any) => async (dispatch: AppDispatch) => {
  try {
    dispatch(clearAdminTradeList());
    dispatch(setLoading(true));
    const response: any = await appOperation.customer.admin_trades(skip, limit);
    if (response.success) {
      dispatch(setAdminTradeList(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    
    dispatch(setLoading(false));
  }
};

export const getqbsHistory = (skip: any, limit: any) => async (dispatch: AppDispatch) => {
  try {
    if (skip === 0) dispatch(clearSwapHistoryList());
    dispatch(setLoading(true));
    const response: any = await appOperation.customer.qbs_history(skip, limit);
    // console.log(response, "getqbsHistory");
    if (response.success) {
      dispatch(setSwapHistoryList(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    
    dispatch(setLoading(false));
  }
};

export const getTradeHistory = (skip: any, limit: any) => async (dispatch: AppDispatch) => {
  try {
    if (skip === 0) dispatch(clearTradeHistory());
    dispatch(setLoading(true));
    const response: any = await appOperation.customer.get_trade_history(skip, limit);
    // console.log(response, "getTradeHistory");
    if (response.success) {
      dispatch(setTradeHistory(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    
    dispatch(setLoading(false));
  }
};

export const getInteralWalletHistory = (skip: any, limit: any) => async (dispatch: AppDispatch) => {
  try {
    if (skip === 0) dispatch(clearInteralWalletHistory());
    dispatch(setLoading(true));
    const response: any = await appOperation.customer.interal_wallet_history(skip, limit);
    // console.log(response, "getInteralWalletHistory");
    if (response.success) {
      dispatch(setInteralWalletHistory(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    
    dispatch(setLoading(false));
  }
};





export const getUserWallet = (id: string | undefined) => async (dispatch: AppDispatch) => {
  try {
    // dispatch(setLoading(true));
    const response: any = await appOperation.customer.user_main_wallet(id);
    if (response.success) {
      const wallets = response?.data || [];

        // Parse balance to number and sort
        const walletsWithBalance = wallets
          .filter((wallet: { balance: string; }) => parseFloat(wallet.balance) > 0)
          .sort((a: { balance: string; }, b: { balance: string; }) => parseFloat(b.balance) - parseFloat(a.balance));

        let topWalletsList: any[] = [];

        if (walletsWithBalance.length >= 2) {
          topWalletsList = walletsWithBalance;
        } else {
          // Add existing non-zero wallets
          topWalletsList = [...walletsWithBalance];

          // Fill remaining with top wallets regardless of balance
          const remaining = 2 - topWalletsList.length;
          const walletsSorted = wallets
            .sort((a: { balance: string; }, b: { balance: string; }) => parseFloat(b.balance) - parseFloat(a.balance))
            .filter((w: { currency_id: any; }) => !topWalletsList.find(tw => tw.currency_id === w.currency_id));

          topWalletsList = topWalletsList.concat(walletsSorted.slice(0, remaining));
        }

        // setfundData(wallets);
        // if (currencyData?.length === 0) {
        //   setCurrencyData(wallets);
        //   setSelectedCurrency(wallets[0] || {})
        // }
        dispatch(setUserWallet(response?.data));
      // dispatch(setUserWallet(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    // dispatch(setLoading(false));
  }
};

export const getUserDifferentWallet = (id: any) => async (dispatch: AppDispatch) => {
  try {
    // dispatch(setLoading(true));
    const response: any = await appOperation.customer.user_main_wallet(id);
    if (response.success) {
      if (id === "main") {
        dispatch(setUserMainWallet(response?.data));
      } else if (id === "spot") {
        dispatch(setUserSpotWallet(response?.data));
      } else if (id === "swap") {
        dispatch(setUserSwapWallet(response?.data));
      } else if (id === "earning") {
        dispatch(setUserEarningWallet(response?.data));
      } else if (id === "arbitrage") {
        dispatch(setUserArbitrageWallet(response?.data));
      }
    }
  } catch (e) {
    logger(e);
  } finally {
    // dispatch(setLoading(false));
  }
};



export const getSwapCurrencyList = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const response: any = await appOperation.customer.swap_currency_list();
    if (response.success) {
        dispatch(setSwapCurrencyList(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    dispatch(setLoading(false));
  }
};

export const getConversionRate = (form: any, to: any) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const response: any = await appOperation.customer.get_conversion_rate(form, to);
    if (response.success) {
        dispatch(setSwapConversionRate(response?.data));
    }
  } catch (e) {
    logger(e);
    if (e?.code === 500) {
      dispatch(setSwapConversionRate({}));
    }
  } finally {
    dispatch(setLoading(false));
  }
};

export const getUserMainWallet = (id: any) => async (dispatch: AppDispatch) => {
  try {
    // dispatch(setLoading(true));
    const response: any = await appOperation.customer.user_main_wallet(id);
    if (response.success) {
        dispatch(setUserMainWallet(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    // dispatch(setLoading(false));
  }
};

export const getUserSpotWallet = (id: any) => async (dispatch: AppDispatch) => {
  try {
    // dispatch(setLoading(true));
    const response: any = await appOperation.customer.user_main_wallet(id);
    if (response.success) {
        dispatch(setUserSpotWallet(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    // dispatch(setLoading(false));
  }
};

export const getUserSwapWallet = (id: any) => async (dispatch: AppDispatch) => {
  try {
    // dispatch(setLoading(true));
    const response: any = await appOperation.customer.user_main_wallet(id);
    if (response.success) {
        dispatch(setUserSwapWallet(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    // dispatch(setLoading(false));
  }
};

export const getUserEarningWallet = (id: any) => async (dispatch: AppDispatch) => {
  try {
    // dispatch(setLoading(true));
    const response: any = await appOperation.customer.user_main_wallet(id);
    if (response.success) {
        dispatch(setUserEarningWallet(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    // dispatch(setLoading(false));
  }
};

  export const getUserArbitrageWallet = (id: any) => async (dispatch: AppDispatch) => {
    try {
      // dispatch(setLoading(true));
      const response: any = await appOperation.customer.user_main_wallet(id);
      // console.log(response, "getUserArbitrageWallet");
      if (response.success) {
          dispatch(setUserArbitrageWallet(response?.data));
      }
    } catch (e) {
      logger(e);
    } finally {
      // dispatch(setLoading(false));
    }
  };

export const getUserFuturesWallet = (id: any) => async (dispatch: AppDispatch) => {

  try {
    // dispatch(setLoading(true));
    const response: any = await appOperation.customer.user_main_wallet(id);
    // console.log(response, "getUserFuturesWallet");
    if (response.success) {
        dispatch(setUserFuturesWallet(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    // dispatch(setLoading(false));
  }
};

export const getUserOptionsWallet = (id: any) => async (dispatch: AppDispatch) => {
  try {
    // dispatch(setLoading(true));
    const response: any = await appOperation.customer.user_main_wallet(id);
    if (response.success) {
        dispatch(setUserOptionsWallet(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    // dispatch(setLoading(false));
  }
};
export const generateAddress =
  (data: GenerateAddressProps) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setWalletAddress(''));
      const response: any = await appOperation.customer.generate_address(data);

      if (response.success) {
        dispatch(setWalletAddress(response?.data));
      } else {
        showError(response?.message);
      }
    } catch (e) {
      logger(e);
    } finally {
      dispatch(setLoading(false));
    }
  };

  export const getParticularCoinBalance = (data: { fromWallet: any; toWallet: any; currencyId: any; }) => async (dispatch: AppDispatch) => {
    try {
      // dispatch(setLoading(true));
      const response: any = await appOperation.customer.particular_coin_balance(data);
      if (response.success) {
          dispatch(setParticularCoinBalance(response?.data));
      }
    } catch (e) {
      logger(e);
    } finally {
      // dispatch(setLoading(false));
    }
  };

  

export const withdrawCoin =
  (data: WithdrawCurrencyProps) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      const response: any = await appOperation.customer.withdraw_currency(data);
      // console.log('rs', response);

      if (response.success) {
        showError(response?.message);
        NavigationService.goBack();
      } else {
        showError(response?.message);
      }
    } catch (e) {
      logger(e);
      showError(e?.message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  export const withdrawFiatCoin =
  (data: WithdrawCurrencyProps) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      const response: any = await appOperation.customer.withdraw_fiat_currency(data);
      if (response.success) {
        showError(response?.message);
        NavigationService.goBack();
      } else {
        showError(response?.message);
      }
    } catch (e) {
      logger(e);
      showError(e?.message);
    } finally {
      dispatch(setLoading(false));
    }
  };

export const getAdminBankDetails = () => async (dispatch: AppDispatch) => {
  try {
    const response: any = await appOperation.customer.admin_bank_details();

    if (response.success) {
      dispatch(setAdminBankDetails(response?.data[0]));
    }
  } catch (e) {
    logger(e);
  }
};

export const depositInr = (data: FormData) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const response: any = await appOperation.customer.deposit_inr(data);

    if (response.success) {
      showError(response?.message);
      NavigationService.goBack();
    } else {
      showError(response?.message);
    }
  } catch (e) {
    logger(e);
    showError(e?.message);
  } finally {
    dispatch(setLoading(false));
  }
};
export const handleTranferCoin = (data: any, setVisible = (p0: boolean) => {}, setAmount = (p0: string) => {}) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const response: any = await appOperation.customer.tranfer_coin(data);

    if (response.success) {
      showError(response?.message);
      setVisible(true);
      setAmount('');
     dispatch(getUserDifferentWallet(data?.fromWallet));
     dispatch(getUserDifferentWallet(data?.toWallet));
    } else {
      showError(response?.message);
    }
  } catch (e) {
    logger(e);
    showError(e?.message);
  } finally {
    dispatch(setLoading(false));
  }
};


export const swapCurrency =
  (data: any, setVisible = (p0: boolean) => {}, setAmount = (p0: string) => {}) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      const response = await appOperation.customer.qs_BuySell(data);
      if (response?.success) {
        showError(response?.message);
        dispatch(getSwapCurrencyList());
        setVisible(true);
      setAmount('');
        // dispatch(getTransactionHistory());
      } else {
        // dispatch(setConversion(''));
        showError(response?.message);
      }
    } catch (e) {
      showError(e?.message);
    } finally {
      dispatch(setLoading(false));
    }
  };

export const getWalletHistory = (skip: any, limit: any) => async (dispatch: AppDispatch) => {
  try {
    if (skip === 0) dispatch(clearWalletHistory());
    dispatch(setLoading(true));
    const response: any = await appOperation.customer.wallet_history(skip, limit);
    // console.log(response, 'getWalletHistory');
    if (response.success) {
      dispatch(setWalletHistory(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    dispatch(setLoading(false));
  }
};

export const getOpenOrders = (skip: any, limit: any) => async (dispatch: AppDispatch) => {
  try {
    if (skip === 0) dispatch(clearOpenOrders());
    dispatch(setLoading(true));
    const response: any = await appOperation.customer.all_open_orders(skip, limit);
    if (response.success) {
      dispatch(setOpenOrders(response?.data));
    }
  } catch (e) {
    logger(e);
  } finally {
    dispatch(setLoading(false));
  }
};

// export const getTradeHistory = (data:any) => async (dispatch: AppDispatch) => {
//   try {
//     // dispatch(setLoading(true));
//     const response: any = await appOperation.customer.trade_history(data);

//     if (response.success) {
//       dispatch(setTradeHistory(response?.data));
//     }
//   } catch (e) {
//     logger(e);
//   } finally {
//     // dispatch(setLoading(false));
//   }
// };

export const verifyDeposit = (data: any) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const response: any = await appOperation.customer.deposit_verify(data);
    if (response?.success) {
      if (response?.message === "New Transactions Fetched") {
        showError("New deposit fetched");
        // depositHistory("showModal")
        if (data?.status === "checkPayment") {
          // setCheckDepositStatus(false)
          appOperation.customer.transfer_funds(response?.data)
        }
      } else {
        if (data?.status === "checkPayment") {
          showError("New deposit not found. Please check after some time.");
        }
      }
    }
   
  } catch (e) {
    logger(e);
  } finally {
    dispatch(setLoading(false));
  }
};

export const verifyWithdraw = (data: any) => async (dispatch: AppDispatch) => {
  try {
    // dispatch(setLoading(true));
    const response: any = await appOperation.customer.verify_withdraw(data);
    // console.log(response, '===verifyWithdraw');
    if (response?.success) {
      dispatch(setWithdrawHistory(response?.data));
    }
  } catch (e) {
    logger(e);
    showError(e?.message);
  } finally {
    // dispatch(setLoading(false));
  }
};

export const subscribeEarningPackage = (data: any, setVisible =(p0: boolean) => {}) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const response: any = await appOperation.customer.subscribe_earning_package(data);
    // console.log(response, '===verifyWithdraw');
    if (response?.success) {
      showError(response?.message);
      setVisible(true);
      dispatch(getEarningPortfolio());
      dispatch(getSubscribedPackageList());
      // dispatch(setWithdrawHistory(response?.data));
    }
  } catch (e) {
    logger(e);
    showError(e?.message);
  } finally {
    dispatch(setLoading(false));
  }
};

export const butBotPackage = (data: any) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const response: any = await appOperation.customer.buy_bot_package(data);
    // console.log(response, '===verifyWithdraw');
    if (response?.success) {
      showError(response?.message);
      NavigationService.navigate(Dashboard_Inner);
    }
  } catch (e) {
    logger(e);
    showError(e?.message);
  } finally {
    dispatch(setLoading(false));
  }
};

export const withdrawInr =
  (data: WithdrawInrProps) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      const response: any = await appOperation.customer.withdraw_inr(data);
      // console.log('res', response);
      showError(response?.message);
      if (response?.success) {
        NavigationService.goBack();
      }
    } catch (e) {
      logger(e);
      showError(e?.message);
    } finally {
      dispatch(setLoading(false));
    }
  };

export const getTransactionHistory =
  (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      const response: any = await appOperation.customer.transaction_history(id);

      if (response.success) {
        dispatch(setTransactionHistory(response?.data));
      }
    } catch (e) {
      logger(e);
    } finally {
      dispatch(setLoading(false));
    }
  };

  export const getBotActivePackages =
  () => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      const response: any = await appOperation.customer.get_bot_active_packages();

      if (response.success) {
        dispatch(setBotActiveList(response?.data[0]));
        if (response?.data?.length > 0){
          NavigationService.navigate(Dashboard_Inner)
        }
        
      }
    } catch (e) {
      logger(e);
    } finally {
      dispatch(setLoading(false));
    }
  };

  export const getBotTrades =
  () => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      const response: any = await appOperation.customer.get_bot_trade();

      if (response.success) {
        dispatch(setBotTradeData(response?.data));
        const total = response?.data.reduce((sum: any, trade: any) => {
          const profit = parseFloat(trade.profit) || 0;
          return sum + profit;
      }, 0);
      dispatch(setTotalProfit(total?.toFixed(2) || 0) );
      }
    } catch (e) {
      logger(e);
    } finally {
      dispatch(setLoading(false));
    }
  };

  

  export const getCoinDetails =
  (data: any, type: any, balance: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      const response: any = await appOperation.customer.coin_details(data);
      if (response.success) {
        dispatch(setCoinDetails(response?.data));
        if(type == "deposit") {
if (response?.data?.deposit_status === 'ACTIVE') {
            NavigationService.navigate(DEPOSIT_SCREEN, {walletDetail: response?.data});
        } else {
          showError('Deposit is Disable for Now');
        }
        } else if (type == "withdraw") {
          if (response?.data?.withdrawal_status === 'ACTIVE') {

         NavigationService.navigate(WITHDRAW_SCREEN, {walletDetail: response?.data, balance: balance});
    }else {
      showError('Withdrawal is Disable for Now');
    }
        }
        
      }
    } catch (e) {
      logger(e);
    } finally {
      dispatch(setLoading(false));
    }
  };


  export const getPackageList = () => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response: any = await appOperation.customer.package_list();
      if (response.success) {
        if (!response?.data || response?.data?.length === 0) {
          dispatch(setPackageList([]));
          return;
        } else {
          const transformed = transformCurrencyDataWithDistribution(response?.data);
          dispatch(setPackageList(transformed));
        }
        
        // console.log(filteredPackageList, "filteredPackageList");
      }
    } catch (e) {
      logger(e);
    } finally {
      dispatch(setLoading(false));
    }
  };

  export const getBotPackageList = () => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response: any = await appOperation.customer.bot_package_list();
      if (response.success) {
        dispatch(setBotPackageList(response?.data));
      }
    } catch (e) {
      logger(e);
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Per-user earning payout rows (EarningBalance table).
   * Current backend returns **404** for `GET /v1/earning/user-payout-list` (route not registered).
   * Calling it only spammed `[API] Non-JSON error response` and did not populate data.
   * When the backend exposes this route, restore the fetch below using `appOperation.customer.user_payout_list()`.
   */
  export const getUserPayList = () => async (dispatch: AppDispatch) => {
    dispatch(setUserPayoutList([]));
    // try {
    //   dispatch(setLoading(true));
    //   const response: any = await appOperation.customer.user_payout_list();
    //   if (response.success) dispatch(setUserPayoutList(response?.data ?? []));
    // } catch (e) {
    //   logger(e);
    //   dispatch(setUserPayoutList([]));
    // } finally {
    //   dispatch(setLoading(false));
    // }
  };

  export const getEarningPortfolio = () => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response: any = await appOperation.customer.earning_portfolio();
      if (response.success) {
        dispatch(setEarningPortfolio(response?.data));
      }
    } catch (e) {
      logger(e);
    } finally {
      dispatch(setLoading(false));
    }
  };

  export const getEarningPortfolioSummary = () => async (dispatch: AppDispatch) => {
    try {
      const response: any = await appOperation.customer.earning_portfolio_summary();
      if (response?.success) {
        dispatch(setEarningPortfolioSummary(response?.data));
      }
    } catch (e) {
      logger(e);
    }
  };

  /** Same as web `Earning/index.js` — backend may send mixed casing or alternate cancel strings. */
  const normalizeSubscriptionStatus = (status: unknown) =>
    String(status ?? '')
      .trim()
      .toUpperCase();

  const isCancelledSubscriptionStatus = (status: unknown) => {
    const s = normalizeSubscriptionStatus(status);
    return s === 'CANCELLED' || s === 'CANCELED' || s.includes('CANCEL');
  };

  /** Backend may return a bare array or paginated wrapper — normalize to rows[]. */
  const normalizeSubscribedPackageRows = (raw: unknown): any[] => {
    if (Array.isArray(raw)) return raw;
    if (raw == null || typeof raw !== 'object') return [];
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.list)) return o.list as any[];
    if (Array.isArray(o.data)) return o.data as any[];
    if (Array.isArray(o.items)) return o.items as any[];
    if (Array.isArray(o.records)) return o.records as any[];
    if (Array.isArray(o.subscriptions)) return o.subscriptions as any[];
    if (Array.isArray(o.rows)) return o.rows as any[];
    return [];
  };

  export const getSubscribedPackageList = () => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      /** Same query string shape as web (`skip`/`limit`); use limit 10 to match web pagination if needed. */
      const response: any = await appOperation.customer.subscribed_packageList(0, 10);
      const raw = response?.data ?? response?.result ?? response;
      const data = normalizeSubscribedPackageRows(raw);

      if (__DEV__) {
        const rawObj = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null;
        console.log('[Earning] subscribed-package-list response:', {
          success: response?.success,
          httpCode: response?.code,
          message: response?.message,
          normalizedRowCount: data.length,
          rawDataWasArray: Array.isArray(response?.data),
          rawTopKeys: rawObj ? Object.keys(rawObj).slice(0, 15) : [],
          distinctStatuses: [...new Set(data.map((r: { status?: string }) => String(r?.status ?? '')))].filter(Boolean).slice(0, 12),
        });
      }

      if (response.success) {
        const completedPackage = data.filter(
          (item: { status?: string }) => normalizeSubscriptionStatus(item?.status) === 'COMPLETED',
        );
        const activePackage = data.filter(
          (item: { status?: string }) => normalizeSubscriptionStatus(item?.status) === 'ACTIVE',
        );
        const cancelledPackage = data.filter((item: { status?: string }) =>
          isCancelledSubscriptionStatus(item?.status),
        );
        if (__DEV__) {
          console.log('[Earning] subscribed split:', {
            active: activePackage.length,
            completed: completedPackage.length,
            cancelled: cancelledPackage.length,
          });
        }
        dispatch(setSubscribedActivePackages(activePackage));
        dispatch(setSubscribedCompletePackages(completedPackage));
        dispatch(setSubscribedCancelPackages(cancelledPackage));
      } else if (__DEV__) {
        console.warn('[Earning] subscribed-package-list skipped dispatch — success was not true');
      }
    } catch (e) {
      logger(e);
      if (__DEV__) {
        console.warn('[Earning] subscribed-package-list threw:', e);
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  /** Web `AuthService.cancelEarningSubscription` — refresh lists like web after success */
  export const cancelEarningSubscription =
    (stakingId: string, currency?: string) => async (dispatch: AppDispatch) => {
      dispatch(setLoading(true));
      try {
        const response: any = await appOperation.customer.cancel_earning_subscription(stakingId);
        if (response?.success) {
          const d = response?.data || {};
          let msg = response?.message || 'Plan cancelled successfully.';
          if (d.refundAmount != null && currency) {
            const amt =
              typeof d.refundAmount === 'object' && (d.refundAmount as any)?.$numberDecimal != null
                ? parseFloat((d.refundAmount as any).$numberDecimal)
                : Number(d.refundAmount);
            if (Number.isFinite(amt)) {
              msg += ` Refund: ${amt.toLocaleString(undefined, { maximumFractionDigits: 9 })} ${currency}.`;
            }
          }
          showSuccess(msg);
          await dispatch(getSubscribedPackageList());
          await dispatch(getEarningPortfolio());
          await dispatch(getEarningPortfolioSummary());
        } else {
          showError(response?.message || 'Could not cancel this plan.');
        }
      } catch (e: any) {
        logger(e);
        showError(e?.message || 'Could not cancel this plan.');
      } finally {
        dispatch(setLoading(false));
      }
    };

  /** Web `AuthService.getPerDayPayoutHistory` — used by Earning payout modal */
  export async function fetchPerDayPayoutHistory(userId: string, stakingId: string) {
    try {
      const response: any = await appOperation.customer.get_per_day_payout_history(userId, stakingId);
      if (response?.success) {
        const raw = response?.data?.payout_history || [];
        const sorted = [...raw].sort(
          (a: any, b: any) => (Number(a?.day) || 0) - (Number(b?.day) || 0),
        );
        return { ok: true as const, list: sorted, message: undefined as string | undefined };
      }
      return {
        ok: false as const,
        list: [] as any[],
        message: response?.message || 'Could not load payout history.',
      };
    } catch (e: any) {
      return { ok: false as const, list: [] as any[], message: e?.message || 'Could not load payout history.' };
    }
  }

  export const getWalletBalance = (fromWallet: any, currencyId: any) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response: any = await appOperation.customer.get_wallet_balance(fromWallet, currencyId);
      if (response.success) {
        dispatch(setEarnWalletBal(response?.data?.balance));
         dispatch(setLoading(false));
      }
    } catch (e) {
      logger(e);
    } finally {
      dispatch(setLoading(false));
    }
  };

  export const getWalletType = () => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response: any = await appOperation.customer.get_wallet_type();
      if (response.success) {
        dispatch(setWalletTypes(response?.data));
      }
    } catch (e) {
      logger(e);
    } finally {
      dispatch(setLoading(false));
    }
  };
