import type { ResUser, BillnovaUser } from "../types/user.types";

export const mockResUsers: ResUser[] = [
  { id: 1, name: "Juan Ramírez", email: "juan.ramirez@empresa.com", role: "admin", active: true },
  { id: 2, name: "María Jiménez", email: "maria.jimenez@empresa.com", role: "admin", active: true },
  { id: 3, name: "Carlos Mendoza", email: "carlos.mendoza@empresa.com", role: "editor", active: true },
  { id: 4, name: "Laura Castillo", email: "laura.castillo@empresa.com", role: "viewer", active: false },
  { id: 5, name: "Pedro Alcántara", email: "pedro.alcantara@empresa.com", role: "editor", active: true },
  { id: 6, name: "Sofía Núñez", email: "sofia.nunez@empresa.com", role: "viewer", active: true },
];

export const mockBillnovaUsers: BillnovaUser[] = [
  { id: 101, name: "Juan Ramírez", email: "juan.ramirez@empresa.com", role: "billing", active: true },
  { id: 102, name: "María Jiménez", email: "maria.jimenez@empresa.com", role: "viewer", active: true },
  { id: 103, name: "Carlos Mendoza", email: "carlos.mendoza@empresa.com", role: "support", active: true },
  { id: 104, name: "Laura Castillo", email: "laura.castillo@empresa.com", role: "viewer", active: false },
  { id: 105, name: "Pedro Alcántara", email: "pedro.alcantara@empresa.com", role: "billing", active: true },
  { id: 106, name: "Sofía Núñez", email: "sofia.nunez@empresa.com", role: "viewer", active: true },
];
