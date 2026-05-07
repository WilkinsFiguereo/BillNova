import type { BillnovaUser, ResUser } from "../types/user.types";

export const mockResUsers: ResUser[] = [
  { id: 1, name: "Juan Ramirez", login: "juan.ramirez", email: "juan.ramirez@empresa.com", role: "admin", active: true },
  { id: 2, name: "Maria Jimenez", login: "maria.jimenez", email: "maria.jimenez@empresa.com", role: "admin", active: true },
  { id: 3, name: "Carlos Mendoza", login: "carlos.mendoza", email: "carlos.mendoza@empresa.com", role: "moderation", active: true },
  { id: 4, name: "Laura Castillo", login: "laura.castillo", email: "laura.castillo@empresa.com", role: "seller", active: false },
  { id: 5, name: "Pedro Alcantara", login: "pedro.alcantara", email: "pedro.alcantara@empresa.com", role: "seller", active: true },
  { id: 6, name: "Sofia Nunez", login: "sofia.nunez", email: "sofia.nunez@empresa.com", role: "user", active: true },
];

export const mockBillnovaUsers: BillnovaUser[] = [
  { id: 101, name: "Juan Ramirez", login: "juan.ramirez@empresa.com", email: "juan.ramirez@empresa.com", role: "admin", active: true, phone: "8090000001", address: "Zona 1", is_mobile_user: false, res_user_id: 1 },
  { id: 102, name: "Maria Jimenez", login: "maria.jimenez@empresa.com", email: "maria.jimenez@empresa.com", role: "moderation", active: true, phone: "8090000002", address: "Zona 2", is_mobile_user: false, res_user_id: 2 },
  { id: 103, name: "Carlos Mendoza", login: "carlos.mendoza@empresa.com", email: "carlos.mendoza@empresa.com", role: "seller", active: true, phone: "8090000003", address: "Zona 3", is_mobile_user: true, res_user_id: 3 },
  { id: 104, name: "Laura Castillo", login: "laura.castillo@empresa.com", email: "laura.castillo@empresa.com", role: "user", active: false, phone: "8090000004", address: "Zona 4", is_mobile_user: false, res_user_id: 4 },
  { id: 105, name: "Pedro Alcantara", login: "pedro.alcantara@empresa.com", email: "pedro.alcantara@empresa.com", role: "seller", active: true, phone: "8090000005", address: "Zona 5", is_mobile_user: true, res_user_id: 5 },
  { id: 106, name: "Sofia Nunez", login: "sofia.nunez@empresa.com", email: "sofia.nunez@empresa.com", role: "user", active: true, phone: "8090000006", address: "Zona 6", is_mobile_user: false, res_user_id: 6 },
];
