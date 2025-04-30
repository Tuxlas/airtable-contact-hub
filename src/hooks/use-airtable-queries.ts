
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  airtableService,
  ContactRecord,
  CompanyRecord,
  SedeRecord,
  SectorRecord,
  AirtableRecord,
} from "@/services/airtable-service";

// Table names
export const TABLES = {
  CONTACTS: "Contactos",
  COMPANIES: "Empresas",
  LOCATIONS: "Sedes",
  SECTORS: "Sectores",
};

// Contacts hooks
export const useContacts = () => {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: () => airtableService.fetchRecords<ContactRecord>(TABLES.CONTACTS),
  });
};

export const useContact = (id: string) => {
  return useQuery({
    queryKey: ["contact", id],
    queryFn: () => airtableService.fetchRecord<ContactRecord>(TABLES.CONTACTS, id),
    enabled: !!id,
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contact: ContactRecord) =>
      airtableService.createRecord<ContactRecord>(TABLES.CONTACTS, contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

export const useUpdateContact = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contact: Partial<ContactRecord>) =>
      airtableService.updateRecord<ContactRecord>(TABLES.CONTACTS, id, contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact", id] });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => airtableService.deleteRecord(TABLES.CONTACTS, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

// Companies hooks
export const useCompanies = () => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: () => airtableService.fetchRecords<CompanyRecord>(TABLES.COMPANIES),
  });
};

export const useCompany = (id: string) => {
  return useQuery({
    queryKey: ["company", id],
    queryFn: () => airtableService.fetchRecord<CompanyRecord>(TABLES.COMPANIES, id),
    enabled: !!id,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (company: CompanyRecord) =>
      airtableService.createRecord<CompanyRecord>(TABLES.COMPANIES, company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

export const useUpdateCompany = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (company: Partial<CompanyRecord>) =>
      airtableService.updateRecord<CompanyRecord>(TABLES.COMPANIES, id, company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company", id] });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => airtableService.deleteRecord(TABLES.COMPANIES, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

// Locations hooks
export const useLocations = () => {
  return useQuery({
    queryKey: ["locations"],
    queryFn: () => airtableService.fetchRecords<SedeRecord>(TABLES.LOCATIONS),
  });
};

export const useLocation = (id: string) => {
  return useQuery({
    queryKey: ["location", id],
    queryFn: () => airtableService.fetchRecord<SedeRecord>(TABLES.LOCATIONS, id),
    enabled: !!id,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (location: SedeRecord) =>
      airtableService.createRecord<SedeRecord>(TABLES.LOCATIONS, location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};

export const useUpdateLocation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (location: Partial<SedeRecord>) =>
      airtableService.updateRecord<SedeRecord>(TABLES.LOCATIONS, id, location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      queryClient.invalidateQueries({ queryKey: ["location", id] });
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => airtableService.deleteRecord(TABLES.LOCATIONS, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};

// Sectors hooks
export const useSectors = () => {
  return useQuery({
    queryKey: ["sectors"],
    queryFn: () => airtableService.fetchRecords<SectorRecord>(TABLES.SECTORS),
  });
};

export const useSector = (id: string) => {
  return useQuery({
    queryKey: ["sector", id],
    queryFn: () => airtableService.fetchRecord<SectorRecord>(TABLES.SECTORS, id),
    enabled: !!id,
  });
};

export const useCreateSector = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sector: SectorRecord) =>
      airtableService.createRecord<SectorRecord>(TABLES.SECTORS, sector),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sectors"] });
    },
  });
};

export const useUpdateSector = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sector: Partial<SectorRecord>) =>
      airtableService.updateRecord<SectorRecord>(TABLES.SECTORS, id, sector),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sectors"] });
      queryClient.invalidateQueries({ queryKey: ["sector", id] });
    },
  });
};

export const useDeleteSector = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => airtableService.deleteRecord(TABLES.SECTORS, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sectors"] });
    },
  });
};

// Dashboard data hook
export const useDashboardData = () => {
  const contactsQuery = useContacts();
  const companiesQuery = useCompanies();
  const locationsQuery = useLocations();
  const sectorsQuery = useSectors();

  const isLoading =
    contactsQuery.isLoading ||
    companiesQuery.isLoading ||
    locationsQuery.isLoading ||
    sectorsQuery.isLoading;

  const isError =
    contactsQuery.isError ||
    companiesQuery.isError ||
    locationsQuery.isError ||
    sectorsQuery.isError;

  const data = {
    totalContacts: contactsQuery.data?.length || 0,
    totalCompanies: companiesQuery.data?.length || 0,
    totalLocations: locationsQuery.data?.length || 0,
    totalSectors: sectorsQuery.data?.length || 0,
    recentContacts: contactsQuery.data
      ?.sort(
        (a, b) =>
          new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
      )
      .slice(0, 5),
    companiesBySector: sectorsQuery.data?.map((sector) => ({
      name: sector.fields.Nombre || "Sin nombre",
      count: (sector.fields["Empresas Relacionadas"]?.length || 0),
    })),
  };

  return {
    isLoading,
    isError,
    data,
  };
};

// Utility hook to get the record data by ID from a list
export function useGetRecordById<T>(
  records: AirtableRecord<T>[] | undefined,
  id: string
): T | undefined {
  if (!records || !id) return undefined;
  const record = records.find((r) => r.id === id);
  return record?.fields;
}
