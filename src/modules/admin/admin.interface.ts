export interface IBlockUnblockUserPayload {
  status: "ACTIVE" | "BLOCKED" | "SUSPENDED" | "DELETED";
}
