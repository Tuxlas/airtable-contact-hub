import { toast } from "@/hooks/use-toast";

// 🔐 Personal Access Token → desde variables de entorno
const AIRTABLE_ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN!;

// 📌 BASE ID → fijo porque no cambiará
const AIRTABLE_BASE_ID = "appVbaOLrHQGOQlgC";
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

// ---------------------------
// TYPES
// ---------------------------

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
  TarjetaEscaneada?: string[]; // base64 o URL (sanitized later)
  FechaCreacion?: string;
  WebEmpresa?: string[]; // Lookup → se ignora en create/update
  SectorName?: string[]; // Lookup → se ignora en create/update
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

// ---------------------------
// SANITIZER GLOBAL
// ---------------------------

const RECORD_FIELDS = {
  Contactos: [
    "Nombre",
    "Apellidos",
    "Cargo",
    "Email",
    "Telefono",
    "Empresa",
    "Sede",
    "Sector",
    "Direccion",
    "Ciudad",
    "Pais",
    "Fuente",
    "TarjetaEscaneada",
    "FechaCreacion",
  ],
  Empresas: [
    "NombreEmpresa",
    "Sector",
    "WebEmpresa", // Lookup (ignored on create/update)
    "Sedes",
    "NumeroSedes",
    "Tags",
    "NumeroContactos",
    "Contactos",
    "FechaCreacion",
  ],
  Sedes: [
    "Ciudad",
    "Empresa",
    "Pais",
    "Direccion",
    "TotalContactos",
    "Contactos",
  ],
  Sectores: [
    "NombreSector",
    "Empresas",
    "NumeroEmpresas",
    "Contactos",
  ],
};

export const sanitizeRecord = (tableName: keyof typeof RECORD_FIELDS, data: any) => {
  const allowedFields = RECORD_FIELDS[tableName];
  const sanitized: any = {};

  allowedFields.forEach((field) => {
    const value = data[field];

    if (value !== undefined) {
      // Ignorar campos de solo lectura (WebEmpresa y SectorName)
      if (field === "WebEmpresa" || field === "SectorName") return;

      // TarjetaEscaneada debe tener formato de attachments
      if (field === "TarjetaEscaneada" && Array.isArray(value)) {
        sanitized[field] = value.map((v: string) => ({
          url: v,
        }));
      } else {
        sanitized[field] = value;
      }
    }
  });

  return sanitized;
};

// ---------------------------
// AIRTABLE SERVICE
// ---------------------------

export const airtableService = {
  async fetchRecords<T>(tableName: string): Promise<AirtableRecord<T>[]> {
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
        title: "Error de conexión",
        description: `No se pudieron cargar los datos de ${tableName}.`,
        variant: "destructive",
      });
      return [];
    }
  },

  async fetchRecord<T>(tableName: string, recordId: string): Promise<AirtableRecord<T> | null> {
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
        description: `No se pudo cargar el registro de ${tableName}.`,
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
        body: JSON.stringify({
          records: [{ fields: sanitizedFields }],
        }),
      });

      if (!response.ok) throw new Error(`Error creating record`);

      const data = await response.json();
      toast({
        title: "Éxito",
        description: `Registro creado en ${tableName}`,
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
        description: `Registro actualizado en ${tableName}`,
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

  async deleteRecord(tableName: string, recordId: string): Promise<boolean> {
    try {
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}/${recordId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Error deleting record`);

      toast({
        title: "Éxito",
        description: `Registro eliminado de ${tableName}`,
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar el registro de ${tableName}.`,
        variant: "destructive",
      });
      return false;
    }
  },

  async uploadImage(base64Image: string): Promise<string | null> {
    try {
      return base64Image;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      });
      return null;
    }
  },
};






