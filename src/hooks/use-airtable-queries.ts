import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  airtableService,
  ContactRecord,
  CompanyRecord,
  SedeRecord,
  SectorRecord,
  AirtableRecord,
  sanitizeRecord,
} from "@/services/airtable-service";

// Tabla nombres
export const TABLES = {
  CONTACTS: "Contactos",
  COMPANIES: "Empresas",
  LOCATIONS: "Sedes",
  SECTORS: "Sectores",
} as const;

// ---------------------------
// HELPERS → Mutations Factory
// ---------------------------

function useCreateRecord<T>(tableName: keyof typeof TABLES) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: T) => {
      const sanitizedData = sanitizeRecord(tableName, data);
      return airtableService.createRecord(tableName, sanitizedData);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [tableName] }),
  });
}

function useUpdateRecord<T>(tableName: keyof typeof TABLES, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<T>) => {
      const sanitizedData = sanitizeRecord(tableName, data);
      return airtableService.updateRecord(tableName, id, sanitizedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      queryClient.invalidateQueries({ queryKey: [tableName, id] });
    },
  });
}

function useDeleteRecord(tableName: keyof typeof TABLES) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => airtableService.deleteRecord(tableName, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [tableName] }),
  });
}

// ---------------------------
// CONTACTOS
// ---------------------------

export const useContacts = () =>
  useQuery({
    queryKey: [TABLES.CONTACTS],
    queryFn: () => airtableService.fetchRecords<ContactRecord>(TABLES.CONTACTS),
  });

export const useContact = (id: string) =>
  useQuery({
    queryKey: [TABLES.CONTACTS, id],
    queryFn: () =>
      id ? airtableService.fetchRecord<ContactRecord>(TABLES.CONTACTS, id) : Promise.resolve(null),
    enabled: !!id,
  });

export const useCreateContact = () => useCreateRecord<ContactRecord>(TABLES.CONTACTS);
export const useUpdateContact = (id: string) => useUpdateRecord<ContactRecord>(TABLES.CONTACTS, id);
export const useDeleteContact = () => useDeleteRecord(TABLES.CONTACTS);

// ---------------------------
// EMPRESAS
// ---------------------------

export const useCompanies = () =>
  useQuery({
    queryKey: [TABLES.COMPANIES],
    queryFn: () => airtableService.fetchRecords<CompanyRecord>(TABLES.COMPANIES),
  });

export const useCompany = (id: string) =>
  useQuery({
    queryKey: [TABLES.COMPANIES, id],
    queryFn: () =>
      id ? airtableService.fetchRecord<CompanyRecord>(TABLES.COMPANIES, id) : Promise.resolve(null),
    enabled: !!id,
  });

export const useCreateCompany = () => useCreateRecord<CompanyRecord>(TABLES.COMPANIES);
export const useUpdateCompany = (id: string) => useUpdateRecord<CompanyRecord>(TABLES.COMPANIES, id);
export const useDeleteCompany = () => useDeleteRecord(TABLES.COMPANIES);

// ---------------------------
// SEDES
// ---------------------------

export const useLocations = () =>
  useQuery({
    queryKey: [TABLES.LOCATIONS],
    queryFn: () => airtableService.fetchRecords<SedeRecord>(TABLES.LOCATIONS),
  });

export const useLocation = (id: string) =>
  useQuery({
    queryKey: [TABLES.LOCATIONS, id],
    queryFn: () =>
      id ? airtableService.fetchRecord<SedeRecord>(TABLES.LOCATIONS, id) : Promise.resolve(null),
    enabled: !!id,
  });

export const useCreateLocation = () => useCreateRecord<SedeRecord>(TABLES.LOCATIONS);
export const useUpdateLocation = (id: string) => useUpdateRecord<SedeRecord>(TABLES.LOCATIONS, id);
export const useDeleteLocation = () => useDeleteRecord(TABLES.LOCATIONS);

// ---------------------------
// SECTORES
// ---------------------------

export const useSectors = () =>
  useQuery({
    queryKey: [TABLES.SECTORS],
    queryFn: () => airtableService.fetchRecords<SectorRecord>(TABLES.SECTORS),
  });

export const useSector = (id: string) =>
  useQuery({
    queryKey: [TABLES.SECTORS, id],
    queryFn: () =>
      id ? airtableService.fetchRecord<SectorRecord>(TABLES.SECTORS, id) : Promise.resolve(null),
    enabled: !!id,
  });

export const useCreateSector = () => useCreateRecord<SectorRecord>(TABLES.SECTORS);
export const useUpdateSector = (id: string) => useUpdateRecord<SectorRecord>(TABLES.SECTORS, id);
export const useDeleteSector = () => useDeleteRecord(TABLES.SECTORS);

// ---------------------------
// DASHBOARD
// ---------------------------

export const useDashboardData = () => {
  const contacts = useContacts();
  const companies = useCompanies();
  const locations = useLocations();
  const sectors = useSectors();

  const isLoading =
    contacts.isLoading ||
    companies.isLoading ||
    locations.isLoading ||
    sectors.isLoading;

  const isError =
    contacts.isError ||
    companies.isError ||
    locations.isError ||
    sectors.isError;

  const data = {
    totalContacts: contacts.data?.length || 0,
    totalCompanies: companies.data?.length || 0,
    totalLocations: locations.data?.length || 0,
    totalSectors: sectors.data?.length || 0,
    recentContacts: contacts.data?.slice(0, 5) || [],
    companiesBySector: sectors.data?.map((sector) => ({
      name: sector.fields.NombreSector || "Sin nombre",
      count: sector.fields.Empresas?.length || 0,
    })) || [],
  };

  return { isLoading, isError, data };
};

// ---------------------------
// UTILITY
// ---------------------------

export function useGetRecordById<T>(
  records: AirtableRecord<T>[] | undefined,
  id: string
): T | undefined {
  return records?.find((r) => r.id === id)?.fields;
}





