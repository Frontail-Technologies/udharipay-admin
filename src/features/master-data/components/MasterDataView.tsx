"use client";

import { useState } from "react";
import { EntityTabs } from "@/components/entity/EntityTabs";
import { MasterDataTable } from "./MasterDataTable";
import { CitiesPanel, StatesPanel } from "./GeographyPanel";
import {
  useBankAccountTypes,
  useBusinessCategories,
  useCountries,
  useCustomerIdTypes,
  useMandateMethods,
  useUpdateBankAccountType,
  useUpdateBusinessCategory,
  useUpdateCountry,
  useUpdateCustomerIdType,
  useUpdateMandateMethod,
} from "../hooks/useMasterData";
import { normalizeApiError } from "@/api/http/errors";

const TABS = [
  { value: "business-categories", label: "Business Categories" },
  { value: "bank-account-types", label: "Bank Account Types" },
  { value: "customer-id-types", label: "Customer ID Types" },
  { value: "mandate-methods", label: "Mandate Methods" },
  { value: "countries", label: "Countries" },
  { value: "states", label: "States" },
  { value: "cities", label: "Cities" },
];

export function MasterDataView() {
  const [tab, setTab] = useState("business-categories");

  const businessCategories = useBusinessCategories();
  const bankAccountTypes = useBankAccountTypes();
  const customerIdTypes = useCustomerIdTypes();
  const mandateMethods = useMandateMethods();
  const countries = useCountries();

  const updateBusinessCategory = useUpdateBusinessCategory();
  const updateBankAccountType = useUpdateBankAccountType();
  const updateCustomerIdType = useUpdateCustomerIdType();
  const updateMandateMethod = useUpdateMandateMethod();
  const updateCountry = useUpdateCountry();

  function errorPanel(error: unknown) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">
        {normalizeApiError(error).message}
      </div>
    );
  }

  const panels = {
    "business-categories": businessCategories.isError ? errorPanel(businessCategories.error) : (
      <MasterDataTable
        items={businessCategories.data?.data.items ?? []}
        isLoading={businessCategories.isPending}
        updateMutation={updateBusinessCategory as never}
      />
    ),
    "bank-account-types": bankAccountTypes.isError ? errorPanel(bankAccountTypes.error) : (
      <MasterDataTable
        items={bankAccountTypes.data?.data.items ?? []}
        isLoading={bankAccountTypes.isPending}
        updateMutation={updateBankAccountType as never}
      />
    ),
    "customer-id-types": customerIdTypes.isError ? errorPanel(customerIdTypes.error) : (
      <MasterDataTable
        items={customerIdTypes.data?.data.items ?? []}
        isLoading={customerIdTypes.isPending}
        updateMutation={updateCustomerIdType as never}
      />
    ),
    "mandate-methods": mandateMethods.isError ? errorPanel(mandateMethods.error) : (
      <MasterDataTable
        items={mandateMethods.data?.data.items ?? []}
        isLoading={mandateMethods.isPending}
        updateMutation={updateMandateMethod as never}
      />
    ),
    "countries": countries.isError ? errorPanel(countries.error) : (
      <MasterDataTable
        items={countries.data?.data.items ?? []}
        isLoading={countries.isPending}
        updateMutation={updateCountry as never}
      />
    ),
    "states": <StatesPanel />,
    "cities": <CitiesPanel />,
  };

  return (
    <EntityTabs
      tabs={TABS}
      defaultValue="business-categories"
      value={tab}
      onValueChange={setTab}
      panels={panels}
    />
  );
}
