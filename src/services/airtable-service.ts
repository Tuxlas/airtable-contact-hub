import { toast } from "@/hooks/use-toast";

// Variables de entorno
const AIRTABLE_ACCESS_TOKEN = import.meta.env.VITE_AIRTABLE_ACCESS_TOKEN!;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID!;
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

// Tipos de registros
export type AirtableRecord<T> = {
  id: string;
  fields: T;
  createdTime: string;
};

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
  TarjetaEscaneada?: any[];
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

// Campos válidos para cada tabla
const RECORD_FIELDS = {
  Contactos: [
    "Nombre", "Apellidos", "Cargo", "Email", "Telefono",
    "Empresa", "Sede", "Sector", "Direccion", "Ciudad", "Pais",
    "Fuente", "TarjetaEscaneada", "FechaCreacion", "WebEmpresa", "SectorName"
  ],
  Empresas: [
    "NombreEmpresa", "Sector", "WebEmpresa", "Sedes", "NumeroSedes",
    "Tags", "NumeroContactos", "Contactos", "FechaCreacion"
  ],
  Sedes: [
    "Ciudad", "Empresa", "Pais", "Direccion", "TotalContactos", "Contactos"
  ],
  Sectores: [
    "NombreSector", "Empresas", "NumeroEmpresas", "Contactos"
  ]
};

// Sanitizar registros antes de enviar
export const sanitizeRecord = (tableName: keyof typeof RECORD_FIELDS, data: any) => {
  const allowedFields = RECORD_FIELDS[tableName];
  const sanitized: any = {};

  // Campos vinculados que deben ser siempre arrays
  const LINKED_FIELDS = ["Empresa", "Sede", "Sector", "WebEmpresa", "SectorName"];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== "") {
      let value = data[field];

      // Si es un array, sanitizar posibles objetos con id
      if (Array.isArray(value)) {
        value = value.map((item) => {
          if (typeof item === "object" && item?.id) {
            return item.id; // Solo dejar ID
          }
          return item;
        });
      }

      // Forzar arrays en campos vinculados aunque venga como string
      if (LINKED_FIELDS.includes(field)) {
        if (!Array.isArray(value)) {
          value = [value];
        }
      }

      sanitized[field] = value;
    }
  });

  return sanitized;
};

// Servicio de Airtable CRUD
export const airtableService = {
  async fetchRecords<T>(tableName: keyof typeof RECORD_FIELDS): Promise<AirtableRecord<T>[]> {
    try {
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}`, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Error fetching records");
      const data = await response.json();
      return data.records;
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudieron obtener registros de ${tableName}`,
        variant: "destructive",
      });
      return [];
    }
  },

  async fetchRecord<T>(tableName: keyof typeof RECORD_FIELDS, recordId: string): Promise<AirtableRecord<T> | null> {
    if (!recordId || typeof recordId !== "string") return null;

    try {
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}/${recordId}`, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Error fetching record");
      const data = await response.json();
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo obtener el registro de ${tableName}`,
        variant: "destructive",
      });
      return null;
    }
  },

  async createRecord<T>(tableName: keyof typeof RECORD_FIELDS, fields: T): Promise<AirtableRecord<T> | null> {
    try {
      const sanitizedFields = sanitizeRecord(tableName, fields);
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: sanitizedFields }),
      });
      if (!response.ok) throw new Error("Error creating record");
      const data = await response.json();
      toast({ title: "Éxito", description: `Registro creado en ${tableName}` });
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo crear el registro en ${tableName}`,
        variant: "destructive",
      });
      return null;
    }
  },

  async updateRecord<T>(tableName: keyof typeof RECORD_FIELDS, recordId: string, fields: Partial<T>): Promise<AirtableRecord<T> | null> {
    try {
      const sanitizedFields = sanitizeRecord(tableName, fields);
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}/${recordId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: sanitizedFields }),
      });
      if (!response.ok) throw new Error("Error updating record");
      const data = await response.json();
      toast({ title: "Éxito", description: `Registro actualizado en ${tableName}` });
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo actualizar el registro en ${tableName}`,
        variant: "destructive",
      });
      return null;
    }
  },

  async deleteRecord(tableName: keyof typeof RECORD_FIELDS, recordId: string): Promise<boolean> {
    try {
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}/${recordId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Error deleting record");
      toast({ title: "Éxito", description: `Registro eliminado de ${tableName}` });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar el registro de ${tableName}`,
        variant: "destructive",
      });
      return false;
    }
  },
};












