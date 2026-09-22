import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmProvider, useConfirm } from "./useConfirm";

function Consumer({ resolved, destructive = false }: { resolved: (value: boolean) => void; destructive?: boolean }) {
  const confirm = useConfirm();
  return <button onClick={() => void confirm({ title: "Confirm action", description: "This cannot be skipped.", destructive }).then(resolved)}>Open</button>;
}

describe("confirmation system", () => {
  it("resolves true only after explicit confirmation", async () => {
    const resolved = vi.fn();
    render(<ConfirmProvider><Consumer resolved={resolved} /></ConfirmProvider>);
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("Confirm action")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => expect(resolved).toHaveBeenCalledWith(true));
  });

  it("supports destructive confirmation and cancellation", async () => {
    const resolved = vi.fn();
    render(<ConfirmProvider><Consumer resolved={resolved} destructive /></ConfirmProvider>);
    fireEvent.click(screen.getByText("Open"));
    fireEvent.click(screen.getByText("Cancel"));
    await waitFor(() => expect(resolved).toHaveBeenCalledWith(false));
  });
});
