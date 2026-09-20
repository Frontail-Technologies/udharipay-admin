export type GetHealth200DataStatus = typeof GetHealth200DataStatus[keyof typeof GetHealth200DataStatus];
export const GetHealth200DataStatus = {
    ok: 'ok',
} as const;
export type GetHealth200Data = {
    status: GetHealth200DataStatus;
    timestamp: string;
};
export type GetHealth200 = {
    data: GetHealth200Data;
};
