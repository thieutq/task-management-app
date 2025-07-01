import useAuth from "@/services/auth/use-auth";
import { RoleEnum } from "@/services/api/types/role";

export function useUserRole() {
  const { user } = useAuth();
  return {
    isEmployee: user?.role?.id === RoleEnum.EMPLOYEE,
    isEmployer: user?.role?.id === RoleEnum.EMPLOYER,
    isAdmin: user?.role?.id === RoleEnum.ADMIN,
    isUser: user?.role?.id === RoleEnum.USER,
    user,
  };
}
