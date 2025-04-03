
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value = "",
  onChange,
  disabled = false,
  className,
  label,
  placeholder = "00:00",
}) => {
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    if (onChange) {
      onChange(timeValue);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <Input
        type="time"
        value={value}
        onChange={handleTimeChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
};
