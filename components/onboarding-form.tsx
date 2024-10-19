"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCallback, useState } from "react";

const FormSchema = z.object({
  firstName: z
    .string()
    .min(1, {
      message: "Must be at least 1 character",
    })
    .max(50, {
      message: "Must not exceed 50 characters",
    }),
  lastName: z
    .string()
    .min(1, {
      message: "Must be at least 1 character",
    })
    .max(50, {
      message: "Must not exceed 50 characters",
    }),
  phone: z.string().regex(/^\+1\d{10}$/, {
    message:
      "Must start with +1 and contain exactly 10 digits after the country code.",
  }),
  // We could also use .refine here to make async get request to validate the
  // number. However, in order to avoid extra get requests (e.g. even when other
  // fields are being modified, we'll have this simple condition here, and have a
  // dedicated onBlur function for corporationNumber)
  corporationNumber: z.string().length(9, {
    message: "Must be 9 characters",
  }),
});

export function OnboardingForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      corporationNumber: "",
    },
    // This is so that form field is validated onBlur, before being submitted
    mode: "onBlur",
  });
  const [validatingCorporationNumber, setValidatingCorporationNumber] =
    useState(false);
  const [validatingForm, setValidatingForm] = useState(false);

  const onSubmit = useCallback(
    async (data: z.infer<typeof FormSchema>) => {
      setValidatingForm(true);
      try {
        const response = await fetch(
          "https://fe-hometask-api.dev.vault.tryvault.com/profile-details",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        if (response.ok || response.status === 200) {
          toast(
            "The form has been submitted successfully, with the following data",
            {
              description: (
                <pre className="mt-2 rounded-md p-4">
                  <code>{JSON.stringify(data, null, 2)}</code>
                </pre>
              ),
            }
          );
          form.reset();
        } else {
          const { message } = await response.json();
          if (message === "Invalid first name") {
            form.setError("firstName", { type: "value", message: message });
          } else if (message === "Invalid last name") {
            form.setError("lastName", { type: "value", message: message });
          } else if (message === "Invalid phone number") {
            form.setError("phone", { type: "value", message: message });
          } else if (message === "Invalid corporation number") {
            form.setError("corporationNumber", {
              type: "value",
              message: message,
            });
          }
        }
      } catch (error) {
        console.error(error);
        toast("Error submitting form", {
          description: "Unknown error",
        });
      } finally {
        setValidatingForm(false);
      }
    },
    [form]
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-[500px] border rounded-md p-10"
      >
        <fieldset disabled={validatingForm}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="corporationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground inline-flex items-center gap-2">
                    Corporation Number
                    {validatingCorporationNumber && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={validatingCorporationNumber}
                      placeholder=""
                      {...field}
                      // We handle onBlur here to avoid making get
                      // requests when other fields are editted
                      onBlur={async () => {
                        const value = field.value.trim();
                        const regex = /^\d{9}$/;
                        // We don't want to make get request when
                        // the input is not yet 9 digits
                        if (!regex.test(value)) {
                          form.setError("corporationNumber", {
                            type: "value",
                            message: "Must be 9 digits",
                          });
                          return;
                        }
                        setValidatingCorporationNumber(true);
                        try {
                          const response = await fetch(
                            `https://fe-hometask-api.dev.vault.tryvault.com/corporation-number/${value}`
                          );
                          if (!response.ok) {
                            const { valid, message } = await response.json();
                            if (!valid) {
                              form.setError("corporationNumber", {
                                type: "value",
                                message: message,
                              });
                            } else {
                              form.clearErrors("corporationNumber");
                            }
                          } else {
                            form.clearErrors("corporationNumber");
                          }
                        } catch (error) {
                          console.error(error);
                          form.setError("corporationNumber", {
                            type: "value",
                            message:
                              "Failed to validate corporation number. Please try again.",
                          });
                        } finally {
                          setValidatingCorporationNumber(false);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">
              Submit
              {validatingForm && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
