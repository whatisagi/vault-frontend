"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Toaster } from "./ui/toast";
import { toast } from "sonner";

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

  async function onSubmit(data: z.infer<typeof FormSchema>) {
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
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-[500px] border rounded-md p-10"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">First Name</FormLabel>
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
                <FormLabel className="text-foreground">Phone Number</FormLabel>
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
                <FormLabel className="text-foreground">
                  Corporation Number
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                    onBlur={async () => {
                      const value = field.value;
                      const regex = /^\d{9}$/;
                      if (!regex.test(value)) {
                        form.setError("corporationNumber", {
                          type: "value",
                          message: "Must be 9 digits",
                        });
                        return;
                      }

                      const response = await fetch(
                        `https://fe-hometask-api.dev.vault.tryvault.com/corporation-number/${value}`
                      );
                      if (!response.ok) {
                        form.setError("corporationNumber", {
                          type: "value",
                          message: "Invalid Corporation Number",
                        });
                      }
                    }}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit">
            Submit →
          </Button>
        </div>
      </form>
      <Toaster />
    </Form>
  );
}
