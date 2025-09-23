import React, { forwardRef, useState, useEffect } from "react";
import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { parseBrazilianNumber, cleanBrazilianNumberInput, isValidBrazilianNumber } from "@/utils/numberFormatter";

interface CurrencyInputProps extends Omit<InputProps, 'type' | 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  allowDecimal?: boolean;
  maxLength?: number;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, allowDecimal = true, maxLength = 15, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(value);

    // Sincronizar displayValue quando value externo muda
    useEffect(() => {
      setDisplayValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const cleanValue = cleanBrazilianNumberInput(newValue);

      // Limitar comprimento
      if (cleanValue.length > maxLength) {
        return;
      }

      // Se não permite decimal, remove vírgulas
      const finalValue = allowDecimal ? cleanValue : cleanValue.replace(/,.*/, '');

      // Sempre permitir valores vazios ou válidos
      if (finalValue === '' || isValidBrazilianNumber(finalValue)) {
        setDisplayValue(finalValue);
        onChange(finalValue);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Ao perder o foco, formatar o valor se for válido
      const numericValue = parseBrazilianNumber(displayValue);
      if (numericValue > 0) {
        const formatted = allowDecimal ?
          numericValue.toFixed(2).replace('.', ',') :
          Math.floor(numericValue).toString();
        setDisplayValue(formatted);
        onChange(formatted);
      }

      // Chamar onBlur original se existir
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Ao focar, pode manter o valor como está para edição
      if (props.onFocus) {
        props.onFocus(e);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={cn(className)}
        placeholder={allowDecimal ? "0,00" : "0"}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };