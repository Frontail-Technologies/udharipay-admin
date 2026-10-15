export type ResolveMockEnachBodyOutcome = typeof ResolveMockEnachBodyOutcome[keyof typeof ResolveMockEnachBodyOutcome];
export const ResolveMockEnachBodyOutcome = {
    authorized: 'authorized',
    rejected: 'rejected',
    cancelled: 'cancelled',
} as const;
export type ResolveMockEnachBody = {
    outcome: ResolveMockEnachBodyOutcome;
};
export type ResolveMockEnach200Data = {
    mandateStatus: string;
};
export type ResolveMockEnach200 = {
    data: ResolveMockEnach200Data;
};
