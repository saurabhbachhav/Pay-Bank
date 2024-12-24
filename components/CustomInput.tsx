import React from "react";
import { Control, Controller } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface CustomInputProps {
  control: Control<any>; // Using `any` for dynamic schemas; adjust as needed
  name: string;
  label: string;
  placeholder: string;
}

const CustomInput = ({
  control,
  name,
  label,
  placeholder,
}: CustomInputProps) => {
  return (
    <div className="form-item">
      <FormLabel className="form-label">{label}</FormLabel>
      <div className="flex w-full flex-col">
        <FormControl>
          <Controller
            control={control}
            name={name}
            render={({ field, fieldState: { error } }) => (
              <>
                <Input
                  {...field}
                  placeholder={placeholder}
                  className="Input-class"
                  type={name ==='password'?'password':'text'}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error.message}</p>
                )}
              </>
            )}
          />
        </FormControl>
        {/* Dynamic error display */}
        <FormMessage />
      </div>
    </div>
  );
};

export default CustomInput;
