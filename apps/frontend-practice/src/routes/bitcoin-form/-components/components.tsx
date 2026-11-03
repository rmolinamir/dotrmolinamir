import { Button } from "@acme/ui/components/button";
import { cn } from "@acme/ui/lib/utils";
import React from "react";
import {
  currency,
  currencyFormatter,
  decimalFormatter,
  decimalSeparator,
  removeGroupSeparators,
  removeNonDigits,
} from "./formatters";

type Money = {
  value: number;
  currency: string;
};

type BitcoinFormContextValue = {
  accountBalance: Money;
  bitcoinQuote: Money;
  btcAmount: number;
  feeAmount: number;
  purchaseAmount: number;
  purchaseFee: number;
  totalAmount: number;
  isValid: boolean;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
};

const BitcoinFormContext = React.createContext<BitcoinFormContextValue | null>(
  null,
);

type BitcoinFormProps = React.ComponentProps<"form"> &
  Pick<
    BitcoinFormContextValue,
    "accountBalance" | "bitcoinQuote" | "purchaseFee"
  >;

export function BitcoinForm({
  accountBalance,
  bitcoinQuote,
  purchaseFee,
  ...props
}: BitcoinFormProps) {
  const [value, setValue] = React.useState<string>("");

  const purchaseAmount = Number(removeGroupSeparators(value) ?? 0);
  const btcAmount = purchaseAmount / bitcoinQuote.value;
  const feeAmount = Number(removeGroupSeparators(value) ?? 0) * purchaseFee;
  const totalAmount = purchaseAmount + feeAmount;

  const isValid = purchaseAmount > 0 && accountBalance.value >= totalAmount;

  const context: BitcoinFormContextValue = {
    accountBalance,
    bitcoinQuote,
    btcAmount,
    feeAmount,
    isValid,
    purchaseAmount,
    purchaseFee,
    setValue,
    totalAmount,
    value,
  };

  return (
    <BitcoinFormContext.Provider value={context}>
      <form {...props} />
    </BitcoinFormContext.Provider>
  );
}

type BitcoinFormInputProps = React.ComponentProps<"input">;

export function BitcoinFormInput({
  className,
  onChange,
  ...props
}: BitcoinFormInputProps) {
  const { value, setValue } = useBitcoinForm();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    if (event.defaultPrevented) return;

    const numericValue = removeGroupSeparators(event.currentTarget.value);

    const [integer = "", fraction = ""] = numericValue
      .split(decimalSeparator)
      .map((i) => removeNonDigits(i));

    const formattedInteger =
      integer.length > 0 ? decimalFormatter.format(Number(integer)) : "";

    const nextValue = numericValue.includes(decimalSeparator)
      ? `${formattedInteger}${decimalSeparator}${fraction}`
      : formattedInteger;

    setValue(nextValue);
  }

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (event.currentTarget.previousSibling instanceof HTMLElement) {
      event.currentTarget.previousSibling.focus();
    }
  }

  return (
    <div className={cn("flex items-center justify-start", className)}>
      <input
        data-slot="bitcoin-form-input"
        className="placeholder-foreground caret-primary field-sizing-content h-7 min-w-[1ch] text-lg outline-0"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0"
        onChange={handleChange}
        value={value}
        size={Math.max(value.length, 1)}
        {...props}
      />
      <button
        data-slot="bitcoin-form-input-currency"
        type="button"
        onClick={handleClick}
        className="text-muted-foreground h-7 w-full flex-1 cursor-text text-left text-lg"
        tabIndex={-1}
      >
        {currency}
      </button>
    </div>
  );
}

type BitcoinFormLabelProps = React.ComponentProps<"label">;

export function BitcoinFormLabel({
  className,
  htmlFor,
  children,
  ...props
}: BitcoinFormLabelProps) {
  const { btcAmount, isValid, purchaseAmount } = useBitcoinForm();

  const isError = purchaseAmount > 0 && !isValid;

  return (
    <label
      className={cn(
        "text-muted-foreground",
        isError && "text-destructive",
        className,
      )}
      htmlFor={htmlFor}
      {...props}
    >
      {(children ?? isError)
        ? "Not enough balance."
        : `≈ ${btcAmount.toFixed(3)} BTC`}
    </label>
  );
}

type BitcoinFormDetailsProps = Omit<React.ComponentProps<"div">, "children">;

export function BitcoinFormDetails(props: BitcoinFormDetailsProps) {
  const { accountBalance, feeAmount } = useBitcoinForm();

  return (
    <div {...props}>
      <div data-slot="bitcoin-form-details-available">
        <span className="text-muted-foreground">Available:</span>{" "}
        {currencyFormatter.format(accountBalance.value)}
      </div>
      <div data-slot="bitcoin-form-details-fee">
        <span className="text-muted-foreground">Fee (2%):</span>{" "}
        {currencyFormatter.format(feeAmount)}
      </div>
    </div>
  );
}

type BitcoinFormTotalProps = Omit<React.ComponentProps<"div">, "children">;

export function BitcoinFormTotal(props: BitcoinFormTotalProps) {
  const { totalAmount } = useBitcoinForm();

  return (
    <div {...props}>
      <span className="text-muted-foreground">Total:</span>{" "}
      {currencyFormatter.format(totalAmount)}
    </div>
  );
}

type BitcoinFormSubmitButtonProps = Omit<
  React.ComponentProps<"button">,
  "children"
>;

export function BitcoinFormSubmitButton(props: BitcoinFormSubmitButtonProps) {
  const { isValid } = useBitcoinForm();

  return (
    <Button
      disabled={!isValid}
      className="w-full"
      type="submit"
      variant="default"
      {...props}
    >
      Buy Bitcoin
    </Button>
  );
}

function useBitcoinForm() {
  const context = React.useContext(BitcoinFormContext);
  if (!context) throw new Error("BitcoinFormContext.Provider is missing.");
  return context;
}
