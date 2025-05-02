import { toast } from "@/hooks/use-toast";

// Configuración
const AIRTABLE_ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

export type AirtableRecord<T> = {
  id: string;
  createdTime: string;
  fields: T;
};

// Tipos por tabla
export type ContactRecord = {
  Nombre?: string;
  Apellidos?: string;
  Cargo?: string;
  Email?: string;
  Telefono?: number;
  Empresa?: string[];
  Sede?: string[];
  Sector?: string[];
  Direccion?: string;
  Ciudad?: string;
  Pais?: string;
  Fuente?: string;
  TarjetaEscaneada?: { url: string }[];
  FechaCreacion?: string;
  WebEmpresa?: string[];
  SectorName?: string[];
};

export type CompanyRecord = {
  NombreEmpresa?: string;
  Sector?: string[];
  WebEmpresa?: string[];
  Sedes?: string[];
  NumeroSedes?: number;
  Tags?: string[];
  NumeroContactos?: number;
  Contactos?: string[];
  FechaCreacion?: string;
};

export type SedeRecord = {
  Ciudad?: string;
  Empresa?: string[];
  Pais?: string;
  Direccion?: string;
  TotalContactos?: number;
  Contactos?: string[];
};

export type SectorRecord = {
  NombreSector?: string;
  Empresas?: string[];
  NumeroEmpresas?: number;
  Contactos?: string[];
};

// Campos permitidos por tabla
const RECORD_FIELDS = {
  Contactos: [
    "Nombre", "Apellidos", "Cargo", "Email", "Telefono", "Empresa", "Sede", "Sector", "Direccion", "Ciudad",
    "Pais", "Fuente", "TarjetaEscaneada", "FechaCreacion", "WebEmpresa", "SectorName"
  ],
  Empresas: [
    "NombreEmpresa", "Sector", "WebEmpresa", "Sedes", "NumeroSedes", "Tags", "NumeroContactos", "Contactos", "FechaCreacion"
  ],
  Sedes: [
    "Ciudad", "Empresa", "Pais", "Direccion", "TotalContactos", "Contactos"
  ],
  Sectores: [
    "NombreSector", "Empresas", "NumeroEmpresas", "Contactos"
  ]
};

// ---------------------------
// Sanitizer (exportado correctamente)
// ---------------------------
export const sanitizeRecord = (tableName: keyof typeof RECORD_FIELDS, data: any) => {
  const allowedFields = RECORD_FIELDS[tableName];
  const sanitized: any = {};
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      sanitized[field] = data[field];
    }
  });
  return sanitized;
};

// ---------------------------
// Airtable CRUD Service
// ---------------------------
export const airtableService = {
  // GET all records
  async fetchRecords<T>(tableName: keyof typeof RECORD_FIELDS): Promise<AirtableRecord<T>[]> {
    try {
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}`, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error(`Error fetching ${tableName}`);

      const data = await response.json();
      return data.records;
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudieron cargar los datos de ${tableName}.`,
        variant: "destructive",
      });
      return [];
    }
  },

  // GET single record
  async fetchRecord<T>(tableName: keyof typeof RECORD_FIELDS, recordId: string): Promise<AirtableRecord<T> | null> {
    try {
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}/${recordId}`, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error(`Error fetching record`);

      const data = await response.json();
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo cargar el registro.`,
        variant: "destructive",
      });
      return null;
    }
  },

  // CREATE record
  async createRecord<T>(tableName: keyof typeof RECORD_FIELDS, fields: T): Promise<AirtableRecord<T> | null> {
    try {
      const sanitizedFields = sanitizeRecord(tableName, fields);
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [{ fields: sanitizedFields }],
        }),
      });
      if (!response.ok) throw new Error(`Error creating record`);

      const data = await response.json();
      toast({
        title: "Éxito",
        description: `Registro creado en ${tableName}.`,
      });
      return data.records[0];
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo crear el registro en ${tableName}.`,
        variant: "destructive",
      });
      return null;
    }
  },

  // UPDATE record
  async updateRecord<T>(tableName: keyof typeof RECORD_FIELDS, recordId: string, fields: Partial<T>): Promise<AirtableRecord<T> | null> {
    try {
      const sanitizedFields = sanitizeRecord(tableName, fields);
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [{ id: recordId, fields: sanitizedFields }],
        }),
      });
      if (!response.ok) throw new Error(`Error updating record`);

      const data = await response.json();
      toast({
        title: "Éxito",
        description: `Registro actualizado en ${tableName}.`,
      });
      return data.records[0];
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo actualizar el registro en ${tableName}.`,
        variant: "destructive",
      });
      return null;
    }
  },

  // DELETE record
  async deleteRecord(tableName: keyof typeof RECORD_FIELDS, recordId: string): Promise<boolean> {
    try {
      const url = new URL(`${AIRTABLE_API_URL}/${tableName}`);
      url.searchParams.append("records[]", recordId);

      const response = await fetch(url.toString(), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error(`Error deleting record`);

      toast({
        title: "Éxito",
        description: `Registro eliminado de ${tableName}.`,
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar el registro.`,
        variant: "destructive",
      });
      return false;
    }
  },
};








