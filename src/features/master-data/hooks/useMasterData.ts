"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listBankAccountTypes,
  listBusinessCategories,
  listCountries,
  listCustomerIdTypes,
  listMandateMethods,
  listStates,
  updateBankAccountType,
  updateBusinessCategory,
  updateCountry,
  updateCustomerIdType,
  updateMandateMethod,
  updateState,
  createState,
} from "@/api/generated/master-data";
import type {
  UpdateBankAccountTypeBody,
  UpdateBusinessCategoryBody,
  UpdateCountryBody,
  UpdateCustomerIdTypeBody,
  UpdateMandateMethodBody,
  UpdateStateBody,
  CreateStateBody,
} from "@/api/generated/contracts/master-data";

export const masterDataKeys = {
  all: ["master-data"] as const,
  countries: () => [...masterDataKeys.all, "countries"] as const,
  states: (countryId: string) => [...masterDataKeys.all, "states", countryId] as const,
  businessCategories: () => [...masterDataKeys.all, "business-categories"] as const,
  bankAccountTypes: () => [...masterDataKeys.all, "bank-account-types"] as const,
  customerIdTypes: () => [...masterDataKeys.all, "customer-id-types"] as const,
  mandateMethods: () => [...masterDataKeys.all, "mandate-methods"] as const,
};

const ALL_PARAMS = { params: { all: "true" } };

export function useCountries() {
  return useQuery({
    queryKey: masterDataKeys.countries(),
    queryFn: ({ signal }) => listCountries({ ...ALL_PARAMS, signal }),
  });
}

export function useStates(countryId: string) {
  return useQuery({
    queryKey: masterDataKeys.states(countryId),
    queryFn: ({ signal }) => listStates(countryId, { ...ALL_PARAMS, signal }),
    enabled: Boolean(countryId),
  });
}

export function useBusinessCategories() {
  return useQuery({
    queryKey: masterDataKeys.businessCategories(),
    queryFn: ({ signal }) => listBusinessCategories({ ...ALL_PARAMS, signal }),
  });
}

export function useBankAccountTypes() {
  return useQuery({
    queryKey: masterDataKeys.bankAccountTypes(),
    queryFn: ({ signal }) => listBankAccountTypes({ ...ALL_PARAMS, signal }),
  });
}

export function useCustomerIdTypes() {
  return useQuery({
    queryKey: masterDataKeys.customerIdTypes(),
    queryFn: ({ signal }) => listCustomerIdTypes({ ...ALL_PARAMS, signal }),
  });
}

export function useMandateMethods() {
  return useQuery({
    queryKey: masterDataKeys.mandateMethods(),
    queryFn: ({ signal }) => listMandateMethods({ ...ALL_PARAMS, signal }),
  });
}

export function useUpdateCountry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCountryBody }) => updateCountry(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: masterDataKeys.countries() });
      toast.success("Country updated");
    },
  });
}

export function useUpdateState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateStateBody }) => updateState(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: masterDataKeys.all });
      toast.success("State updated");
    },
  });
}

export function useCreateState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateStateBody) => createState(body),
    onSuccess: async (_, body) => { await queryClient.invalidateQueries({ queryKey: masterDataKeys.states(body.countryId) }); toast.success("State created"); }
  });
}

export function useUpdateBusinessCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBusinessCategoryBody }) => updateBusinessCategory(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: masterDataKeys.businessCategories() });
      toast.success("Business category updated");
    },
  });
}

export function useUpdateBankAccountType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBankAccountTypeBody }) => updateBankAccountType(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: masterDataKeys.bankAccountTypes() });
      toast.success("Bank account type updated");
    },
  });
}

export function useUpdateCustomerIdType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCustomerIdTypeBody }) => updateCustomerIdType(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: masterDataKeys.customerIdTypes() });
      toast.success("Customer ID type updated");
    },
  });
}

export function useUpdateMandateMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateMandateMethodBody }) => updateMandateMethod(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: masterDataKeys.mandateMethods() });
      toast.success("Mandate method updated");
    },
  });
}
