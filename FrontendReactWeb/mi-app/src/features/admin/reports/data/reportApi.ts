import type { Report, CreateReportPayload } from '../types/report.types';

const mockReports: Report[] = [
  {
    id: '1',
    title: 'Dashboard no carga correctamente',
    description: 'El dashboard tarda mucho en cargar y a veces muestra datos incompletos',
    category: 'bug',
    severity: 'high',
    status: 'in-progress',
    reporter: {
      id: '1',
      name: 'Carlos Mendoza',
      email: 'cmendoza@empresa.com',
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Agregar modo oscuro',
    description: 'Sería útil tener un modo oscuro para trabajar en la noche',
    category: 'feature',
    severity: 'low',
    status: 'open',
    reporter: {
      id: '2',
      name: 'Laura Ramírez',
      email: 'lramirez@gmail.com',
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Botones muy pequeños en mobile',
    description: 'Los botones son difíciles de tocar en dispositivos móviles',
    category: 'ui',
    severity: 'medium',
    status: 'open',
    reporter: {
      id: '3',
      name: 'Pedro Alcántara',
      email: 'pedro.alc@corp.do',
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Mejorar velocidad de búsqueda',
    description: 'La búsqueda de usuarios es muy lenta cuando hay muchos registros',
    category: 'performance',
    severity: 'medium',
    status: 'resolved',
    reporter: {
      id: '4',
      name: 'María Jiménez',
      email: 'mjimenez@outlook.com',
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function fetchReports(): Promise<Report[]> {
  // TODO: Reemplazar con API real
  // const response = await fetch('/api/reports');
  // return response.json();
  
  return mockReports;
}

export async function createReport(payload: CreateReportPayload): Promise<Report> {
  // TODO: Reemplazar con API real
  // const response = await fetch('/api/reports', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });
  // return response.json();

  const newReport: Report = {
    id: String(Date.now()),
    ...payload,
    status: 'open',
    reporter: {
      id: '1',
      name: 'Admin Demo',
      email: 'admin@billnova.com',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return newReport;
}

export async function getReportById(id: string): Promise<Report | null> {
  // TODO: Reemplazar con API real
  return mockReports.find(r => r.id === id) || null;
}
