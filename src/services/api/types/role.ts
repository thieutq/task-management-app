export enum RoleEnum {
  ADMIN = 1,
  USER = 2,
  EMPLOYER = 3,
  EMPLOYEE = 4,
}

export type Role = {
  id: number | string;
  name?: string;
};
