"use client";

import { useTransition } from "react";
import {
  accountantCreateFeeSchema,
  AccountantCreateFeeSchemaType,
} from "../schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tryCatch } from "@/hooks/tryCatch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SemesterFeeStatus } from "@/lib/generated/prisma/enums";
import { formatEnumLabel } from "@/lib/utils";
import { AccountantGetAllSemestersType } from "@/app/data/accountant/acc-get-all-semesters";
import { FeeInstallmentsFormFields } from "@/app/(accountant)/accountant/_components/fee-installments-form-fields";
import { accountantCreateSemesterFee } from "../../actions";
import { useRouter } from "next/navigation";

export const AccountantCreateFeeForm = ({
  semesters,
}: {
  semesters: AccountantGetAllSemestersType;
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<AccountantCreateFeeSchemaType>({
    resolver: zodResolver(accountantCreateFeeSchema),
    defaultValues: {
      description: "",
      semesterId: "",
      status: "DRAFT",
      totalAmount: 0,
      makeInstallments: false,
      installments: undefined,
    },
    mode: "onChange",
  });

  function onSubmit(values: AccountantCreateFeeSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        accountantCreateSemesterFee(values)
      );
      if (error) {
        toast.error("Something bad happened. Please try again.");
        return;
      }
      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.status === "success") {
        form.reset();
        router.push("/accountant/manage-fee");
        toast.success(result.message);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid sm:grid-cols-2 w-full sm:gap-4 gap-2 items-baseline">
          <FormField
            name="semesterId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="semester">Semester</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger id="semester" className="w-full">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {semesters.map((sem) => (
                      <SelectItem key={sem.id} value={sem.id}>
                        <span>{`Sem: ${sem.semester}-${sem.batch}${sem.year.toString().slice(-2)}-${sem.program}${sem.department}`}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="status"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="status">Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(SemesterFeeStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        <span>{formatEnumLabel(status)}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="totalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="total">Total Fee</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="total"
                  type="number"
                  placeholder="10,000"
                  value={field.value || ""}
                  step={50}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="description">Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  id="description"
                  placeholder="Description (optional)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FeeInstallmentsFormFields form={form} />

        <div className="flex flex-row gap-2 sm:gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset form
          </Button>
          <Button disabled={isPending} type="submit">
            {isPending ? (
              <>
                <Loader2 className="animate-spin size-4" />
                Creating...
              </>
            ) : (
              "Create Fee"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
