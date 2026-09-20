import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmProvider, useConfirm } from "./ConfirmProvider";

function Consumer({ resolved }: { resolved: (value: boolean) => void }) {
  const confirm = useConfirm();
  return <button onClick={() => void confirm({ title: "Confirm action", description: "This cannot be skipped." }).then(resolved)}>Open</button>;
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
});
