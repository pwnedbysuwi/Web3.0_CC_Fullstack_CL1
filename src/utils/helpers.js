import { Contract } from "@ethersproject/contracts";
import { abis } from "@my-app/contracts";
import { useCall } from "@usedapp/core";
import { parseUnits } from "ethers/lib/utils";
import { useEffect } from "react";

import { ROUTER_ADDRESS } from "../config";

// Returns a map of token addresses to token names from pools
export const getAvailableTokens = (pools) =>
  pools.reduce((acc, pool) => {
    acc[pool.token0Address] = pool.token0Name;
    acc[pool.token1Address] = pool.token1Name;
    return acc;
  }, {});

// Returns a map of counterpart tokens for a given token from pools
export const getCounterpartTokens = (pools, fromToken) => 
  pools.reduce((acc, pool) => {
    if (pool.token0Address === fromToken) {
      acc[pool.token1Address] = pool.token1Name;
    } else if (pool.token1Address === fromToken) {
      acc[pool.token0Address] = pool.token0Name;
    }
    return acc;
  }, {});

// Finds a pool by matching token addresses (either direction)
export const findPoolByTokens = (pools, fromToken, toToken) => {
  if (!Array.isArray(pools) || !fromToken || !toToken) return undefined;

  return pools.find(pool =>
    (pool.token0Address === fromToken && pool.token1Address === toToken) ||
    (pool.token1Address === fromToken && pool.token0Address === toToken)
  );
};

// Checks if an operation is pending (either signature or mining)
export const isOperationPending = (operationState) => 
  operationState.status === "PendingSignature" || operationState.status === "Mining";

// Checks if an operation has failed
export const isOperationFailed = (operationState) =>
  operationState.status === "Fail" || operationState.status === "Exception";

// Checks if an operation has succeeded
export const isOperationSucceeded = (operationState) =>
  operationState.status === "Success";

// Returns a failure message based on operation states (approval or execution)
export const getFailureMessage = (swapApproveState, swapExecuteState) => {
  if (isOperationPending(swapApproveState) || isOperationPending(swapExecuteState)) {
    return undefined;
  }

  if (isOperationFailed(swapApproveState)) {
    return `Approval failed - ${swapApproveState.errorMessage}`;
  }

  if (isOperationFailed(swapExecuteState)) {
    return `Swap failed - ${swapExecuteState.errorMessage}`;
  }

  return undefined;
};

// Returns a success message based on operation states (approval or execution)
export const getSuccessMessage = (swapApproveState, swapExecuteState) => {
  if (isOperationPending(swapExecuteState) || isOperationPending(swapApproveState)) {
    return undefined;
  }

  if (isOperationSucceeded(swapExecuteState)) {
    return "Swap executed successfully";
  }

  if (isOperationSucceeded(swapApproveState)) {
    return "Approval successful";
  }

  return undefined;
};

// Hook to fetch the output amount for a given pair of tokens and input amount
export const useAmountsOut = (pairAddress, amountIn, fromToken, toToken) => {
  const isValidAmountIn = amountIn.gt(parseUnits("0"));
  const areParamsValid = pairAddress && isValidAmountIn && fromToken && toToken;

  const { error, value } = useCall(
    areParamsValid ? {
      contract: new Contract(ROUTER_ADDRESS, abis.router02),
      method: "getAmountsOut",
      args: [amountIn, [fromToken, toToken]],
    } : {}
  ) ?? {};

  return error ? parseUnits("0") : value?.amounts[1];
}

// Custom hook to detect clicks outside of a referenced element
export const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const handleOutsideClick = (event) => {
      // If click is inside the referenced element or its descendants, do nothing
      if (ref.current && ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [ref, handler]);
};
