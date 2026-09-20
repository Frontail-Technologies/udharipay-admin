import type { CursorPagination } from "../common";
export interface AuditEvent {
    id: string;
    actorUserId: string | null;
    actorRole: string | null;
    requestId: string | null;
    action: string;
    entityType: string;
    entityId: string;
    changes?: unknown;
    metadata?: unknown;
    createdAt: string;
}
export type ListAuditEventsParams = {
    limit?: number;
    cursor?: string;
    action?: string;
    actorUserId?: string;
    entityType?: string;
    entityId?: string;
    dateFrom?: string;
    dateTo?: string;
};
export type ListAuditEvents200Data = {
    items: AuditEvent[];
    pagination: CursorPagination;
};
export type ListAuditEvents200 = {
    data: ListAuditEvents200Data;
};
export type GetAuditEvent200 = {
    data: AuditEvent;
};
